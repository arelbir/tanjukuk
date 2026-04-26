const CACHE_NAME = 'hukuk-buro-v1'
const urlsToCache = ['/']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  )
})

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Yeni bildirim',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Görüntüle',
        icon: '/icon-192.png',
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icon-192.png',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification('Hukuk Bürosu', options))
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'))
  }
})
