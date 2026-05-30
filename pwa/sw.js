const SW_VERSION = 'statux-sw-v1';

const SHELL_CACHE = 'statux-shell-v1';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/home.css',
  '/home.html',
  '/home.js',
  '/script.js',
  '/dashboard-loader.js',
  '/Dashboard/dashboard.html',
  '/Dashboard/dashboard.css',
  '/Dashboard/dashboard.js',
  '/Systux core/core.js',
  '/Systux core/core.css',
  '/data/cards.json',
  '/data/home-novedades.json',
  '/pwa/manifest.json',
  '/Ubuntu-Regular.woff2',
  '/Ubuntu-Regular.woff',
  '/Statux-logo(SVG).svg',
  '/Home.svg',
  '/usuario.svg',
  '/Login.svg',
  '/Logout.svg',
  '/search.svg',
  '/Ebootux.svg',
  '/Plantitux.svg',
  '/Getux.svg',
  '/Movitux.svg',
  '/Mindtux.svg',
  '/Soundtux.svg',
  '/Tracktux.svg',
  '/Marketux.svg',
  '/Afiliado.svg',
  '/content_copy.svg',
  '/check_circle.svg',
  '/candado.svg',
  '/favicoin.ico',
];

const DATA_CACHE = 'statux-data-v1';
const SYSTUX_CACHE = 'statux-modules';


// ════════════════════════════════════════════
// INSTALL
// ════════════════════════════════════════════
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return Promise.allSettled(
        SHELL_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] No se pudo cachear: ${url}`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});


// ════════════════════════════════════════════
// ACTIVATE
// ════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  const VALID_CACHES = [SHELL_CACHE, DATA_CACHE, SYSTUX_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !VALID_CACHES.includes(name))
          .map((name) => {
            console.log(`[SW] Borrando cache viejo: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});


// ════════════════════════════════════════════
// FETCH
// ════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  const EXTERNAL_BYPASS = [
    'firebaseapp.com',
    'googleapis.com',
    'gstatic.com',
    'gumroad.com',
    'netlify.app',
    'unsplash.com',
    'statux.netlify.app',
  ];

  if (EXTERNAL_BYPASS.some((domain) => url.hostname.includes(domain))) return;

  // Shell assets → Cache First con revalidación en background
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(SHELL_CACHE).then((cache) => {
                  cache.put(request, networkResponse.clone());
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          caches.open(SHELL_CACHE).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => {
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
    );
    return;
  }

  // Data JSON → Network First con fallback a cache
  if (url.pathname.includes('/data/') ||
      request.headers.get('accept')?.includes('application/json')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(DATA_CACHE).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Systux descargados → Cache First estricto
  event.respondWith(
    caches.open(SYSTUX_CACHE).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request);
      });
    })
  );
});


// ════════════════════════════════════════════
// MESSAGE
// ════════════════════════════════════════════
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'SW_VERSION', version: SW_VERSION });
    return;
  }

  if (type === 'CLEAR_CACHE' && payload?.cacheName) {
    caches.delete(payload.cacheName).then((deleted) => {
      event.source?.postMessage({
        type: 'CACHE_CLEARED',
        cacheName: payload.cacheName,
        deleted
      });
    });
    return;
  }

  if (type === 'GET_CACHE_INFO') {
    caches.keys().then(async (cacheNames) => {
      const info = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return { name, count: keys.length };
        })
      );
      event.source?.postMessage({ type: 'CACHE_INFO', caches: info });
    });
    return;
  }
});
