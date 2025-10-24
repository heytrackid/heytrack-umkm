/**
 * Request Caching Utilities
 * Cache invalidation and SWR patterns
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class RequestCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private pendingRequests = new Map<string, Promise<unknown>>()

  /**
   * Get cached data if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cache with TTL
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalidate by pattern (e.g., "customers:*")
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(`^${pattern.replace('*', '.*')}$`)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Deduplicate requests - return pending request if one is already in flight
   */
  dedup<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    const promise = fetcher()
      .finally(() => {
        this.pendingRequests.delete(key)
      })

    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * Get cache stats
   */
  stats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    }
  }
}

// Singleton instance
const requestCache = new RequestCache()

export { requestCache, type CacheEntry }

/**
 * Cache-aware fetch with SWR (Stale-While-Revalidate) pattern
 */
export async function cachedFetch<T>(
  url: string,
  options: {
    cache?: boolean
    ttl?: number // Default 5 minutes
    revalidate?: boolean // Force revalidation
    onStale?: (staleData: T) => void
  } = {}
): Promise<T> {
  const { cache = true, ttl = 5 * 60 * 1000, revalidate = false, onStale } = options

  // Return cached data if available and not revalidating
  if (cache && !revalidate) {
    const cached = requestCache.get<T>(url)
    if (cached) return cached

    // Return stale data while revalidating in background
    const stale = requestCache.get<T>(url)
    if (stale && onStale) {
      onStale(stale)
    }
  }

  // Deduplicate identical requests
  const fetchData = () =>
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cache) {
          requestCache.set(url, data, ttl)
        }
        return data
      })

  return requestCache.dedup(url, fetchData)
}

/**
 * Hook for cache-aware data fetching with SWR
 */
export function useCachedData<T>(
  url: string,
  options: {
    ttl?: number
    skipCache?: boolean
    revalidateOnFocus?: boolean
    revalidateInterval?: number
  } = {}
) {
  const { ttl = 5 * 60 * 1000, skipCache = false, revalidateOnFocus = true, revalidateInterval } =
    options

  const [data, setData] = React.useState<T | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!url) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const result = await cachedFetch<T>(url, {
          cache: !skipCache,
          ttl,
          onStale: setData,
        })
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Handle revalidation on window focus
    if (revalidateOnFocus) {
      const handleFocus = () => fetchData()
      window.addEventListener('focus', handleFocus)
      return () => window.removeEventListener('focus', handleFocus)
    }

    // Handle interval-based revalidation
    if (revalidateInterval) {
      const interval = setInterval(fetchData, revalidateInterval)
      return () => clearInterval(interval)
    }
  }, [url, ttl, skipCache, revalidateOnFocus, revalidateInterval])

  const revalidate = React.useCallback(() => {
    return cachedFetch<T>(url, { cache: !skipCache, ttl, revalidate: true })
  }, [url, skipCache, ttl])

  return { data, error, isLoading, revalidate }
}

/**
 * Mutation with automatic cache invalidation
 */
export async function mutateWithCache<T, R = unknown >(
  url: string,
  fetcher: () => Promise<R>,
  options: {
    invalidateKeys?: string[]
    invalidatePatterns?: string[]
    optimisticData?: R
  } = {}
): Promise<R> {
  const { invalidateKeys = [], invalidatePatterns = [], optimisticData } = options

  try {
    const result = await fetcher()

    // Invalidate cache
    invalidateKeys.forEach((key) => requestCache.invalidate(key))
    invalidatePatterns.forEach((pattern) => requestCache.invalidatePattern(pattern))

    // Also invalidate the main URL
    requestCache.invalidate(url)

    return result
  } catch (error) {
    throw error
  }
}

import React from 'react'
