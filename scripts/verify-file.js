#!/usr/bin/env node
/* 验证最关键的双击使用方式：file:// 协议下整站完整可用，且不注册 SW、无异常 */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http'),
  { spawn } = require('child_process');
const { createWS } = require('./cdp');
const { findBrowser, launchArgs, remotePortArgs } = require('./browser');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const getJSON = (u) => new Promise((res, rej) => http.get(u, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej));

const TARGET = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const PORT = Number(process.env.CDP_PORT) || 9377;

(async () => {
  const exe = findBrowser();
  if (!exe) { console.log('no browser, skip'); process.exit(0); }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cppnote-file-'));
  const proc = spawn(exe, [...remotePortArgs(PORT), ...launchArgs(profile, TARGET)], { stdio: 'ignore' });
  let ver;
  for (let i = 0; i < 60; i++) { await sleep(500); try { ver = await getJSON(`http://127.0.0.1:${PORT}/json/version`); break; } catch (e) {} }
  if (!ver) { proc.kill(); console.log('❌ file:// 验证：无头浏览器启动失败'); process.exit(1); }
  await sleep(2500);
  const pages = await getJSON(`http://127.0.0.1:${PORT}/json`);
  const page = pages.find(p => p.type === 'page' && p.url.startsWith('file'));
  if (!page) { console.log('❌ 未打开 file:// 页面'); proc.kill(); process.exit(1); }
  const ws = await createWS(page.webSocketDebuggerUrl);
  await ws.call('Runtime.enable');
  const errors = [];
  ws.on('Runtime.exceptionThrown', p => errors.push((p.exceptionDetails && p.exceptionDetails.text) || 'exception'));
  const ev = async (e) => (await ws.call('Runtime.evaluate', { expression: e, returnByValue: true })).result.value;
  await sleep(500);
  const r = JSON.parse(await ev(`JSON.stringify({
    topics: window.flatTopics().length,
    nav: document.querySelectorAll('.nav-topic').length,
    hero: !!document.querySelector('.hero h1'),
    bootRemoved: !document.getElementById('appBoot'),
    purify: !!window.DOMPurify,
    marked: !!window.marked,
    hljs: !!window.hljs,
    statsModule: !!window.StatsPage,
    cmdk: !!window.__cmdk,
    swRegistered: ('serviceWorker' in navigator) ? !!navigator.serviceWorker.controller : 'unsupported'
  })`));
  console.log('file:// 结果:', JSON.stringify(r, null, 0));
  console.log('JS 异常:', errors.length ? errors : '无');
  proc.kill();
  const ok = r.topics === 114 && r.nav === 114 && r.hero && r.bootRemoved &&
    r.purify && r.marked && r.statsModule && r.cmdk && r.swRegistered !== true && errors.length === 0;
  console.log(ok ? '✅ file:// 双击模式完整可用（且未注册 SW）' : '❌ file:// 模式存在问题');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
