/* CAPSULE CITY PWA — cached application shell. Update CACHE_VERSION on new releases. */
const CACHE_VERSION = 'capsule-city-5-20-pwa-v2';
const ESSENTIAL = [
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];
const PREFIX = 'capsule-city-';
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ESSENTIAL))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.put('./index.html', copy)));
        }
        return response;
      }).catch(async () => (await caches.match('./index.html')) || Response.error())
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.put(request, copy)));
      }
      return response;
    }))
  );
});
