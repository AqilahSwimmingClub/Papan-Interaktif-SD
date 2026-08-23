const CACHE_SHELL = 'papan-interaktif-sd-shell-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_SHELL).then((cache) => cache.addAll(['/', '/index.html'])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_SHELL).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(
      (tersimpan) =>
        tersimpan ??
        fetch(event.request).then((respons) => {
          if (respons.ok) {
            const salinan = respons.clone();
            void caches.open(CACHE_SHELL).then((cache) => cache.put(event.request, salinan));
          }
          return respons;
        }),
    ),
  );
});
