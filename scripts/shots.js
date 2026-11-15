#!/usr/bin/env node
/* 视觉回归截图：关键页面 × 主题，输出到 scripts/shots/ */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'),
  { spawn } = require('child_process');
const { createWS } = require('./cdp');
const TARGET = process.argv[2] || 'http://localhost:8123/index.html';
const PORT = 9355;
const CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = u => new Promise((res, rej) => http.get(u, r => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>res(JSON.parse(d))); }).on('error', rej));

(async()=>{
  const exe=CANDIDATES.find(fs.existsSync); if(!exe){console.log('no browser');process.exit(0);}
  const out=path.join(__dirname,'shots'); fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'shots-'));
  const proc=spawn(exe,['--headless=new','--disable-gpu',`--remote-debugging-port=${PORT}`,`--user-data-dir=${profile}`,TARGET],{stdio:'ignore'});
  let ver;for(let i=0;i<40;i++){await sleep(500);try{ver=await getJSON(`http://127.0.0.1:${PORT}/json/version`);break;}catch(e){}}
  await sleep(1200);
  const pages=await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page=pages.find(p=>p.type==='page'&&p.url.startsWith('http'));
  const ws=await createWS(page.webSocketDebuggerUrl);
  await ws.call('Runtime.enable');await ws.call('Page.enable');
  await ws.call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  const evalJs=async e=>(await ws.call('Runtime.evaluate',{expression:e,returnByValue:true})).result.value;
  const shot=async name=>{const r=await ws.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));console.log('shot',name);};
  const go=async hash=>{await ws.call('Page.navigate',{url:TARGET.replace('index.html',hash)});await sleep(1400);};

  /* 明亮主题关键页 */
  await evalJs(`window.__app.applyTheme('light')`);
  await go('#/'); await shot('01-home-light');
  await go('#/stats'); await shot('02-stats-light');
  await go('#/t/shortest-path'); await shot('03-topic-light');
  await evalJs(`window.__app.applyTheme('dark')`); await sleep(400); await shot('04-topic-dark');
  await go('#/stats'); await shot('05-stats-dark');
  await go('#/tpl'); await shot('06-tpl-dark');
  /* 命令面板 */
  await go('#/'); await evalJs(`window.__cmdk.open()`); await sleep(300);
  await evalJs(`const i=document.getElementById('cmdkInput');i.value='图';i.dispatchEvent(new Event('input'));`); await sleep(300);
  await shot('07-command-palette');
  /* 深色主题首页 + 移动端看板 */
  await evalJs(`window.__cmdk.close()`);
  await evalJs(`window.__app.applyTheme('dark')`); await sleep(300); await shot('08-home-dark');
  await ws.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
  await go('#/stats'); await shot('09-stats-mobile');
  proc.kill();
  console.log('done -> scripts/shots/');
})().catch(e=>{console.error(e);process.exit(1);});
