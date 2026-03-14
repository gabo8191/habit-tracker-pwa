const CACHE_NAME = 'cashtrack-v10';

const APP_SHELL = [
  './',
  './index.html',
  './src/css/main.css',
  './src/css/base.css',
  './src/css/navigation.css',
  './src/css/forms-and-cards.css',
  './src/css/expenses-budgets.css',
  './src/css/charts-summary.css',
  './src/css/feedback-print.css',
  './src/html/offline.html',
  './src/js/main.js',
  './src/js/constants.js',
  './src/js/state.js',
  './src/js/storage.js',
  './src/js/utils.js',
  './src/js/ui.js',
  './src/js/navigation.js',
  './src/js/filters.js',
  './src/js/expenses.js',
  './src/js/budgets.js',
  './src/js/charts.js',
  './src/js/summary.js',
  './src/js/events.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return undefined;
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const reqUrl = new URL(event.request.url);
  if (reqUrl.origin !== self.location.origin) return;

  // For document navigation, prefer network and fall back to offline page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(async () => {
          const cachedPage = await caches.match(event.request);
          if (cachedPage) return cachedPage;
          return caches.match('./src/html/offline.html');
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request);
    }),
  );
});
