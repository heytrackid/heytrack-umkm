import { NextResponse } from 'next/server'

/**
 * API Response Caching Utilities
 * Provides HTTP caching headers and in-memory cache
 */


export interface CacheConfig {
  maxAge?: number // seconds
  staleWhileRevalidate?: number // seconds
  public?: boolean
  immutable?: boolean
}

/**
 * Create response with cache headers
 */
export function createCachedResponse<T>(
  data: T,
  config: CacheConfig = {}
): NextResponse<T> {
  const {
    maxAge = 60,
    staleWhileRevalidate = 300,
    public: isPublic = true,
    immutable = false
  } = config

  const cacheControl = [
    isPublic ? 'public' : 'private',
    `s-maxage=${maxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`,
    immutable ? 'immutable' : ''
  ]
    .filter(Boolean)
    .join(', ')

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': cacheControl,
      'CDN-Cache-Control': `max-age=${maxAge}`,
      'Vercel-CDN-Cache-Control': `max-age=${maxAge}`
    }
  })
}

/**
 * In-memory cache for API responses
 */
interface CacheEntry {
  data: unknown
  timestamp: number
  ttl: number
}

class MemoryCache {
  private readonly cache = new Map<string, CacheEntry>()
  private readonly maxSize = 100
  private readonly ttl = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: unknown, ttl = this.ttl): void {
    // Limit cache size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (typeof firstKey === 'string') {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string | undefined): T | null {
    if (!key) {
      return null
    }
    
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Check if expired
    if (Date.now() - item['timestamp'] > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item['data'] as T
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) {return false}

    // Check if expired
    if (Date.now() - item['timestamp'] > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

export const apiCache = new MemoryCache()

/**
 * Cache key generator
 */
export function generateCacheKey(
  endpoint: string,
  params?: Record<string, boolean | number | string | null | undefined>
): string {
  if (!params) {return endpoint}

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key] ?? ''}`)
    .join('&')

  return `${endpoint}?${sortedParams}`
}

/**
 * Cached fetch wrapper
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = apiCache.get<T>(key)
  if (cached) {
    return cached
  }

  // Fetch and cache
  const data = await fetcher()
  apiCache.set(key, data, ttl ?? undefined)

  return data
}

/**
 * Cache invalidation patterns
 */
export const cacheInvalidation = {
  // Invalidate all caches for a resource
  invalidateResource(resource: string): void {
    apiCache.keys().forEach((key) => {
      if (key.includes(resource)) {
        apiCache.delete(key)
      }
    })
  },

  // Invalidate specific pattern
  invalidatePattern(pattern: RegExp): void {
    apiCache.keys().forEach((key) => {
      if (pattern.test(key)) {
        apiCache.delete(key)
      }
    })
  },

  // Clear all caches
  clearAll(): void {
    apiCache.clear()
  }
}

/**
 * Cache presets for common scenarios
 */
export const cachePresets = {
  // Static data that rarely changes
  static: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 1 day
    public: true,
    immutable: true
  },

  // Dynamic data that changes frequently
  dynamic: {
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 300, // 5 minutes
    public: true,
    immutable: false
  },

  // User-specific data
  private: {
    maxAge: 30, // 30 seconds
    staleWhileRevalidate: 60, // 1 minute
    public: false,
    immutable: false
  },

  // Real-time data
  realtime: {
    maxAge: 0,
    staleWhileRevalidate: 0,
    public: false,
    immutable: false
  }
}
