
const CACHE_NAME = 'flammes-up-v3'; // Bump to v3
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/index.css',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Ne pas intercepter les requêtes vers Firebase ou d'autres domaines externes
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Stratégie : Network First pour tout ce qui est local
    // On essaie le réseau, si ça échoue (offline), on prend le cache
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
