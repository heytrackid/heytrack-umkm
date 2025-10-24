/**
 * Service Worker for HeyTrack PWA
 * Provides offline caching, background sync, and improved performance
 */

const CACHE_NAME = 'heytrack-v1.0.0'
const STATIC_CACHE = 'heytrack-static-v1.0.0'
const API_CACHE = 'heytrack-api-v1.0.0'
const IMAGE_CACHE = 'heytrack-images-v1.0.0'

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/orders',
  '/profit',
  '/hpp',
  '/automation',
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/dashboard',
  '/api/orders',
  '/api/profit',
  '/api/hpp',
  '/api/ingredients',
  '/api/customers'
]

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Install event')

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),

      // Cache API endpoints
      caches.open(API_CACHE).then(cache => {
        console.log('[SW] Pre-caching API endpoints')
        return Promise.all(
          API_ENDPOINTS.map(url =>
            fetch(url).then(response => {
              if (response.ok) {
                cache.put(url, response.clone())
              }
            }).catch(() => {
              console.log(`[SW] Failed to cache ${url}`)
            })
          )
        )
      })
    ]).then(() => {
      console.log('[SW] Installation complete')
      return self.skipWaiting()
    })
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activate event')

  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== STATIC_CACHE &&
                cacheName !== API_CACHE &&
                cacheName !== IMAGE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),

      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete')
    })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle different types of requests
  if (request.method === 'GET') {
    if (isImageRequest(request)) {
      event.respondWith(handleImageRequest(request))
    } else if (isApiRequest(request)) {
      event.respondWith(handleApiRequest(request))
    } else if (isStaticAsset(request)) {
      event.respondWith(handleStaticRequest(request))
    } else {
      event.respondWith(handleDefaultRequest(request))
    }
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event: ExtendableEvent) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Push notifications (future enhancement)
self.addEventListener('push', (event: PushEvent) => {
  console.log('[SW] Push received:', event.data?.text())

  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: data.url
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[SW] Notification click:', event.notification.data)

  event.notification.close()

  if (event.notification.data) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data)
    )
  }
})

// Helper functions
function isImageRequest(request: Request): boolean {
  return request.destination === 'image' ||
         request.url.includes('.jpg') ||
         request.url.includes('.jpeg') ||
         request.url.includes('.png') ||
         request.url.includes('.webp') ||
         request.url.includes('.svg')
}

function isApiRequest(request: Request): boolean {
  return request.url.includes('/api/')
}

function isStaticAsset(request: Request): boolean {
  return request.destination === 'script' ||
         request.destination === 'style' ||
         request.destination === 'font' ||
         request.url.includes('.js') ||
         request.url.includes('.css') ||
         request.url.includes('.woff')
}

async function handleImageRequest(request: Request): Promise<Response> {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fetch from network
    const response = await fetch(request)
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(IMAGE_CACHE)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.log('[SW] Image fetch failed:', error)
    // Return offline placeholder
    return new Response('', { status: 404 })
  }
}

async function handleApiRequest(request: Request): Promise<Response> {
  try {
    // Try network first for fresh data
    const response = await fetch(request)

    if (response.ok) {
      // Cache successful GET responses
      if (request.method === 'GET') {
        const cache = await caches.open(API_CACHE)
        cache.put(request, response.clone())
      }
    }

    return response
  } catch (error) {
    console.log('[SW] API fetch failed, trying cache:', error)

    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Content not available offline'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleStaticRequest(request: Request): Promise<Response> {
  // Cache-first strategy for static assets
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('[SW] Static asset fetch failed:', error)
    return new Response('', { status: 404 })
  }
}

async function handleDefaultRequest(request: Request): Promise<Response> {
  // Network-first strategy for pages
  try {
    const response = await fetch(request)
    return response
  } catch (error) {
    console.log('[SW] Page fetch failed, trying cache:', error)

    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page
    const offlineResponse = await caches.match('/')
    if (offlineResponse) {
      return offlineResponse
    }

    return new Response(
      '<h1>Offline</h1><p>You are currently offline. Please check your connection.</p>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    )
  }
}

async function doBackgroundSync(): Promise<void> {
  console.log('[SW] Performing background sync')

  try {
    // Sync offline actions (to be implemented)
    // - Send queued API requests
    // - Sync local changes
    // - Update cached data

    console.log('[SW] Background sync completed')
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Periodic cache cleanup (run every hour)
setInterval(async () => {
  try {
    const cache = await caches.open(API_CACHE)
    const keys = await cache.keys()

    // Remove old API responses (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000)

    for (const request of keys) {
      const response = await cache.match(request)
      if (response) {
        const date = response.headers.get('date')
        if (date && new Date(date).getTime() < oneHourAgo) {
          await cache.delete(request)
        }
      }
    }

    console.log('[SW] Cache cleanup completed')
  } catch (error) {
    console.error('[SW] Cache cleanup failed:', error)
  }
}, 60 * 60 * 1000) // Every hour
