const STATIC_CACHE = "statux-cache-v1";
const MODULES_CACHE = "statux-modules";
const CORE_ASSETS = ["/", "/index.html", "/style.css", "/script.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, MODULES_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, responseClone);
            }
          });
          return response;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
