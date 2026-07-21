// ==========================================================================
// [SW-SEC-01] ASSET CACHE MATRIX INITIALIZATION & SETUP
// ==========================================================================
// Bunted Cache Version string to force service worker updates for returning players
const CACHE_NAME = 'starforge-cache-v15';
const urlsToCache = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './break_infinity.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ==========================================================================
// [SW-SEC-02] LIFE-CYCLE ASSET ACTIVATION & DYNAMIC RETRIEVAL INTERCEPTS
// ==========================================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Clearing old system cache matrix asset:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        if (fetchRes && fetchRes.ok && fetchRes.status === 200) {
          const clone = fetchRes.clone();
          caches.open(CACHE_NAME).then(cache => {
            if (event.request.url.startsWith('http')) {
              cache.put(event.request, clone);
            }
          });
        }
        return fetchRes;
      });
    })
  );
});