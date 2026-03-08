const CACHE_NAME = 'cashtrack-v1';

// App Shell: recursos esenciales que se cachean al instalar
const APP_SHELL = [
  '/',
  'index.html',
  'styles.css',
  'app.js',
  'offline.html',
];

// ===== INSTALL: Guardar el App Shell en Cache Storage =====
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando... guardando App Shell en caché');

  const promesa = caches.open(CACHE_NAME).then((cache) => {
    console.log('[SW] Cache abierto:', CACHE_NAME);
    return cache.addAll(APP_SHELL);
  });

  // event.waitUntil() garantiza que el SW no se activa
  event.waitUntil(promesa);

  self.skipWaiting();
});

// ===== ACTIVATE: Limpiar caches obsoletos =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando... limpiando caches obsoletos');

  const promesa = caches.keys().then((keys) => {
    console.log('[SW] Caches encontrados:', keys);

    return Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Eliminando cache obsoleto:', key);
          return caches.delete(key);
        }
      }),
    );
  });

  event.waitUntil(promesa);

  // Tomar control inmediato de todas las páginas abiertas
  self.clients.claim();
});

// ===== FETCH: Interceptar peticiones y responder con cache =====
self.addEventListener('fetch', (event) => {
  // Solo manejar peticiones GET del mismo origen
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // Paso 1: Buscar en el cache (como se vio en clase: caches.match())
    caches.match(event.request).then((respuestaCache) => {
      // Si está en cache, devolverlo directamente (Cache First)
      if (respuestaCache) {
        console.log('[SW] Sirviendo desde caché:', event.request.url);
        return respuestaCache;
      }

      // Paso 2: No está en cache → ir a la red
      console.log('[SW] Fetching desde red:', event.request.url);

      return fetch(event.request)
        .then((respuestaRed) => {
          // Verificar que la respuesta sea válida
          if (!respuestaRed || !respuestaRed.ok) {
            return respuestaRed;
          }

          // Guardar en cache para uso futuro (como cache.put() visto en clase)
          const respuestaParaCache = respuestaRed.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, respuestaParaCache);
          });

          return respuestaRed;
        })
        .catch(() => {
          // Paso 3: Sin conexión → mostrar página offline
          console.log('[SW] Sin conexión, mostrando offline.html');

          // Si es una petición de página HTML, mostrar offline.html
          const acceptHeader = event.request.headers.get('accept') || '';
          if (acceptHeader.includes('text/html')) {
            return caches.match('offline.html');
          }

          // Para otros recursos (CSS, JS, etc.) que no están en cache
          return new Response('Recurso no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    }),
  );
});