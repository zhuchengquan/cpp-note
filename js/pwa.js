/* ============================================================
   pwa.js —— PWA 安装引导 + Service Worker 更新提示
   （file:// 下 SW 不注册，本模块所有逻辑自动静默跳过）
   ============================================================ */
(function () {
  'use strict';

  const bar = document.getElementById('pwaBar');
  const msg = document.getElementById('pwaMsg');
  const confirmBtn = document.getElementById('pwaConfirm');
  const dismissBtn = document.getElementById('pwaDismiss');
  if (!bar) return;

  function showBar(text, confirmText, onConfirm, dismissable) {
    msg.textContent = text;
    confirmBtn.textContent = confirmText;
    bar.hidden = false;
    dismissBtn.style.display = dismissable === false ? 'none' : '';
    confirmBtn.onclick = () => { bar.hidden = true; onConfirm && onConfirm(); };
    dismissBtn.onclick = () => { bar.hidden = true; };
  }

  /* ---------- 1. 安装到桌面（beforeinstallprompt） ---------- */
  let deferredPrompt = null;
  const installed = ('matchMedia' in window) &&
    window.matchMedia('(display-mode: standalone)').matches;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    /* 已安装（standalone）或本次会话已忽略，则不再打扰 */
    if (installed || sessionStorage.getItem('pwa-install-dismissed')) return;
    setTimeout(() => {
      if (!deferredPrompt) return;
      showBar('📲 可把手册安装到桌面/主屏幕：离线启动、无浏览器地址栏，像 App 一样使用。',
        '安装', async () => {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
        });
      sessionStorage.setItem('pwa-install-dismissed', '1');
    }, 2500);
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    bar.hidden = true;
  });

  /* ---------- 2. Service Worker 更新提示 ---------- */
  let refreshing = false;
  navigator.serviceWorker && navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    location.reload();
  });

  let newWorker = null;
  const trackRegistration = (reg) => {
      /* 跟踪 installing worker 的状态变化以提示更新 */
      const track = (worker) => {
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker = worker;
            showBar('🆙 学习手册有新版本，刷新即可使用最新讲义与功能。', '立即刷新',
              () => { worker.postMessage({ action: 'skipWaiting' }); }, false);
          }
        });
      };
      track(reg.installing);
      reg.addEventListener('updatefound', () => track(reg.installing));
  };

  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) {
    /* file:// 双击使用：无 SW，静默跳过 */
  } else if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(trackRegistration);
  } else {
    navigator.serviceWorker.register('sw.js').then(trackRegistration).catch(() => {});
  }
})();
