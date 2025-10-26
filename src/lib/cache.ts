/**
 * Cache Utility for API Responses
 * Provides in-memory caching with TTL support for better performance
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get cached data if still valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const cacheManager = new CacheManager()

// Auto cleanup expired entries every 10 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup()
  }, 10 * 60 * 1000)
}

/**
 * Cached API Response Wrapper
 * Wraps API handlers to automatically cache responses
 */
export function withCache<T>(
  handler: () => Promise<T>,
  cacheKey: string,
  ttl: number = 5 * 60 * 1000 // 5 minutes
): Promise<T> {
  // Try to get from cache first
  const cached = cacheManager.get<T>(cacheKey)
  if (cached !== null) {
    return Promise.resolve(cached)
  }

  // Execute handler and cache result
  return handler().then(result => {
    cacheManager.set(cacheKey, result, ttl)
    return result
  })
}

/**
 * Cache key generators for common patterns
 */
export const cacheKeys = {
  // Recipes cache keys
  recipes: {
    all: 'recipes:all',
    active: 'recipes:active',
    byId: (id: string) => `recipes:id:${id}`,
    search: (query: string) => `recipes:search:${query}`
  },

  // Ingredients cache keys
  ingredients: {
    all: 'ingredients:all',
    active: 'ingredients:active',
    byId: (id: string) => `ingredients:id:${id}`,
    lowStock: 'ingredients:low_stock'
  },

  // Orders cache keys
  orders: {
    recent: 'orders:recent',
    byStatus: (status: string) => `orders:status:${status}`,
    byId: (id: string) => `orders:id:${id}`,
    stats: 'orders:stats'
  },

  // Customers cache keys
  customers: {
    all: 'customers:all',
    search: (query: string) => `customers:search:${query}`,
    byId: (id: string) => `customers:id:${id}`
  },

  // Notifications cache keys
  notifications: {
    user: (userId: string) => `notifications:user:${userId}`,
    unread: (userId: string) => `notifications:unread:${userId}`,
    inventory: 'notifications:inventory'
  }
}

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  // Invalidate all caches
  all: () => cacheManager.clear(),

  // Invalidate recipes
  recipes: () => {
    const keys = cacheManager.getStats().entries.filter(key => key.startsWith('recipes:'))
    keys.forEach(key => cacheManager.delete(key))
  },

  // Invalidate ingredients
  ingredients: () => {
    const keys = cacheManager.getStats().entries.filter(key => key.startsWith('ingredients:'))
    keys.forEach(key => cacheManager.delete(key))
  },

  // Invalidate orders
  orders: () => {
    const keys = cacheManager.getStats().entries.filter(key => key.startsWith('orders:'))
    keys.forEach(key => cacheManager.delete(key))
  },

  // Invalidate customers
  customers: () => {
    const keys = cacheManager.getStats().entries.filter(key => key.startsWith('customers:'))
    keys.forEach(key => cacheManager.delete(key))
  },

  // Invalidate notifications
  notifications: () => {
    const keys = cacheManager.getStats().entries.filter(key => key.startsWith('notifications:'))
    keys.forEach(key => cacheManager.delete(key))
  }
}
