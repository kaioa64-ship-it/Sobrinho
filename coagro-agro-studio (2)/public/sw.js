/**
 * Service Worker Oficial — Coagro Agro Studio (PWA Offline Cache)
 * Versão do Cache: coagro-studio-v1
 *
 * Estratégia híbrida:
 * - HTML / Navegação: NetworkFirst com fallback para cache raiz (garante F5 offline sem tela branca)
 * - Assets locais (/assets/): CacheFirst com background revalidation
 * - Expurgo estrito de versões antigas no activate
 */

const CACHE_NAME = 'coagro-studio-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/icon.jpg',
  '/tenant.config.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pré-cache parcial:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-HTTP(S)
  if (!url.protocol.startsWith('http')) return;

  // Não intercepta chamadas de CDN externa de modelos pesados (staticimgly.com)
  if (url.origin !== self.location.origin) return;

  // Navegação SPA -> NetworkFirst com fallback para index.html em cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Assets locais (/assets/) -> CacheFirst com revalidação
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Requisições gerais do app -> Network com fallback para Cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok && request.method === 'GET') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
