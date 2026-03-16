// Super Bot 007 — Service Worker v2.0 (cache buster)
const CACHE_VERSION = 'sb007-v2-' + Date.now();
const CACHE_NAME = CACHE_VERSION;

// On install — skip waiting to activate immediately
self.addEventListener('install', e => {
  self.skipWaiting();
});

// On activate — delete ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        console.log('[SW] Deleting old cache:', key);
        return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// Fetch — always go to network, never serve from cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .catch(() => caches.match(e.request))
  );
});
