import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

function warmOfflineCache(registration?: ServiceWorkerRegistration) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const collectAndSend = (targetWorker: ServiceWorker | null | undefined) => {
    if (!targetWorker) return;

    const resourceUrls = performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => typeof name === 'string' && name.startsWith('http'));

    const urls = Array.from(
      new Set([
        window.location.href,
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/api/content-manifest',
        'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap',
        ...resourceUrls,
      ])
    );

    targetWorker.postMessage({ type: 'WARM_CACHE', urls });
  };

  const dispatchWarm = (reg?: ServiceWorkerRegistration) => {
    const worker = reg?.active ?? navigator.serviceWorker.controller;
    collectAndSend(worker);
  };

  if (registration) {
    dispatchWarm(registration);
  }

  void navigator.serviceWorker.ready.then((readyReg) => {
    dispatchWarm(readyReg);
    window.setTimeout(() => dispatchWarm(readyReg), 1500);
  });
}

// Register PWA Service Worker for full offline caching & automatic updates
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    warmOfflineCache(registration);
  },
  onRegisterError() {
    if ('serviceWorker' in navigator) {
      const swUrl = import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js';
      const swType = import.meta.env.DEV ? 'module' : 'classic';
      void navigator.serviceWorker
        .register(swUrl, { scope: '/', type: swType })
        .then((reg) => warmOfflineCache(reg))
        .catch(() => {
          // Ignore registration error in unsupported contexts
        });
    }
  },
});

createRoot(document.getElementById('root')!).render(<App />);
