const CACHE_NAME = 'cityhut-pizza-v10';
const ASSETS = [
  '/',
  '/menu',
  '/contact',
  '/css/style.css',
  '/js/main.js',
  '/firebase-config.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/logo-circle.jpg',
  '/images/logo-rect.jpg'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {});
    })
  );
});

// Support Push notifications from FCM/VAPID in the future
self.addEventListener('push', (e) => {
  let data = { title: 'Cafe Pizza House 🍕', body: 'New Alert!' };
  if (e.data) {
    try {
      data = e.data.json();
    } catch (err) {
      data = { title: 'Cafe Pizza House 🍕', body: e.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/images/icon-192.png',
    badge: '/images/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const url = e.notification.data ? e.notification.data.url : '/';
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
