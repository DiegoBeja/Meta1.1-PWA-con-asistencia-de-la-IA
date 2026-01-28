const CACHE_NAME = 'tareas-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

// Evento de instalación: cachear los archivos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Si falla, continuar igualmente
        console.log('Algunos archivos no pudieron ser cacheados en instalación');
      });
    })
  );
  self.skipWaiting();
});

// Evento de activación: limpiar caches antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Estrategia: Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Solo cachear peticiones GET
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cachear la respuesta exitosa
        if (response.ok) {
          const cache = caches.open(CACHE_NAME);
          cache.then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, usar el cache
        return caches.match(request).then((cached) => {
          return cached || new Response('Offline - recurso no disponible', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Sincronización en background para tareas pendientes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tareas') {
    event.waitUntil(
      // Aquí iría la lógica para sincronizar tareas cuando vuelva la conexión
      Promise.resolve()
    );
  }
});