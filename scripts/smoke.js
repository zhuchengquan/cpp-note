#!/usr/bin/env node
/* ============================================================
   smoke.js —— 无头浏览器冒烟测试（零第三方依赖）
   自动寻找系统中的 Edge / Chrome，以 CDP 无头模式启动，
   打开本地页面，采集 console / JS 异常、运行内置断言、截图。

   用法：
     node scripts/serve.js 8123        # 另开一个终端
     node scripts/smoke.js             # 默认 http://localhost:8123/index.html
   ============================================================ */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const net = require('net');
const crypto = require('crypto');
const { spawn } = require('child_process');

const TARGET = process.argv[2] || 'http://localhost:8123/index.html';
const PORT = 9222;

const CANDIDATES_WIN = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];
const CANDIDATES_NIX = [
  '/usr/bin/microsoft-edge', '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
  '/usr/bin/chromium-browser', '/snap/bin/chromium',
];
const findBrowser = () => {
  const list = os.platform() === 'win32' ? CANDIDATES_WIN : CANDIDATES_NIX;
  return list.find((p) => fs.existsSync(p)) || null;
};
const getJSON = (url) => new Promise((resolve, reject) => {
  http.get(url, (res) => {
    let d = '';
    res.on('data', (c) => (d += c));
    res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
  }).on('error', reject);
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 极简 WebSocket 客户端（CDP 需要），仅实现文本帧收发 */
function createWS(wsUrl) {
  const u = new URL(wsUrl);
  const key = crypto.randomBytes(16).toString('base64');
  const sock = net.connect(u.port, u.hostname);
  const handlers = new Map();
  const waiters = new Map();
  let nextId = 1;
  let buf = Buffer.alloc(0);
  let handshaken = false;

  const sendFrame = (str) => {
    const payload = Buffer.from(str);
    const len = payload.length;
    let header;
    if (len < 126) header = Buffer.from([0x81, 0x80 | len]);
    else if (len < 65536) {
      header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(len, 2);
    } else {
      header = Buffer.alloc(10); header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(len), 2);
    }
    const mask = crypto.randomBytes(4);
    const masked = Buffer.alloc(len);
    for (let i = 0; i < len; i++) masked[i] = payload[i] ^ mask[i % 4];
    sock.write(Buffer.concat([header, mask, masked]));
  };
  const call = (method, params) => {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      waiters.set(id, { resolve, reject });
      sendFrame(JSON.stringify({ id, method, params: params || {} }));
    });
  };
  const on = (method, fn) => handlers.set(method, fn);
  const parseFrames = () => {
    while (buf.length >= 2) {
      const opcode = buf[0] & 0x0f;
      let len = buf[1] & 0x7f;
      let off = 2;
      if (len === 126) { len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { len = Number(buf.readBigUInt64BE(2)); off = 10; }
      if (buf.length < off + len) return;
      const payload = buf.slice(off, off + len).toString('utf8');
      buf = buf.slice(off + len);
      if (opcode === 1 || opcode === 0) {
        const msg = JSON.parse(payload);
        if (msg.id && waiters.has(msg.id)) {
          const w = waiters.get(msg.id); waiters.delete(msg.id);
          msg.error ? w.reject(new Error(msg.error.message)) : w.resolve(msg.result);
        } else if (msg.method && handlers.has(msg.method)) {
          handlers.get(msg.method)(msg.params);
        }
      }
    }
  };
  return new Promise((resolve, reject) => {
    sock.on('data', (chunk) => {
      if (!handshaken) {
        buf = Buffer.concat([buf, chunk]);
        const marker = buf.indexOf('\r\n\r\n');
        if (marker >= 0) {
          handshaken = true;
          buf = buf.slice(marker + 4);
          resolve({ call, on });
          parseFrames();
        }
        return;
      }
      buf = Buffer.concat([buf, chunk]);
      parseFrames();
    });
    sock.on('error', reject);
    sock.write(
      `GET ${u.pathname} HTTP/1.1\r\nHost: ${u.hostname}\r\nUpgrade: websocket\r\n` +
      `Connection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
  });
}

(async () => {
  const browserPath = findBrowser();
  if (!browserPath) { console.log('⚠️  未找到 Edge/Chrome，跳过无头冒烟测试'); process.exit(0); }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cppnote-smoke-'));
  const proc = spawn(browserPath, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, TARGET,
  ], { stdio: 'ignore' });

  let ver;
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try { ver = await getJSON(`http://127.0.0.1:${PORT}/json/version`); break; } catch (e) {}
  }
  if (!ver) { proc.kill(); console.log('❌ 无头浏览器启动超时'); process.exit(1); }

  await sleep(800);
  const pages = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = pages.find((p) => p.type === 'page' && p.url.startsWith('http')) || pages.find((p) => p.type === 'page');
  if (!page) { proc.kill(); console.log('❌ 未找到可调试页面'); process.exit(1); }
  const pws = await createWS(page.webSocketDebuggerUrl);

  await pws.call('Runtime.enable');
  await pws.call('Log.enable');
  await pws.call('Page.enable');
  const pageErrors = [];
  pws.on('Runtime.exceptionThrown', (p) => {
    const d = p.exceptionDetails;
    pageErrors.push((d && d.exception && d.exception.description) || (d && d.text) || 'exception');
  });
  pws.on('Runtime.consoleAPICalled', (p) => {
    if (p.type === 'error') pageErrors.push((p.args || []).map((a) => a.value || a.description || '').join(' '));
  });
  const netErrors = [];
  pws.on('Log.entryAdded', (p) => { if (p.entry && p.entry.level === 'error') netErrors.push(p.entry.text); });

  /* 等待首屏脚本执行完毕 */
  await sleep(3500);
  const evalJs = async (expr) => {
    const r = await pws.call('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  const checks = [];
  const check = (name, ok, info) => checks.push({ name, ok: !!ok, info: info || '' });

  /* ---------- 首页 / 全局 ---------- */
  check('全局数据对象存在', await evalJs('!!(window.OUTLINE && window.TOPICS && window.Store)'));
  check('知识点数 = 114', (await evalJs('window.flatTopics().length')) === 114, 'got ' + await evalJs('window.flatTopics().length'));
  check('侧栏渲染 114 个入口', (await evalJs('document.querySelectorAll(".nav-topic").length')) === 114);
  check('首页 Hero 渲染', await evalJs('!!document.querySelector(".hero h1")'));
  check('所有大纲条目都有正文', await evalJs('window.flatTopics().every(t => window.TOPICS[t.id])'));

  /* 知识点页 */
  await pws.call('Page.navigate', { url: TARGET.replace('index.html', '#/t/shortest-path') });
  await sleep(1500);
  check('知识点正文渲染', await evalJs('!!document.querySelector("#content .md-body")'));
  check('代码块工具栏增强', await evalJs('document.querySelectorAll("#content .code-bar").length > 0'));
  check('例题卡片渲染', await evalJs('document.querySelectorAll("#content .example-card").length > 0'));
  check('上一/下一页导航', await evalJs('document.querySelectorAll("#content .pager a").length >= 2'));
  check('面包屑渲染', await evalJs('document.getElementById("breadcrumb").textContent.length > 4'));

  /* 数据看板 */
  await pws.call('Page.navigate', { url: TARGET.replace('index.html', '#/stats') });
  await sleep(1200);
  check('看板 KPI 卡片渲染', await evalJs('document.querySelectorAll("#content .stat-card").length >= 6'));
  check('看板热力图渲染', await evalJs('document.querySelectorAll("#content .hm-cell").length > 100'));
  check('看板各部分进度行', await evalJs('document.querySelectorAll("#content .sp-row").length >= 9'));

  /* 命令面板 */
  await evalJs('window.__cmdk.open()');
  await sleep(200);
  check('命令面板可打开', await evalJs('!document.getElementById("cmdkMask").hidden'));
  check('命令面板默认列出操作', await evalJs('document.querySelectorAll("#cmdkResults .cmdk-item").length >= 8'));
  await evalJs(`const i=document.getElementById('cmdkInput'); i.value='动态规划'; i.dispatchEvent(new Event('input'));`);
  await sleep(200);
  check('命令面板能搜索到知识点', await evalJs(`[...document.querySelectorAll('#cmdkResults .ci-label')].some(e=>/动态规划|DP/.test(e.textContent))`));
  await evalJs('window.__cmdk.close()');

  /* XSS 消毒（AI/笔记不可信内容）：保留安全标签，移除 onerror/script */
  const xss = await evalJs(`(function(){
    const html = window.__app.sanitizeMd('<img src=x onerror="window.__xss=1"> **ok** <script>window.__xss=1<\\/script>');
    return { hasHandler: /onerror/i.test(html), hasScript: /<script/i.test(html), keepsStrong: /<strong>ok<\\/strong>/.test(html) };
  })()`);
  check('不可信 Markdown 被消毒（无 onerror/script，保留排版）',
    xss && !xss.hasHandler && !xss.hasScript && xss.keepsStrong, JSON.stringify(xss));

  /* 主题切换 */
  await evalJs(`window.__app.applyTheme('dark')`);
  check('深色主题切换生效', await evalJs(`window.__app.getTheme() === 'dark'`));

  /* 模板页 */
  await pws.call('Page.navigate', { url: TARGET.replace('index.html', '#/tpl') });
  await sleep(1200);
  check('模板速查卡片 > 50', await evalJs('document.querySelectorAll("#content .tpl-card").length > 50'),
    'cards=' + await evalJs('document.querySelectorAll("#content .tpl-card").length'));

  /* 测验页 */
  await pws.call('Page.navigate', { url: TARGET.replace('index.html', '#/quiz/1-1') });
  await sleep(1200);
  check('测验题渲染 ≥ 2', await evalJs('document.querySelectorAll("#content .q-card").length >= 2'));

  /* 桌面截图 */
  await pws.call('Page.navigate', { url: TARGET.replace('index.html', '#/') });
  await sleep(1200);
  await pws.call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(400);
  let shot = await pws.call('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'smoke-home.png'), Buffer.from(shot.data, 'base64'));

  /* 移动端截图 */
  await pws.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await pws.call('Page.navigate', { url: TARGET.replace('index.html', '#/t/arr-1d') });
  await sleep(1500);
  shot = await pws.call('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'smoke-mobile.png'), Buffer.from(shot.data, 'base64'));

  /* ---------- 汇总 ---------- */
  let bad = 0;
  console.log('\n===== 冒烟断言 =====');
  for (const c of checks) {
    console.log((c.ok ? '✅' : '❌') + ' ' + c.name + (c.info ? '  (' + c.info + ')' : ''));
    if (!c.ok) bad++;
  }
  const realErrors = [...new Set(pageErrors)].filter(Boolean);
  if (realErrors.length) {
    console.log('\n===== 页面 JS 异常 =====');
    realErrors.slice(0, 20).forEach((e) => { console.log('❌ ' + e.split('\n')[0]); bad++; });
  }
  if (netErrors.length) {
    console.log('\n===== 网络/资源错误 =====');
    [...new Set(netErrors)].slice(0, 20).forEach((e) => console.log('⚠️  ' + e));
  }
  console.log('\n截图: scripts/smoke-home.png, scripts/smoke-mobile.png');
  proc.kill();
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error('smoke fatal:', e); process.exit(1); });
