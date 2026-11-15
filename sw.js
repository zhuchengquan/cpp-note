/* 由 scripts/build-sw.js 自动生成，请勿手工编辑预缓存清单 */
'use strict';
const CACHE = 'cppnote-v1.1.1-18f1639d';
const PRECACHE = [
  "./css/style.css",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/icon.svg",
  "./index.html",
  "./js/ai.js",
  "./js/app.js",
  "./js/data/outline.js",
  "./js/data/p1-01.js",
  "./js/data/p1-02.js",
  "./js/data/p1-03.js",
  "./js/data/p1-04.js",
  "./js/data/p1-05.js",
  "./js/data/p1-06.js",
  "./js/data/p1-07.js",
  "./js/data/p1-08.js",
  "./js/data/p1-09.js",
  "./js/data/p1-10.js",
  "./js/data/p1-11.js",
  "./js/data/p1-12.js",
  "./js/data/p2-01.js",
  "./js/data/p2-02.js",
  "./js/data/p2-03.js",
  "./js/data/p2-04.js",
  "./js/data/p2-05.js",
  "./js/data/p2-06.js",
  "./js/data/p2-07.js",
  "./js/data/p2-08.js",
  "./js/data/p2-09.js",
  "./js/data/p2-10.js",
  "./js/data/p2-11.js",
  "./js/data/p2-12.js",
  "./js/data/p2-13.js",
  "./js/data/p2-14.js",
  "./js/data/p3-01.js",
  "./js/data/p3-02.js",
  "./js/data/p3-03.js",
  "./js/data/p3-04.js",
  "./js/data/p3-05.js",
  "./js/data/p3-06.js",
  "./js/data/p3-07.js",
  "./js/data/p3-08.js",
  "./js/data/p3-09.js",
  "./js/data/p3-10.js",
  "./js/data/p3-11.js",
  "./js/data/p3-12.js",
  "./js/data/p3-13.js",
  "./js/data/p3-14.js",
  "./js/data/p3-15.js",
  "./js/data/p3-16.js",
  "./js/data/p4-01.js",
  "./js/data/p4-02.js",
  "./js/data/p4-03.js",
  "./js/data/p4-04.js",
  "./js/data/p5-01.js",
  "./js/data/p5-02.js",
  "./js/data/p5-03.js",
  "./js/data/p6-01.js",
  "./js/data/p6-02.js",
  "./js/data/p6-03.js",
  "./js/data/p7-01.js",
  "./js/data/p7-02.js",
  "./js/data/p7-03.js",
  "./js/data/p8-01.js",
  "./js/data/p8-02.js",
  "./js/data/p8-03.js",
  "./js/data/p9-01.js",
  "./js/data/p9-02.js",
  "./js/data/p9-03.js",
  "./js/data/quiz-p1.js",
  "./js/data/quiz-p2.js",
  "./js/data/quiz-p3.js",
  "./js/data/quiz-p4.js",
  "./js/data/quiz-p5.js",
  "./js/data/quiz-p6.js",
  "./js/data/quiz-p7.js",
  "./js/data/quiz-p8.js",
  "./js/data/quiz-p9.js",
  "./js/data/realexam-p2.js",
  "./js/data/realexam-p2b.js",
  "./js/data/realexam-p3.js",
  "./js/data/realexam-p3b.js",
  "./js/data/realexam-p3c.js",
  "./js/data/realexam-p4.js",
  "./js/data/realexam-p5.js",
  "./js/data/relations.js",
  "./js/data/templates-p1.js",
  "./js/data/templates-p2.js",
  "./js/data/templates-p3.js",
  "./js/data/templates-p4.js",
  "./js/data/templates-p5.js",
  "./js/data/templates-p6.js",
  "./js/data/templates-p7.js",
  "./js/data/templates-p8.js",
  "./js/pwa.js",
  "./js/stats.js",
  "./js/store.js",
  "./manifest.webmanifest",
  "./vendor/atom-one-dark.min.css",
  "./vendor/highlight.min.js",
  "./vendor/marked.min.js",
  "./vendor/purify.min.js"
];

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
