#!/usr/bin/env node
/* 验证 Service Worker 离线能力：加载页面 → 等待预缓存 → 模拟离线 → 重载仍可用 */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'),
  net = require('net'), crypto = require('crypto'), { spawn } = require('child_process');

const TARGET = process.argv[2] || 'http://localhost:8123/index.html';
const PORT = 9333;
const CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium',
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJSON = (u) => new Promise((res, rej) => http.get(u, (r) => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej));

function createWS(wsUrl) {
  const u = new URL(wsUrl), key = crypto.randomBytes(16).toString('base64');
  const sock = net.connect(u.port, u.hostname);
  const handlers = new Map(), waiters = new Map();
  let nextId = 1, buf = Buffer.alloc(0), ok = false;
  const frame = (str) => {
    const p = Buffer.from(str), len = p.length; let h;
    if (len < 126) h = Buffer.from([0x81, 0x80 | len]);
    else { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 0x80 | 126; h.writeUInt16BE(len, 2); }
    const mask = crypto.randomBytes(4), mp = Buffer.alloc(len);
    for (let i = 0; i < len; i++) mp[i] = p[i] ^ mask[i % 4];
    sock.write(Buffer.concat([h, mask, mp]));
  };
  const call = (method, params) => new Promise((res, rej) => { const id = nextId++; waiters.set(id, { res, rej }); frame(JSON.stringify({ id, method, params: params || {} })); });
  const on = (m, f) => handlers.set(m, f);
  const parse = () => {
    while (buf.length >= 2) {
      let len = buf[1] & 0x7f, off = 2;
      if (len === 126) { len = buf.readUInt16BE(2); off = 4; }
      if (buf.length < off + len) return;
      const pl = buf.slice(off, off + len).toString(); buf = buf.slice(off + len);
      const msg = JSON.parse(pl);
      if (msg.id && waiters.has(msg.id)) { const w = waiters.get(msg.id); waiters.delete(msg.id); msg.error ? w.rej(new Error(msg.error.message)) : w.res(msg.result); }
      else if (msg.method && handlers.has(msg.method)) handlers.get(msg.method)(msg.params);
    }
  };
  return new Promise((res, rej) => {
    sock.on('data', c => {
      if (!ok) { buf = Buffer.concat([buf, c]); const i = buf.indexOf('\r\n\r\n'); if (i >= 0) { ok = true; buf = buf.slice(i + 4); res({ call, on }); parse(); } return; }
      buf = Buffer.concat([buf, c]); parse();
    });
    sock.on('error', rej);
    sock.write(`GET ${u.pathname} HTTP/1.1\r\nHost: ${u.hostname}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
  });
}

(async () => {
  const exe = CANDIDATES.find(fs.existsSync);
  if (!exe) { console.log('⚠️ 无浏览器，跳过'); process.exit(0); }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cppnote-pwa-'));
  const proc = spawn(exe, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, TARGET], { stdio: 'ignore' });
  let ver;
  for (let i = 0; i < 40; i++) { await sleep(500); try { ver = await getJSON(`http://127.0.0.1:${PORT}/json/version`); break; } catch (e) {} }
  if (!ver) { proc.kill(); console.log('❌ 启动超时'); process.exit(1); }
  await sleep(1000);
  const pages = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = pages.find(p => p.type === 'page' && p.url.startsWith('http'));
  const ws = await createWS(page.webSocketDebuggerUrl);
  await ws.call('Runtime.enable'); await ws.call('Page.enable');

  const evalJs = async (e) => (await ws.call('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.value;
  /* 等待 SW 激活并完成预缓存 */
  let ready = false;
  for (let i = 0; i < 40; i++) {
    ready = await evalJs(`(async()=>{ if(!navigator.serviceWorker) return false; const r=await navigator.serviceWorker.getRegistration(); if(!r||!r.active) return false; const keys=await caches.keys(); if(!keys.length) return false; const c=await caches.open(keys[0]); const n=(await c.keys()).length; return n>=104; })()`);
    if (ready) break;
    await sleep(500);
  }
  const cachedN = await evalJs(`(async()=>{ const k=await caches.keys(); const c=await caches.open(k[0]); return (await c.keys()).length; })()`);
  console.log('SW 激活并预缓存:', ready, '| 缓存条目:', cachedN);

  /* 模拟离线后重载 */
  await ws.call('Network.enable');
  await ws.call('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await ws.call('Page.reload', { ignoreCache: false });
  await sleep(2500);
  const offlineOk = await evalJs(`!!(window.OUTLINE && document.querySelectorAll('.nav-topic').length === 114 && document.querySelector('.hero h1'))`);
  console.log('离线重载后站点完整可用:', offlineOk);

  proc.kill();
  if (ready && cachedN >= 104 && offlineOk) { console.log('✅ PWA 离线验证通过'); process.exit(0); }
  console.log('❌ PWA 离线验证失败'); process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
