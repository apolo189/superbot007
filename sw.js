// Super Bot 007 — Service Worker NUCLEAR CLEANER v3.0
// This SW destroys itself and all caches immediately

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    // Delete ALL caches
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => {
      // Unregister self
      return self.registration.unregister();
    }).then(() => self.clients.claim())
     .then(() => {
       // Force reload all clients
       return self.clients.matchAll({ type: 'window' });
     }).then(clients => {
       clients.forEach(client => client.navigate(client.url));
     })
  );
});

self.addEventListener('fetch', e => {
  // Always fetch from network, never cache
  e.respondWith(fetch(e.request, { cache: 'no-store' }));
});
