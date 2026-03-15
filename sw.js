const CACHE_STATIC_NAME = 'cashtrack-static-v2';
const CACHE_DYNAMIC_NAME = 'cashtrack-dynamic-v2';
const CACHE_IMMUTABLE_NAME = 'cashtrack-immutable-v2';
const CACHE_DYNAMIC_LIMIT = 30;

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
  './src/html/partials/nav.html',
  './src/html/partials/expenses-section.html',
  './src/html/partials/budget-section.html',
  './src/html/partials/charts-section.html',
  './src/html/partials/summary-section.html',
  './src/html/partials/toast.html',
  './src/js/bootstrap.js',
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

const IMMUTABLE_URLS = ['https://cdn.jsdelivr.net/npm/chart.js'];

self.addEventListener('install', (event) => {
  const cacheStatic = caches
    .open(CACHE_STATIC_NAME)
    .then((cache) => cache.addAll(APP_SHELL));

  const cacheImmutable = caches
    .open(CACHE_IMMUTABLE_NAME)
    .then((cache) => cache.addAll(IMMUTABLE_URLS));

  event.waitUntil(Promise.all([cacheStatic, cacheImmutable]));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const validCaches = [
    CACHE_STATIC_NAME,
    CACHE_DYNAMIC_NAME,
    CACHE_IMMUTABLE_NAME,
  ];

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!validCaches.includes(key)) {
            return caches.delete(key);
          }
          return undefined;
        }),
      ),
    ),
  );

  self.clients.claim();
});

function trimDynamicCache(cacheName, maxItems) {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => trimDynamicCache(cacheName, maxItems));
      }
    });
  });
}

function cacheOnly(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return new Response('Cache miss (Cache Only)', {
      status: 504,
      statusText: 'Gateway Timeout',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  });
}

function cacheWithNetworkFallback(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;

    return fetch(request)
      .then((networkResponse) => {
        const copyForCache = networkResponse.clone();
        caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
          cache.put(request, copyForCache);
          trimDynamicCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
        });
        return networkResponse;
      })
      .catch(() => caches.match('./src/html/offline.html'));
  });
}

function networkWithCacheFallback(request) {
  return fetch(request)
    .then((networkResponse) => {
      const copyForCache = networkResponse.clone();
      caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
        cache.put(request, copyForCache);
        trimDynamicCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
      });
      return networkResponse;
    })
    .catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      return caches.match('./src/html/offline.html');
    });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  // 1) Cache Only para recursos inmutables de CDN ya precacheados.
  if (IMMUTABLE_URLS.includes(requestUrl.href)) {
    event.respondWith(cacheOnly(event.request));
    return;
  }

  // 2) Network with Cache Fallback para navegación HTML.
  if (event.request.mode === 'navigate') {
    event.respondWith(networkWithCacheFallback(event.request));
    return;
  }

  // 3) Cache with Network Fallback para CSS/JS/imagenes/partials.
  event.respondWith(cacheWithNetworkFallback(event.request));
});
