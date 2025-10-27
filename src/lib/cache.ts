import { apiLogger } from './logger'

// Cache keys structure
export const cacheKeys = {
  hpp: {
    overview: 'hpp:overview',
    snapshots: 'hpp:snapshots',
    alerts: 'hpp:alerts',
    recommendations: 'hpp:recommendations',
    comparison: 'hpp:comparison',
    calculations: 'hpp:calculations'
  },
  recipes: {
    list: 'recipes:list',
    all: 'recipes:all',
    detail: (id: string) => `recipes:detail:${id}`
  },
  ingredients: {
    list: 'ingredients:list',
    detail: (id: string) => `ingredients:detail:${id}`
  },
  orders: {
    list: 'orders:list',
    detail: (id: string) => `orders:detail:${id}`
  }
}

// In-memory cache with TTL
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    const age = now - entry.timestamp

    if (age > entry.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const memoryCache = new MemoryCache()

// Cache wrapper with stale-while-revalidate
export async function withCache<T>(
  fn: () => Promise<T>,
  key: string,
  ttl = 300 // 5 minutes default
): Promise<T> {
  // Try to get from cache
  const cached = memoryCache.get<T>(key)
  
  if (cached) {
    apiLogger.debug({ key, hit: true }, 'Cache hit')
    return cached
  }

  // Cache miss - fetch fresh data
  apiLogger.debug({ key, hit: false }, 'Cache miss')
  const data = await fn()
  
  // Store in cache
  memoryCache.set(key, data, ttl)
  
  return data
}

// Granular cache invalidation
export const cacheInvalidation = {
  hpp: async () => {
    memoryCache.deletePattern('^hpp:')
    apiLogger.info('HPP cache invalidated')
  },
  
  hppAlerts: async () => {
    memoryCache.deletePattern('^hpp:alerts')
    memoryCache.delete(cacheKeys.hpp.overview)
    apiLogger.info('HPP alerts cache invalidated')
  },
  
  hppSnapshots: async (recipeId?: string) => {
    if (recipeId) {
      memoryCache.deletePattern(`^hpp:snapshots.*${recipeId}`)
    } else {
      memoryCache.deletePattern('^hpp:snapshots')
    }
    memoryCache.delete(cacheKeys.hpp.overview)
    apiLogger.info({ recipeId }, 'HPP snapshots cache invalidated')
  },
  
  recipes: async (recipeId?: string) => {
    if (recipeId) {
      memoryCache.delete(cacheKeys.recipes.detail(recipeId))
    }
    memoryCache.deletePattern('^recipes:')
    apiLogger.info({ recipeId }, 'Recipes cache invalidated')
  },
  
  ingredients: async (ingredientId?: string) => {
    if (ingredientId) {
      memoryCache.delete(cacheKeys.ingredients.detail(ingredientId))
    }
    memoryCache.deletePattern('^ingredients:')
    apiLogger.info({ ingredientId }, 'Ingredients cache invalidated')
  },
  
  orders: async (orderId?: string) => {
    if (orderId) {
      memoryCache.delete(cacheKeys.orders.detail(orderId))
    }
    memoryCache.deletePattern('^orders:')
    apiLogger.info({ orderId }, 'Orders cache invalidated')
  },
  
  all: async () => {
    memoryCache.clear()
    apiLogger.info('All cache cleared')
  }
}

// Cache statistics
export function getCacheStats() {
  return {
    size: memoryCache.size(),
    timestamp: new Date().toISOString()
  }
}
