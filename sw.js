// Instalación del Service Worker
self.addEventListener('install', () => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', () => {
  console.log('Service Worker activado');
  self.clients.claim();
});

// Fetch: pasar todas las peticiones a la red directamente
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
