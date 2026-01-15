const CACHE_NAME = 'animanga-v1';
const DYNAMIC_CACHE = 'animanga-dynamic-v1';

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/components/MediaCard.tsx',
  '/components/MediaForm.tsx',
  '/components/StatsView.tsx',
  '/services/storageService.ts',
  '/services/geminiService.ts',
  '/manifest.json'
];

// Domains to cache (CDNs)
const EXTERNAL_DOMAINS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'esm.sh',
  'picsum.photos', // Mock images
  'cdn-icons-png.flaticon.com' // Icons
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy 1: Cache First for External Assets (Fonts, Libraries, Images)
  if (EXTERNAL_DOMAINS.some(domain => url.hostname.includes(domain))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // Strategy 2: Stale-While-Revalidate for Local App Files
  // This ensures the user sees the cached version immediately, but the cache updates in background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});