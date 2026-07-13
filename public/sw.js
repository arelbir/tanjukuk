const CACHE_NAME = 'hukuk-buro-shell-v3'
const APP_SHELL = ['/offline', '/manifest.json', '/icon-192.svg', '/icon-512.svg']

const NEVER_CACHE_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /\/storage\//,
  /\/documents\//,
  /supabase/i,
  /\/_next\//,
]

function shouldNeverCache(request) {
  const url = new URL(request.url)
  if (request.method !== 'GET') return true
  if (url.origin !== self.location.origin) return true
  return NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname) || pattern.test(url.href))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (shouldNeverCache(request)) {
    event.respondWith(fetch(request))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline').then((response) => response || caches.match('/')))
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response
        const cloned = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned))
        return response
      })
    })
  )
})

self.addEventListener('push', (event) => {
  const payload = event.data?.json?.() || { title: 'Hukuk Büro', body: event.data?.text() || 'Yeni bildirim' }
  const options = {
    body: payload.body || 'Yeni bildirim',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    data: payload.data || { url: '/notifications' },
    actions: [
      {
        action: 'open',
        title: 'Görüntüle',
      },
      {
        action: 'close',
        title: 'Kapat',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(payload.title || 'Hukuk Büro', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'close') return
  const url = event.notification.data?.url || '/notifications'
  event.waitUntil(clients.openWindow(url))
})
