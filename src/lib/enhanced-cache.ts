import { apiLogger } from './logger'

// Enhanced Cache Configuration
export interface EnhancedCacheConfig {
  defaultTTL: number // in seconds
  maxSize: number // max number of entries
  cleanupInterval: number // in milliseconds
  enableCompression: boolean
  enableEncryption: boolean
}

// Enhanced cache entry with better tracking
interface EnhancedCacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // in seconds
  size: number // approximate size in bytes
  accessCount: number // number of times accessed
  lastAccessed: number // timestamp of last access
}

// Enhanced cache class with better memory management
class EnhancedCache {
  private cache = new Map<string, EnhancedCacheEntry<unknown>>()
  private config: EnhancedCacheConfig
  private cleanupInterval: NodeJS.Timeout | null = null
  private totalSize = 0 // Track total cache size

  constructor(config?: Partial<EnhancedCacheConfig>) {
    this.config = {
      defaultTTL: 300, // 5 minutes
      maxSize: 100,
      cleanupInterval: 30000, // 30 seconds
      enableCompression: false,
      enableEncryption: false,
      ...config,
    }

    // Start periodic cleanup
    this.startCleanup()
  }

  /**
   * Start periodic cleanup to remove expired entries and prevent memory leaks
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired()
      this.cleanupLRU()
    }, this.config.cleanupInterval)
  }

  /**
   * Get data from cache with automatic refresh if needed
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry is expired
    const now = Date.now()
    const ttlMs = entry.ttl * 1000
    if (now - entry.timestamp > ttlMs) {
      this.delete(key) // Remove expired entry
      return null
    }

    // Update access statistics
    entry.accessCount = (entry.accessCount || 0) + 1
    entry.lastAccessed = now
    
    return entry.data as T
  }

  /**
   * Set data to cache with size tracking and LRU management
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Calculate approximate size of the data
    let size = 0
    try {
      const jsonString = JSON.stringify(data)
      const { size: blobSize } = new Blob([jsonString])
      size = blobSize
    } catch (_e) {
      // If serialization fails, estimate a default size
      size = 100
    }

    // If adding this entry would exceed max size, remove least recently used entries
    if (this.cache.size >= this.config.maxSize) {
      this.cleanupLRU()
    }

    const ttlValue = ttl ?? this.config.defaultTTL
    const cacheEntry: EnhancedCacheEntry<unknown> = {
      data,
      timestamp: Date.now(),
      ttl: ttlValue,
      size,
      accessCount: 0,
      lastAccessed: Date.now(),
    }
    this.cache.set(key, cacheEntry)

    this.totalSize += size

    // Log cache size if it's growing too large
    if (this.totalSize > this.config.maxSize * 10000) { // 10KB per item on average
      apiLogger.warn({
        currentSize: this.totalSize,
        maxSize: this.config.maxSize * 10000
      }, 'Cache size is growing large, consider reducing TTL or max size')
    }
  }

  /**
   * Delete specific entry from cache
   */
  delete(key: string): void {
    const entry = this.cache.get(key)
    if (entry) {
      this.totalSize -= entry.size
      this.cache.delete(key)
    }
  }

  /**
   * Delete entries matching pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key)
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.totalSize = 0
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    totalSize: number
    maxSize: number
    keys: string[]
  } {
    return {
      size: this.cache.size,
      totalSize: this.totalSize,
      maxSize: this.config.maxSize,
      keys: Array.from(this.cache.keys()),
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now()
    let cleanedUpSize = 0

    for (const [key, entry] of this.cache.entries()) {
      const ttlMs = entry.ttl * 1000
      if (now - entry.timestamp > ttlMs) {
        cleanedUpSize += entry.size
        this.cache.delete(key)
      }
    }

    this.totalSize -= cleanedUpSize

    if (cleanedUpSize > 0) {
      apiLogger.debug({ cleanedUpSize }, 'Expired cache entries cleaned up')
    }
  }

  /**
   * Cleanup entries using LRU (Least Recently Used) algorithm
   */
  private cleanupLRU(): void {
    if (this.cache.size <= this.config.maxSize * 0.8) { // Only clean if over 80% capacity
      return
    }

    let cleanedUpSize = 0
    const entriesArray = Array.from(this.cache.entries())
    const entries = entriesArray
      .map(([key, entry]) => ({
        key,
        entry,
        lastAccessed: entry.lastAccessed,
        accessCount: entry.accessCount,
      }))
      .sort((a, b) => a.lastAccessed - b.lastAccessed) // Sort by last accessed (oldest first)

    // Remove oldest entries until cache is below 70% capacity
    while (this.cache.size > this.config.maxSize * 0.7 && entries.length > 0) {
      const entryItem = entries.shift()
      if (entryItem) {
        const { key, entry } = entryItem
        cleanedUpSize += entry.size
        this.cache.delete(key)
        apiLogger.debug({ key }, 'Removed from cache (LRU)')
      }
    }

    this.totalSize -= cleanedUpSize
  }

  /**
   * Get cache size in bytes
   */
  getSize(): number {
    return this.totalSize
  }

  /**
   * Destroy cache instance and clear interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Enhanced cache manager with better organization
export class EnhancedCacheManager {
  private static instance: EnhancedCacheManager
  private cache: EnhancedCache
  private readonly cacheKeys = {
    hpp: {
      overview: 'hpp:overview',
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
    },
    customers: {
      list: 'customers:list',
      detail: (id: string) => `customers:detail:${id}`
    },
    suppliers: {
      list: 'suppliers:list',
      detail: (id: string) => `suppliers:detail:${id}`
    },
    users: {
      profile: (id: string) => `users:profile:${id}`,
      permissions: (id: string) => `users:permissions:${id}`
    },
    inventory: {
      list: 'inventory:list',
      byRecipe: (recipeId: string) => `inventory:recipe:${recipeId}`,
      byIngredient: (ingredientId: string) => `inventory:ingredient:${ingredientId}`
    }
  }

  constructor() {
    this.cache = new EnhancedCache({
      // Reduced TTL values for better cache freshness while preventing memory issues
      defaultTTL: 300, // 5 minutes for most data
      maxSize: 50, // Reduced max size to prevent memory bloat
      cleanupInterval: 60000, // 1 minute cleanup
    })
  }

  static getInstance(): EnhancedCacheManager {
    if (!EnhancedCacheManager.instance) {
      EnhancedCacheManager.instance = new EnhancedCacheManager()
    }
    return EnhancedCacheManager.instance
  }

  // Getter for cache keys to ensure consistency
  get keys() {
    return this.cacheKeys
  }

  // Cache operations
  get<T>(key: string): T | null {
    return this.cache.get<T>(key)
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, data, ttl)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return this.cache.getStats()
  }

  // Specific cache operations for different entities
  getHppOverview() {
    return this.get(this.cacheKeys.hpp.overview)
  }

  setHppOverview<T>(data: T) {
    this.set(this.cacheKeys.hpp.overview, data, 600) // 10 minutes for overview
  }

  getRecipesList<T>() {
    return this.get<T>(this.cacheKeys.recipes.list)
  }

  setRecipesList<T>(data: T) {
    this.set(this.cacheKeys.recipes.list, data, 300) // 5 minutes for recipe list
  }

  getRecipeDetail<T>(id: string) {
    return this.get<T>(this.cacheKeys.recipes.detail(id))
  }

  setRecipeDetail<T>(id: string, data: T) {
    this.set(this.cacheKeys.recipes.detail(id), data, 900) // 15 minutes for recipe details
  }

  // Granular invalidation
  invalidateHpp() {
    this.cache.deletePattern('^hpp:')
    apiLogger.info('HPP cache invalidated')
  }

  invalidateRecipes(recipeId?: string) {
    if (recipeId) {
      this.cache.delete(this.cacheKeys.recipes.detail(recipeId))
    } else {
      this.cache.deletePattern('^recipes:')
    }
    apiLogger.info({ recipeId }, 'Recipes cache invalidated')
  }

  invalidateIngredients(ingredientId?: string) {
    if (ingredientId) {
      this.cache.delete(this.cacheKeys.ingredients.detail(ingredientId))
    } else {
      this.cache.deletePattern('^ingredients:')
    }
    apiLogger.info({ ingredientId }, 'Ingredients cache invalidated')
  }

  invalidateOrders(orderId?: string) {
    if (orderId) {
      this.cache.delete(this.cacheKeys.orders.detail(orderId))
    } else {
      this.cache.deletePattern('^orders:')
    }
    apiLogger.info({ orderId }, 'Orders cache invalidated')
  }

  invalidateAll() {
    this.cache.clear()
    apiLogger.info('All cache cleared')
  }
}

// Singleton instance
export const enhancedCache = EnhancedCacheManager.getInstance()

// Enhanced cache wrapper with better error handling and fallback
export async function withEnhancedCache<T>(
  operationName: string,
  fn: () => Promise<T>,
  key: string,
  ttl?: number,
  fallbackOnError = true
): Promise<T> {
  try {
    // Try to get from cache first
    const cached = enhancedCache.get<T>(key)
    if (cached) {
      apiLogger.debug({ key, operation: operationName }, 'Cache hit')
      return cached
    }

    apiLogger.debug({ key, operation: operationName }, 'Cache miss, fetching fresh data')

    // Fetch fresh data
    const data = await fn()

    // Store in cache
    enhancedCache.set(key, data, ttl)

    return data
  } catch (error) {
    apiLogger.error({ 
      error, 
      key, 
      operation: operationName 
    }, 'Cache operation failed')

    // If fallback is enabled, try to return stale data
    if (fallbackOnError) {
      const staleData = enhancedCache.get<T>(key)
      if (staleData) {
        apiLogger.warn({ key }, 'Returning stale data due to fetch error')
        return staleData
      }
    }

    throw error
  }
}