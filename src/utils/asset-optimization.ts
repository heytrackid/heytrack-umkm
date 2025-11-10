// Asset optimization utilities for HeyTrack

import { apiLogger } from '@/lib/logger'

/**
 * Optimize image loading with WebP format support and fallback
 */
export const optimizeImage = (src: string, width?: number, quality = 75): string => {
  if (!src) {return ''}
  
  // If it's already a WebP or AVIF image, return as is
  if (src.endsWith('.webp') || src.endsWith('.avif')) {
    return src
  }
  
  // If it's a local image, optimize it
  if (src.startsWith('/')) {
    const params = new URLSearchParams()
    if (width) {params.set('w', width.toString())}
    params.set('q', quality.toString())
    params.set('f', 'webp')

    return `${src}?${params.toString()}`
  }
  
  // If it's a remote image, try to optimize via an image optimization service
  // This is a placeholder - implement with actual image optimization service
  return src
}

/**
 * Lazy load components with performance tracking
 */
export const lazyLoadWithPerf = async <T extends Record<string, unknown>>(
  importFn: () => Promise<T>,
  componentName: string
): Promise<T> => {
  const start = performance.now()
  try {
    const importedModule = await importFn()
    const duration = performance.now() - start

    apiLogger.debug({ componentName, duration: duration.toFixed(2) }, `Lazy load took ${duration.toFixed(2)}ms`)

    if (duration > 100) {
      apiLogger.warn({ componentName, duration: duration.toFixed(2) }, `Slow lazy load detected`)
    }

    return importedModule
  } catch (error) {
    apiLogger.error({ componentName, error }, 'Error lazy loading component')
    throw error
  }
}

/**
 * Debounced image loader to prevent excessive network requests
 */
export const createDebouncedImageLoader = (delay = 300) => {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (src: string, callback: (image: HTMLImageElement) => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      const img = new Image()
      img.onload = () => callback(img)
      img.onerror = (error) => {
        apiLogger.error({ error, src }, 'Image load error')
        callback(img)
      }
      img.src = src
    }, delay)
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }
}

/**
 * Preload critical resources for better performance
 */
export const preloadResource = (url: string, as: 'fetch' | 'font' | 'image' | 'script' | 'style'): void => {
  if (typeof document === 'undefined') {return}
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = url
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous'
  } else if (as === 'fetch') {
    link.crossOrigin = 'anonymous'
  }
  
  document.head.appendChild(link)
  
  // Clean up after 30 seconds to prevent memory leaks
  setTimeout(() => {
    document.head.removeChild(link)
  }, 30000)
}

/**
 * Resource cache with TTL for avoiding repeated downloads
 */
class ResourceCache {
  private static instance: ResourceCache
  private readonly cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()
  
  private constructor() {}
  
  static getInstance(): ResourceCache {
    if (!ResourceCache.instance) {
      ResourceCache.instance = new ResourceCache()
    }
    return ResourceCache.instance
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) {return null}
    
    if (Date.now() - item['timestamp'] > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item['data'] as T
  }
  
  set<T>(key: string, data: T, ttl = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    
    // Clean up expired items periodically
    if (this.cache.size > 100) { // Prevent unbounded growth
      const now = Date.now()
      for (const [key, item] of this.cache.entries()) {
        if (now - item['timestamp'] > item.ttl) {
          this.cache.delete(key)
        }
      }
    }
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item['timestamp'] > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const resourceCache = ResourceCache.getInstance()

/**
 * Optimized data fetching with caching and error handling
 */
export const optimizedFetch = async <T = unknown>(
  url: string,
  options: RequestInit = {},
  cacheTtl = 300000 // 5 minutes default
): Promise<T> => {
  // Try cache first
  const cached = resourceCache.get<T>(url)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options['headers'],
        // Add cache headers for HTTP caching
        'Cache-Control': 'public, max-age=300',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response['status']}`)
    }

    const data = await response.json() as T

    // Cache the successful response
    resourceCache.set(url, data, cacheTtl)
    
    return data
  } catch (error) {
    apiLogger.error({ error, url }, 'Fetch error')

    // Try to return stale data if available
    const stale = resourceCache.get<T>(url)
    if (stale) {
      apiLogger.warn({ url }, 'Returning stale data')
      return stale
    }
    
    throw error
  }
}

/**
 * Memory-efficient data processing for large datasets
 */
export const processLargeDataset = <T, R>(
  data: T[],
  processor: (item: T) => R,
  chunkSize = 1000
): R[] => {
  const results: R[] = []
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    const chunkResults = chunk.map(processor)
    results.push(...chunkResults)
    
    // Yield to the event loop to prevent blocking
    if (i % (chunkSize * 10) === 0) {
      // This is just an optimization note - in a real Node.js/Next.js environment
      // we'd need to use something like setImmediate or promises to yield control
    }
  }
  
  return results
}