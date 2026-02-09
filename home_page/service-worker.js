const CACHE_NAME = 'shopbeha-v1';
const IMAGE_CACHE_NAME = 'shopbeha-images-v1';

const ASSETS_TO_CACHE = [
    '/',
    '/css/front_page.css',
    '/home_page/css/front_page.css',
    '/js/shopbeha.js',
    '/home_page/js/shopbeha.js',
    '/js/cart.js',
    '/home_page/js/cart.js',
    '/home_page/js/ui.js',
    '/js/ui.js',
    '/home_page/js/front_page.js',
    '/js/front_page.js',
    '/offline.html'
];

// Install Event: Cache critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.error('Failed to cache assets during install:', err);
            });
        })
    );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME, IMAGE_CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event: Serve from cache or network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Strategy for Images (especially Supabase Storage): Stale-While-Revalidate
    // This serves the cached image immediately if available, then updates the cache in the background.
    if (event.request.destination === 'image' || (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/'))) {
        event.respondWith(
            caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);

                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // Check if we received a valid response
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(err => {
                    // Network failure, just return what we have (or nothing if nothing cached)
                    console.warn('Network fetch failed for image', err);
                });

                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // Strategy for Static Assets (CSS, JS): Cache First, fallback to Network
    if (ASSETS_TO_CACHE.includes(new URL(event.request.url).pathname)) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
        return;
    }

    // Default: Network Only (for API calls, HTML pages to ensure freshness, etc.)
    // We don't want to cache API calls blindly.
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // Fallback for everything else
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
