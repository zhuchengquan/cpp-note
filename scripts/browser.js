#!/usr/bin/env node
/* ============================================================
   browser.js —— 无头浏览器定位与启动参数的统一入口
   优先级：CHROME_PATH 环境变量 > 常见安装路径（Windows / Linux）
   CI（Linux 容器/root、受限 /dev/shm）需要 --no-sandbox 等参数，
   否则浏览器会直接启动失败，这里统一补齐。
   ============================================================ */
'use strict';
const fs = require('fs');

const WIN_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];
const NIX_CANDIDATES = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/opt/google/chrome/chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
];

function findBrowser() {
  const env = process.env.CHROME_PATH || process.env.CHROME_BIN || process.env.BROWSER_PATH;
  if (env && fs.existsSync(env)) return env;
  const list = process.platform === 'win32' ? WIN_CANDIDATES : NIX_CANDIDATES;
  return list.find((p) => fs.existsSync(p)) || null;
}

/* 无头启动通用参数：容器/ root 下必须禁沙箱，并改用 /tmp 避免 /dev/shm 过小 */
function launchArgs(userDataDir, url) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    `--user-data-dir=${userDataDir}`,
  ];
  if (url) args.push(url);
  return args;
}

function remotePortArgs(port) {
  return [`--remote-debugging-port=${port}`];
}

module.exports = { findBrowser, launchArgs, remotePortArgs };
