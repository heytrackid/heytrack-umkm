// Service Worker for caching static assets and API responses
// This improves performance by reducing network requests

const CACHE_NAME = 'heytrack-v1'
const STATIC_CACHE = 'heytrack-static-v1'
const API_CACHE = 'heytrack-api-v1'

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/orders',
  '/inventory',
  '/recipes',
  '/ai-chatbot',
  '/favicon.ico',
  '/manifest.json',
  // Cache fonts
  '/fonts/geist-sans.woff2',
  '/fonts/geist-mono.woff2',
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/dashboard/stats',
  '/api/orders',
  '/api/inventory',
  '/api/recipes',
]

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      await cache.addAll(STATIC_ASSETS)
      // Force activation of new service worker
      await (self as any).skipWaiting()
    })()
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== API_CACHE)
          .map(name => caches.delete(name))
      )
      // Take control of all clients
      await (self as any).clients.claim()
    })()
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname) || isStaticAsset(url)) {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Default network-first strategy for other requests
  event.respondWith(
    fetch(request).catch(() => {
      // Fallback to cache if network fails
      return caches.match(request)
    })
  )
})

async function handleApiRequest(request: Request): Promise<Response> {
  const cache = await caches.open(API_CACHE)

  try {
    // Network-first strategy for API calls
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Fallback to cache if network fails
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    // Return offline response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'You are currently offline. Please check your internet connection.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function handleStaticRequest(request: Request): Promise<Response> {
  const cache = await caches.open(STATIC_CACHE)

  // Cache-first strategy for static assets
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match('/')
      return offlinePage || new Response('Offline', { status: 503 })
    }
    throw error
  }
}

function isStaticAsset(url: URL): boolean {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2']
  return staticExtensions.some(ext => url.pathname.endsWith(ext))
}

// Background sync for offline actions
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Implement background sync logic here
  // This would retry failed API calls when connection is restored
  console.log('Background sync triggered')
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event: any) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: data.url
    }

    event.waitUntil(
      (self as any).registration.showNotification(data.title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close()

  event.waitUntil(
    (self as any).clients.openWindow(event.notification.data || '/')
  )
})