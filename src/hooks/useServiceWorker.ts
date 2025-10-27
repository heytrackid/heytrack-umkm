'use client'

import { useEffect, useState, useCallback } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isActive: boolean
  isUpdating: boolean
  updateAvailable: boolean
  error: string | null
}

interface CacheStats {
  static: number
  dynamic: number
  api: number
  total: number
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isActive: false,
    isUpdating: false,
    updateAvailable: false,
    error: null
  })

  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setState(prev => ({ ...prev, isSupported: false }))
      return
    }

    setState(prev => ({ ...prev, isSupported: true }))

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        setState(prev => ({
          ...prev,
          isRegistered: true,
          isActive: registration.active !== null
        }))

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            setState(prev => ({ ...prev, isUpdating: true }))

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({
                  ...prev,
                  isUpdating: false,
                  updateAvailable: true
                }))
              }
            })
          }
        })

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setState(prev => ({
            ...prev,
            isActive: true,
            updateAvailable: false
          }))
        })

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Service worker registration failed'
        }))
      }
    }

    registerSW()
  }, [])

  // Get cache statistics
  const getCacheStats = useCallback(async (): Promise<CacheStats | null> => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      return null
    }

    try {
      const messageChannel = new MessageChannel()

      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data)
        }

        navigator.serviceWorker.controller?.postMessage(
          { type: 'GET_CACHE_STATS' },
          [messageChannel.port2]
        )

        // Timeout after 5 seconds
        setTimeout(() => resolve(null), 5000)
      })
    } catch (err) {
      return null
    }
  }, [])

  // Update cache stats
  const updateCacheStats = useCallback(async () => {
    const stats = await getCacheStats()
    void setCacheStats(stats)
  }, [getCacheStats])

  // Update service worker
  const updateServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {return}

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.update()

      // Reload page to activate new SW
      window.location.reload()
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to update service worker'
      }))
    }
  }, [])

  // Skip waiting for update
  const skipWaiting = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {return}

    try {
      const registration = await navigator.serviceWorker.ready
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    } catch (err) {
      // Skip waiting failed silently
    }
  }, [])

  // Clear all caches
  const clearAllCaches = useCallback(async () => {
    if (!('caches' in window)) {return}

    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      await updateCacheStats()
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to clear caches'
      }))
    }
  }, [updateCacheStats])

  // Update cache stats on mount
  useEffect(() => {
    void updateCacheStats()
  }, [updateCacheStats])

  return {
    ...state,
    cacheStats,
    updateCacheStats,
    updateServiceWorker,
    skipWaiting,
    clearAllCaches,
    getCacheStats
  }
}
