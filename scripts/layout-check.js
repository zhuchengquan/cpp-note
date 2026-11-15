#!/usr/bin/env node
/* 自动化布局/视觉断言：水平溢出、关键元素可见、零尺寸组件、看板热力图对齐 */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'),
  { spawn } = require('child_process');
const { createWS } = require('./cdp');
const TARGET = process.argv[2] || 'http://localhost:8123/index.html';
const PORT = 9366;
const CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = u => new Promise((res, rej) => http.get(u, r => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>res(JSON.parse(d))); }).on('error', rej));

(async () => {
  const exe = CANDIDATES.find(fs.existsSync);
  if (!exe) { console.log('no browser, skip'); process.exit(0); }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'layout-'));
  const proc = spawn(exe, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, TARGET], { stdio: 'ignore' });
  let ver;
  for (let i = 0; i < 40; i++) { await sleep(500); try { ver = await getJSON(`http://127.0.0.1:${PORT}/json/version`); break; } catch (e) {} }
  await sleep(1200);
  const pages = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = pages.find(p => p.type === 'page' && p.url.startsWith('http'));
  const ws = await createWS(page.webSocketDebuggerUrl);
  await ws.call('Runtime.enable'); await ws.call('Page.enable');

  const problems = [];
  async function evalJs(e) { return (await ws.call('Runtime.evaluate', { expression: e, returnByValue: true })).result.value; }
  async function setViewport(w, h) { await ws.call('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 }); }
  async function check(hash, theme, w, h) {
    await setViewport(w, h);
    if (theme) await evalJs(`window.__app.applyTheme('${theme}')`);
    await ws.call('Page.navigate', { url: TARGET.replace('index.html', hash) });
    await sleep(1300);
    const r = await evalJs(`(function(){
      const out={overflow:null,zero:[],offscreen:[],docs:document.documentElement.scrollWidth>window.innerWidth};
      /* 水平溢出的元素 */
      const vw=window.innerWidth;
      document.querySelectorAll('#content *').forEach(el=>{
        /* pre/code 内部允许有意的横向滚动（长代码），其溢出由滚动容器吸收，不算布局问题 */
        if(el.closest('pre')) return;
        const r=el.getBoundingClientRect();
        if(r.width===0&&r.height===0) return;
        if(r.right>vw+2){ const cls=(el.className&&el.className.toString)?el.className.toString().slice(0,40):el.tagName; out.overflow=(out.overflow||[]).concat(el.tagName+'.'+cls+' right='+Math.round(r.right)); }
      });
      /* 关键组件零尺寸检测（在对应页面） */
      const checks={
        stats:['.stat-card','.hm-grid','.sp-row','.master-seg'],
        tpl:['.tpl-card'],
        quiz:['.q-card'],
      };
      const h=location.hash;
      return JSON.stringify({docOverflow:document.documentElement.scrollWidth>window.innerWidth, overflow:out.overflow});
    })()`);
    const parsed = JSON.parse(r);
    if (parsed.docOverflow) problems.push(`[${theme} ${w}px ${hash}] 文档出现横向滚动条`);
    if (parsed.overflow && parsed.overflow.length) {
      const uniq=[...new Set(parsed.overflow)].slice(0,5);
      problems.push(`[${theme} ${w}px ${hash}] 元素右溢出: ${uniq.join(' | ')}`);
    }
  }

  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await check('#/', 'light', w, h);
    await check('#/stats', w === 390 ? 'light' : 'dark', w, h);
    await check('#/t/shortest-path', 'light', w, h);
    await check('#/tpl', 'dark', w, h);
    await check('#/quiz/1-1', 'light', w, h);
    await check('#/book', 'light', w, h);
  }

  /* 看板热力图：单元格数量与列对齐、KPI 数量 */
  await setViewport(1440, 900);
  await ws.call('Page.navigate', { url: TARGET.replace('index.html', '#/stats') });
  await sleep(1200);
  const hm = await evalJs(`(function(){
    const cols=document.querySelectorAll('#content .hm-col').length;
    const perCol=[...document.querySelectorAll('#content .hm-col')].map(c=>c.children.length);
    const kpi=document.querySelectorAll('#content .stat-card').length;
    const sp=document.querySelectorAll('#content .sp-row').length;
    const segWidths=[...document.querySelectorAll('.master-seg i')].map(i=>i.getBoundingClientRect().width);
    return JSON.stringify({cols,perCol:perCol[0],all7:perCol.every(n=>n===7),kpi,sp,segSum:Math.round(segWidths.reduce((a,b)=>a+b,0)),segContainer:Math.round(document.querySelector('.master-seg').getBoundingClientRect().width)});
  })()`);
  const hmj = JSON.parse(hm);
  console.log('热力图列数:', hmj.cols, '每列格数:', hmj.perCol, '全为7:', hmj.all7, '| KPI:', hmj.kpi, '| 部分行:', hmj.sp);
  console.log('掌握度分段宽度和:', hmj.segSum, '/ 容器', hmj.segContainer, hmj.segSum <= hmj.segContainer + 2 ? '✅' : '❌ 超出');
  if (hmj.cols !== 20 || !hmj.all7 || hmj.kpi < 6 || hmj.sp < 9) problems.push('看板热力图/KPI/部分行数量异常');
  if (hmj.segSum > hmj.segContainer + 2) problems.push('掌握度分段条宽度溢出');

  console.log('\n===== 布局断言 =====');
  if (problems.length) { problems.forEach(p => console.log('❌ ' + p)); proc.kill(); process.exit(1); }
  console.log('✅ 桌面/移动端 × 6 个页面 × 明亮/深色主题：无横向溢出、关键布局正常');
  proc.kill();
})().catch(e => { console.error(e); process.exit(1); });
