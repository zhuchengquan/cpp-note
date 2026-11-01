#!/usr/bin/env node
/* ============================================================
   build-sw.js —— 由 index.html 自动生成 sw.js（预缓存清单）
   保证 Service Worker 的预缓存列表与页面实际引用永远同步。
   用法：node scripts/build-sw.js   （npm run check 也会先跑它）
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* 收集所有本地静态引用，统一规范化为相对根路径（不带 ./ 前缀） */
const urls = new Set(['index.html']); // './' 导航回退由 index.html 承担
for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  let u = m[1];
  if (/^(data:|https?:|#)/.test(u)) continue;
  u = u.replace(/^\.\//, '');
  if (u && u !== '.') urls.add(u);
}
/* 额外确保 PWA 资产进入缓存 */
['manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
  'vendor/marked.min.js', 'vendor/highlight.min.js', 'vendor/purify.min.js',
  'vendor/atom-one-dark.min.css'].forEach((u) => urls.add(u));

/* 校验文件存在并计算内容 hash（用于版本变化时自动失效缓存） */
const manifestList = [];
let missing = 0;
for (const u of [...urls].sort()) {
  const rel = u.replace(/^\.\//, '');
  if (!rel) continue; // './' 根路径
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
    if (!fs.existsSync(fp)) { console.log('  ⚠️  SW 清单中缺失文件: ' + rel); missing++; }
    continue;
  }
  const hash = crypto.createHash('md5').update(fs.readFileSync(fp)).digest('hex').slice(0, 10);
  manifestList.push({ url: './' + rel, hash });
}
if (missing) process.exitCode = 1;

/* 从 package.json 读版本号，作为缓存版本 */
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const VERSION = 'v' + pkg.version;
const bundleHash = crypto.createHash('md5')
  .update(manifestList.map((x) => x.url + x.hash).join('|')).digest('hex').slice(0, 8);

const sw = `/* 由 scripts/build-sw.js 自动生成，请勿手工编辑预缓存清单 */
'use strict';
const CACHE = 'cppnote-${VERSION}-${bundleHash}';
const PRECACHE = ${JSON.stringify(manifestList.map((x) => x.url), null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      /* 不自动 skipWaiting：等待用户确认刷新，避免教学中途页面被强刷 */
      .catch((e) => console.warn('预缓存部分失败（离线兜底仍可用）', e))
  );
});
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* 跨域（Wandbox 在线编译、AI 接口）：不拦截，走网络 */
  if (url.origin !== self.location.origin) return;

  /* 页面导航：网络优先，失败回退缓存 index，保证 SPA 路由离线可用 */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html') || caches.match('index.html'))
    );
    return;
  }

  /* 静态资源：缓存优先，再回源并运行时缓存 */
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
`;

fs.writeFileSync(path.join(ROOT, 'sw.js'), sw);
console.log(`✅ 生成 sw.js：${manifestList.length} 个预缓存文件，版本 ${VERSION}`);
