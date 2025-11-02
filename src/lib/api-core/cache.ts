import type { CacheEntry, CacheConfig } from './types'

/**
 * Cache Module
 * API response caching and deduplication system
 */


export class APICache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private pendingRequests = new Map<string, Promise<unknown>>()
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      ...config,
    }
  }

  /**
   * Generate cache key from parameters
   */
  private generateCacheKey(operation: string, params: Record<string, unknown> = {}): string {
    const sortedParams = Object.keys(params)
      .sort((a, b) => a.localeCompare(b))
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {} as Record<string, unknown>)

    return `${operation}:${JSON.stringify(sortedParams)}`
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {return null}

    if (this.isCacheValid(entry)) {
      return entry.data as T
    } 
      this.cache.delete(key)
      return null
    
  }

  /**
   * Set data to cache with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // LRU eviction
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.defaultTTL,
    })
  }

  /**
   * Execute with caching and deduplication
   */
  async executeWithCache<T>(
    operationName: string,
    queryFn: () => Promise<T>,
    cacheKey: string,
    ttl?: number,
    useCache = true
  ): Promise<T> {
    // Check cache first
    if (useCache) {
      const cached = this.get<T>(cacheKey)
      if (cached !== null) {
        return cached
      }
    }

    // Check if request is pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>
    }

    // Execute and cache
    const requestPromise = queryFn()
      .then((result) => {
        if (useCache) {
          this.set(cacheKey, result, ttl)
        }
        return result
      })
      .finally(() => {
        this.pendingRequests.delete(cacheKey)
      })

    this.pendingRequests.set(cacheKey, requestPromise)
    return requestPromise
  }

  /**
   * Cache management
   */
  invalidate(pattern: string): void {
    const keysToDelete: string[] = []
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  clearCache(): void {
    this.cache.clear()
    this.pendingRequests.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Create singleton cache instance
export const apiCache = new APICache()
