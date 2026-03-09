const CACHE_NAME = 'cashtrack-v5';

const APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');

  const promesa = caches.open(CACHE_NAME).then((cache) => {
    return cache.addAll(APP_SHELL);
  });

  event.waitUntil(promesa);
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');

  const promesa = caches.keys().then((keys) => {
    return Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }),
    );
  });

  event.waitUntil(promesa);
  self.clients.claim();
});

// Fetch: Cache First con fallback a offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.registration.scope)) return;

  event.respondWith(
    caches.match(event.request).then((respuestaCache) => {
      if (respuestaCache) {
        return respuestaCache;
      }

      return fetch(event.request).catch(() => {
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.match('/offline.html');
        });
      });
    }),
  );
});
