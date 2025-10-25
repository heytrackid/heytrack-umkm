import { apiLogger } from '@/lib/logger'
/**
 * Advanced API Response Caching System
 * Provides intelligent caching with TTL, invalidation, and memory management
 */


interface CacheEntry<T = unknown > {
  data: T
  timestamp: number
  ttl: number
  key: string
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  version?: string // Cache version for invalidation
}

class APICache {
  private cache = new Map<string, CacheEntry>()
  private DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private MAX_SIZE = 100 // Maximum cache entries
  private version: string = 'v1'

  constructor(options?: CacheOptions) {
    if (options?.ttl) this.DEFAULT_TTL = options.ttl
    if (options?.maxSize) this.MAX_SIZE = options.maxSize
    if (options?.version) this.version = options.version
  }

  /**
   * Generate a cache key from request parameters
   */
  private generateKey(endpoint: string, params?: Record<string, unknown>): string {
    const baseKey = `${this.version}:${endpoint}`
    if (!params) return baseKey

    const sortedParams = Object.keys(params)
      .sort((a, b) => a.localeCompare(b))
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&')

    return `${baseKey}?${sortedParams}`
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl
  }

  /**
   * Manage cache size by removing oldest entries
   */
  private evictOldEntries(): void {
    if (this.cache.size <= this.MAX_SIZE) return

    // Sort by timestamp and remove oldest entries
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)

    const toRemove = entries.slice(0, entries.length - this.MAX_SIZE)
    toRemove.forEach(([key]) => this.cache.delete(key))
  }

  /**
   * Get data from cache
   */
  get<T>(endpoint: string, params?: Record<string, unknown>): T | null {
    const key = this.generateKey(endpoint, params)
    const entry = this.cache.get(key)

    if (!entry) return null

    if (!this.isValid(entry)) {
      this.cache.delete(key)
      return null
    }

    // Update timestamp for LRU behavior
    entry.timestamp = Date.now()
    return entry.data as T
  }

  /**
   * Set data in cache
   */
  set<T>(endpoint: string, data: T, params?: Record<string, unknown>, ttl?: number): void {
    const key = this.generateKey(endpoint, params)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
      key
    }

    this.cache.set(key, entry)
    this.evictOldEntries()
  }

  /**
   * Invalidate specific cache entries
   */
  invalidate(pattern: string): number {
    let removed = 0
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))

    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key)
        removed++
      }
    }

    return removed
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values())
    const validEntries = entries.filter(entry => this.isValid(entry))

    return {
      size: this.cache.size,
      validEntries: validEntries.length,
      invalidEntries: entries.length - validEntries.length,
      maxSize: this.MAX_SIZE,
      usage: (this.cache.size / this.MAX_SIZE) * 100,
      version: this.version
    }
  }

  /**
   * Preload data into cache
   */
  preload<T>(endpoint: string, data: T, params?: Record<string, unknown>, ttl?: number): void {
    this.set(endpoint, data, params, ttl)
  }

  /**
   * Cache wrapper for fetch operations
   */
  async cachedFetch<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    params?: Record<string, unknown>,
    options?: { ttl?: number; forceRefresh?: boolean }
  ): Promise<T> {
    const key = this.generateKey(endpoint, params)

    // Check cache first (unless force refresh)
    if (!options?.forceRefresh) {
      const cached = this.get<T>(endpoint, params)
      if (cached !== null) {
        return cached
      }
    }

    // Fetch fresh data
    try {
      const data = await fetchFn()
      this.set(endpoint, data, params, options?.ttl)
      return data
    } catch (error: unknown) {
      // On error, try to return stale cache if available
      const stale = this.cache.get(key)
      if (stale) {
        apiLogger.warn({ err: error, endpoint }, 'API fetch failed, returning stale cache')
        return stale.data as T
      }
      throw error
    }
  }
}

// Global cache instances for different data types
export const apiCache = new APICache({
  ttl: 5 * 60 * 1000, // 5 minutes default
  maxSize: 100,
  version: 'v1'
})

// Specialized caches for different data types
export const inventoryCache = new APICache({
  ttl: 10 * 60 * 1000, // 10 minutes for inventory data
  maxSize: 50,
  version: 'inventory-v1'
})

export const financialCache = new APICache({
  ttl: 15 * 60 * 1000, // 15 minutes for financial data
  maxSize: 30,
  version: 'financial-v1'
})

// Cache invalidation patterns used around the app
export const CACHE_PATTERNS = {
  INVENTORY: '*inventory*',
  RECIPES: '*recipe*',
  ORDERS: '*order*',
  FINANCIAL: '*financial*',
  ALL: '*'
} as const

export { APICache }
