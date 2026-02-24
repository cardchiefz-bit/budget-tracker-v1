const CACHE_NAME = "budget_tracker_cache_v1";

const CORE_ASSETS = [
  "./MyPersonalFinanceBudgetTracker.html",
  "./manifest.webmanifest",
  "./service_worker.js",
  "./chart_umd_min.js",
  "./apple_touch_icon.png",
  "./icon_192.png",
  "./icon_512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("./MyPersonalFinanceBudgetTracker.html");
          }
          return cached;
        });
    })
  );
});
