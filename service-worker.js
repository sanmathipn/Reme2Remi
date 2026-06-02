const CACHE_NAME = 'task-reminder-cache-v1';

// List of files to cache for offline use
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install event: cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event: cache-first strategy for GET requests
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Serve from cache first
        return cached;
      }
      // Otherwise go to network and cache the response for next time
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, copy);
        });
        return response;
      }).catch(() => cached);
    })
  );
});

// Optional: simple notification hook (not used yet, but ready)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title || 'Task Reminder', {
      body: event.data.body || 'Update your task status.',
      icon: undefined,
      badge: undefined
    });
  }
});
