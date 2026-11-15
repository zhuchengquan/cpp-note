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
const { spawn } = require('child_process');
const { createWS } = require('./cdp');

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
  check('仅保留明亮/深色两套主题', await evalJs(`(() => {
    const cards = [...document.querySelectorAll('.theme-card')].map(c => c.dataset.setTheme);
    const css = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch (e) { return []; } })
      .map(r => r.cssText).join('');
    return cards.length === 2 && cards.join(',') === 'light,dark' && !/data-theme="eye"/.test(css);
  })()`), 'cards=' + await evalJs(`[...document.querySelectorAll('.theme-card')].map(c=>c.dataset.setTheme).join(',')`));
  check('切到深色生效', await evalJs(`(function(){ window.__app.applyTheme('dark'); return window.__app.getTheme() === 'dark'; })()`));
  check('顶栏按钮在明亮/深色间二态往返', await evalJs(`(function(){
    const btn = document.getElementById('themeBtn');
    window.__app.applyTheme('light'); btn.click();
    const a = window.__app.getTheme();
    btn.click();
    const b = window.__app.getTheme();
    return a === 'dark' && b === 'light' && btn.textContent.trim() === '🌙';
  })()`));
  check('遗留的 eye 主题值被安全归一为明亮', await evalJs(`(function(){
    window.__app.applyTheme('eye');
    return document.documentElement.dataset.theme === 'light';
  })()`));

  /* 模板页 */
  await pws.call('Page.navigate', { url: TARGET.replace('index.html', '#/tpl') });
  await sleep(1200);
  check('模板速查卡片 > 50', await evalJs('document.querySelectorAll("#content .tpl-card").length > 50'),
    'cards=' + await evalJs('document.querySelectorAll("#content .tpl-card").length'));

  /* 测验页 */
  await pws.call('Page.navigate', { url: TARGET.replace('index.html', '#/quiz/1-1') });
  await sleep(1200);
  check('测验题渲染 ≥ 2', await evalJs('document.querySelectorAll("#content .q-card").length >= 2'));

  /* 在线运行：代码实时高亮（高亮层与输入层严格对齐） */
  await pws.call('Page.navigate', { url: TARGET.replace('index.html', '#/t/shortest-path') });
  await sleep(1200);
  await evalJs('document.querySelector("#content .code-run").click()');
  await sleep(500);
  const hl = await evalJs(`(() => {
    const ta = document.getElementById('runCode');
    const pre = document.querySelector('.run-hl');
    const codeEl = document.getElementById('runHl');
    const cs = el => getComputedStyle(el);
    const taCS = cs(ta), preCS = cs(pre);
    const spans = codeEl.querySelectorAll('span').length;
    const kw = codeEl.querySelector('span');
    const mismatch = ['fontFamily','fontSize','lineHeight','paddingTop','paddingLeft','tabSize','whiteSpace']
      .filter(k => String(taCS[k] || taCS.getPropertyValue(k)) !== String(preCS[k] || preCS.getPropertyValue(k)));
    const r1 = ta.getBoundingClientRect(), r2 = pre.getBoundingClientRect();
    return JSON.stringify({
      open: document.getElementById('runnerPanel').classList.contains('open'),
      spans,
      color: kw ? cs(kw).color : '',
      mismatch,
      offset: Math.round(Math.abs(r1.top - r2.top) + Math.abs(r1.left - r2.left)),
      textHidden: /rgba\\(0, 0, 0, 0\\)|transparent/.test(String(taCS.webkitTextFillColor || taCS.getPropertyValue('-webkit-text-fill-color'))),
    });
  })()`);
  const hlj = JSON.parse(hl);
  check('在线运行代码已语法高亮（含 hljs 标记）', hlj.spans > 3, 'spans=' + hlj.spans);
  check('高亮着色生效（非默认色）', /^rgb/.test(hlj.color) && hlj.color !== 'rgb(171, 178, 191)', hlj.color);
  check('高亮层与输入层排版完全对齐', hlj.mismatch.length === 0 && hlj.offset <= 1,
    'mismatch=' + (hlj.mismatch.join(',') || '无') + ' offset=' + hlj.offset);
  check('输入层文字透明仅显示高亮层（光标可见）', hlj.textHidden === true);

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
