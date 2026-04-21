const STATIC_CACHE = "scv-static-v1";
const APP_SHELL = [
    "/",
    "/index.html",
    "/manifest.json",
    "/css/styles.css",
    "/js/config.js",
    "/js/api.js",
    "/js/app.js",
    "/js/pwa.js",
    "/images/logo-claro.png",
    "/images/logo-oscuro.png",
    "/assets/icons/people.svg",
    "/assets/icons/truck.svg",
    "/assets/icons/clipboard-check.svg",
    "/assets/icons/bar-chart-line.svg",
    "/assets/icons/box-arrow-right.svg",
    "/assets/icons/box-arrow-in-left.svg",
    "/assets/icons/box-arrow-up-right.svg",
    "/assets/icons/search.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key !== STATIC_CACHE)
                .map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(request.url);

    if (requestUrl.pathname.startsWith("/api/")) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put("/index.html", clone));
                    return response;
                })
                .catch(() => caches.match("/index.html"))
        );
        return;
    }

    if (requestUrl.origin === self.location.origin) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) {
                    return cached;
                }
                return fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
                    return response;
                });
            })
        );
    }
});
