self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch (no caching) - just to satisfy PWA requirements
  event.respondWith(fetch(event.request));
});
