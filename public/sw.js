/* ═══════════════════════════════════════════
   TECHNO-PRINT Service Worker
   Cache: technoprint-v2026-final
   ═══════════════════════════════════════════ */

const CACHE_NAME = 'technoprint-v2026-final';
const OFFLINE_URL = '/index.html';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/ui-colors.css',
  '/css/ui-glass.css',
  '/css/ui-buttons.css',
  '/css/ui-header.css',
  '/css/ui-modals.css',
  '/css/animations.css',
  '/css/luxury-theme.css',
  '/js/eng-main.js',
  '/js/eng-navigation.js',
  '/js/eng-slider.js',
  '/js/supabase-client.js',
  '/js/student-dashboard.js',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

/* ── INSTALL ── */
self.addEventListener('install', function(event) {
  console.log('[SW] Installing:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(function() {
        console.log('[SW] All assets cached');
        return self.skipWaiting(); // Force activate immediately
      })
      .catch(function(err) {
        console.warn('[SW] Cache failed (non-fatal):', err.message);
        return self.skipWaiting();
      })
  );
});

/* ── ACTIVATE — delete old caches & claim clients ── */
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating:', CACHE_NAME);
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(name) { return name !== CACHE_NAME; })
            .map(function(name) {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(function() {
        // Take control of ALL open tabs immediately
        return self.clients.claim();
      })
      .then(function() {
        // Force all clients to reload with new version
        return self.clients.matchAll({ type: 'window' });
      })
      .then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
        });
        console.log('[SW] Activated and claimed all clients');
      })
  );
});

/* ── FETCH — Network first, cache fallback ── */
self.addEventListener('fetch', function(event) {
  const url = event.request.url;

  // Skip non-GET and external APIs
  if (event.request.method !== 'GET') return;
  if (url.includes('supabase.co')) return;
  if (url.includes('googleapis.com')) return;
  if (url.includes('cdnjs.cloudflare.com')) return;
  if (url.includes('jsdelivr.net')) return;
  if (url.includes('picsum.photos')) return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(function() {
        return caches.match(event.request)
          .then(function(cached) {
            return cached || caches.match(OFFLINE_URL);
          });
      })
  );
});

/* ── PUSH NOTIFICATIONS ── */
self.addEventListener('push', function(event) {
  let data = { title: 'TECHNOPRINT', message: '' };
  try { data = event.data ? event.data.json() : data; } catch(e) {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'TECHNOPRINT', {
      body:    data.message || data.body || '',
      icon:    '/images/icon-192.png',
      badge:   '/images/icon-192.png',
      dir:     'rtl',
      lang:    'ar',
      vibrate: [200, 100, 200],
      data:    { url: data.url || '/' }
    })
  );
});

/* ── NOTIFICATION CLICK ── */
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

console.log('[SW] Service Worker loaded:', CACHE_NAME);