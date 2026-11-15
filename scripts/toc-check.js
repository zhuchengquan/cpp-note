#!/usr/bin/env node
/* ============================================================
   toc-check.js —— 「本页导航」布局与交互回归测试
   断言：
     1) 任何宽度下目录都不占正文垂直空间（正文紧跟标题）
     2) 任何宽度下目录都不与正文水平重叠
     3) 宽屏（空间足够）为右侧悬浮态，卡片完整落在视口内
     4) 空间不足时收起，顶栏按钮可开合，点空白处 / Esc 可关闭
     5) 打开笔记面板后仍不重叠（自动降级）
     6) 移动端 390px 不溢出且可用
     7) 离开知识点页后目录被移除，不残留
   ============================================================ */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'),
  { spawn } = require('child_process');
const { createWS } = require('./cdp');

const BASE = process.argv[2] || 'http://localhost:8123/index.html';
const PORT = 9391;
const CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = u => new Promise((res, rej) => http.get(u, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej));

(async () => {
  const exe = CANDIDATES.find(fs.existsSync);
  if (!exe) { console.log('⚠️ 未找到浏览器，跳过'); process.exit(0); }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'toc-check-'));
  const proc = spawn(exe, ['--headless=new', '--disable-gpu', '--no-first-run',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, BASE + '#/t/shortest-path'], { stdio: 'ignore' });
  let ver;
  for (let i = 0; i < 40; i++) { await sleep(500); try { ver = await getJSON(`http://127.0.0.1:${PORT}/json/version`); break; } catch (e) {} }
  if (!ver) { proc.kill(); console.log('❌ 浏览器启动超时'); process.exit(1); }
  await sleep(1600);
  const pages = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = pages.find(p => p.type === 'page' && p.url.startsWith('http'));
  const ws = await createWS(page.webSocketDebuggerUrl);
  await ws.call('Runtime.enable');
  await ws.call('Page.enable');

  const ev = async (expr) => (await ws.call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
  const setW = async (w, h) => { await ws.call('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 }); await sleep(650); };

  const problems = [];
  const P = (msg) => problems.push(msg);

  /* 读取当前目录状态 */
  const stateJs = `(() => {
    const card = document.getElementById('tocCard');
    const art = document.querySelector('#content article.md-body');
    const head = document.querySelector('.topic-head');
    const btn = document.getElementById('tocNavBtn');
    if (!art || !head) return { err: 'no-article' };
    const r = card ? card.getBoundingClientRect() : null;
    const a = art.getBoundingClientRect();
    const h = head.getBoundingClientRect();
    const btnVisible = !!(btn && !btn.hidden);
    const mode = !card ? 'none' : card.classList.contains('toc-gutter') ? 'gutter'
               : card.classList.contains('toc-popover') ? 'popover' : 'unknown';
    const visible = !!(card && !card.hidden && r && r.width > 0);
    const overlapY = visible ? Math.max(0, Math.min(r.bottom, a.bottom) - Math.max(r.top, a.top)) : 0;
    const overlapX = visible ? Math.max(0, Math.min(r.right, a.right) - Math.max(r.left, a.left)) : 0;
    return {
      vw: window.innerWidth, mode, visible, btnVisible,
      gapAfterHead: Math.round(a.top - h.bottom),
      overlapX: Math.round(overlapX), overlapY: Math.round(overlapY),
      card: r ? { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width) } : null,
      artRight: Math.round(a.right),
      inViewport: r ? (r.left >= -1 && r.right <= window.innerWidth + 1) : true,
      docOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  })()`;

  /* ---------- 1&2&3：多宽度布局 ---------- */
  for (const w of [1280, 1440, 1600, 1700, 1800, 1920, 2560]) {
    await setW(w, 900);
    const s = await ev(stateJs);
    if (s.err) { P(`${w}px: 页面结构异常`); continue; }
    /* 侧栏浮动必然与正文共享垂直区间，真正的"遮挡"是水平+垂直同时重叠 */
    const visualOverlap = s.overlapX > 0 && s.overlapY > 0;
    if (s.gapAfterHead > 40) P(`${w}px: 目录仍占用正文垂直空间（正文距标题 ${s.gapAfterHead}px）`);
    if (s.mode === 'gutter' && visualOverlap)
      P(`${w}px: 悬浮目录遮挡正文 X=${s.overlapX} Y=${s.overlapY}`);
    if (s.docOverflow) P(`${w}px: 出现横向滚动`);
    if (s.mode === 'gutter' && !s.visible) P(`${w}px: 判为悬浮态却不可见`);
    if (s.mode === 'gutter' && s.card && s.card.l < s.artRight + 8)
      P(`${w}px: 悬浮目录距正文过近（${s.card.l} vs ${s.artRight}）`);
    if (!s.inViewport) P(`${w}px: 目录超出视口`);
    if (s.mode === 'gutter' && s.btnVisible) P(`${w}px: 悬浮态不该显示顶栏按钮`);
    if (s.mode === 'popover' && !s.btnVisible) P(`${w}px: 收起态应显示顶栏按钮`);
    console.log(`  ${w}px → 形态=${s.mode} 可见=${s.visible} 正文距标题=${s.gapAfterHead}px 重叠=${s.overlapX}/${s.overlapY} 按钮=${s.btnVisible}`);
  }

  /* ---------- 4：弹层开合（1440 空间不足；弹层是浮层，允许覆盖正文，但必须可关闭） ---------- */
  await setW(1440, 900);
  await ev('document.getElementById("tocNavBtn").click()');
  await sleep(350);
  let s = await ev(stateJs);
  if (!s.visible) P('点击顶栏「本页」后弹层未展开');
  if (!s.inViewport) P('弹层超出视口');
  const rightGap = s.card ? s.vw - s.card.r : 99;
  if (rightGap < -1 || rightGap > 40) P(`弹层未贴右对齐（右侧留白 ${rightGap}px）`);
  await ev('document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))');
  await sleep(250);
  s = await ev(stateJs);
  if (s.visible) P('Esc 未能关闭弹层');
  await ev('document.getElementById("tocNavBtn").click()');
  await sleep(300);
  await ev('document.querySelector("#content h1").click()');
  await sleep(250);
  s = await ev(stateJs);
  if (s.visible) P('点击页面空白处未能关闭弹层');

  /* ---------- 5：打开笔记面板仍不重叠 ---------- */
  await setW(1920, 900);
  await ev('document.getElementById("noteToggleBtn").click()');
  await sleep(750);
  s = await ev(stateJs);
  const noteOverlap = s.overlapX > 0 && s.overlapY > 0 && s.mode === 'gutter';
  if (noteOverlap) P(`打开笔记面板后悬浮目录遮挡正文 X=${s.overlapX} Y=${s.overlapY}`);
  console.log(`  笔记面板打开(1920px) → 形态=${s.mode} 遮挡=${noteOverlap} 按钮=${s.btnVisible}`);
  await ev('document.getElementById("noteToggleBtn").click()');
  await sleep(650);

  /* ---------- 6：移动端 ---------- */
  await setW(390, 844);
  s = await ev(stateJs);
  if (s.docOverflow) P('移动端 390px 出现横向滚动');
  if (s.gapAfterHead > 40) P('移动端目录仍占正文垂直空间');
  if (!s.btnVisible) P('移动端应可通过顶栏按钮打开目录');
  await ev('document.getElementById("tocNavBtn").click()');
  await sleep(300);
  s = await ev(stateJs);
  if (!s.visible) P('移动端弹层未展开');
  if (s.docOverflow) P('移动端弹层展开后出现横向滚动');
  if (!s.inViewport) P('移动端弹层超出视口');
  await ev(`document.querySelector('#tocCard .toc-list a').click()`);
  await sleep(450);
  s = await ev(stateJs);
  if (s.visible) P('点击小节后弹层未自动收起');

  /* ---------- 7：切页清理 ---------- */
  await ev('location.hash = "#/"');
  await sleep(600);
  const leftover = await ev(`!!document.getElementById('tocCard')`);
  if (leftover) P('离开知识点页后目录卡片残留');
  await ev('location.hash = "#/stats"');
  await sleep(600);
  if (await ev(`!!document.getElementById('tocCard')`)) P('进入看板后目录卡片残留');
  if (!(await ev(`document.getElementById('tocNavBtn').hidden`))) P('非知识点页仍显示「本页」按钮');

  /* ---------- 汇总 ---------- */
  console.log('\n===== 本页导航断言 =====');
  proc.kill();
  if (problems.length) {
    problems.forEach(p => console.log('❌ ' + p));
    process.exit(1);
  }
  console.log('✅ 全部通过：不占正文空间、零重叠、两态自动切换、开合与清理正常');
})().catch(e => { console.error(e); process.exit(1); });
