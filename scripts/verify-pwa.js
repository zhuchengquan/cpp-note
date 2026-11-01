#!/usr/bin/env node
/* 验证 Service Worker 离线能力：加载页面 → 等待预缓存 → 模拟离线 → 重载仍可用 */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'),
  { spawn } = require('child_process');
const { createWS } = require('./cdp');

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
