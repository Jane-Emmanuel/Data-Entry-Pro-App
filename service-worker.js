const CACHE_NAME = "data-entry-pro-suite-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./script.js",
  "./style.css",
  "./manifest.json"
];

// install
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

// activate - cleanup
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })))
  );
  self.clients.claim();
});

// fetch
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
