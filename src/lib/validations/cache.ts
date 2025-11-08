import { z } from 'zod'


 
/**
 * Validation Caching System
 * Performance optimization for validation operations
 */


// Cache entry interface
interface ValidationCacheEntry<T> {
  result: { success: boolean; data?: T; errors?: string[] }
  timestamp: number
  ttl: number
}

// Cache configuration
interface ValidationCacheConfig {
  defaultTTL: number // milliseconds
  maxSize: number
  enableCache: boolean
}

// Global cache instance
class ValidationCache {
  private cache = new Map<string, ValidationCacheEntry<unknown>>()
  private config: ValidationCacheConfig

  constructor(config: Partial<ValidationCacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      enableCache: true,
      ...config
    }
  }

  /**
   * Generate cache key from validation input
   */
  private generateCacheKey(schemaName: string, data: unknown): string {
    try {
      // Create a deterministic string representation of the data
      const dataString = JSON.stringify(data, (_key, value) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Sort object keys for deterministic serialization
          const sortedObj: Record<string, unknown> = {}
          Object.keys(value).sort().forEach(k => {
            sortedObj[k] = (value as Record<string, unknown>)[k]
          })
          return sortedObj
        }
        return value
      })
      return `${schemaName}:${this.hashString(dataString)}`
    } catch (error) {
      // Fallback for non-serializable data
      return `${schemaName}:${Date.now()}:${Math.random()}`
    }
  }

  /**
   * Simple string hashing for cache keys
   */
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid<T>(entry: ValidationCacheEntry<T>): boolean {
    return Date.now() - entry['timestamp'] < entry.ttl
  }

  /**
   * Get cached validation result
   */
  get<T>(schemaName: string, data: unknown): ValidationCacheEntry<T> | null {
    if (!this.config.enableCache) {return null}

    const key = this.generateCacheKey(schemaName, data)
    const entry = this.cache.get(key)

    if (entry && this.isValid(entry)) {
      return entry as ValidationCacheEntry<T>
    }

    // Remove expired entry
    if (entry) {
      this.cache.delete(key)
    }

    return null
  }

  /**
   * Set validation result in cache
   */
  set<T>(schemaName: string, data: unknown, result: { success: boolean; data?: T; errors?: string[] }, ttl?: number): void {
    if (!this.config.enableCache) {return}

    const key = this.generateCacheKey(schemaName, data)

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL
    })
  }

  /**
   * Clear cache or specific entries
   */
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    const keysToDelete: string[] = []
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    maxSize: number
    enabled: boolean
    hitRate?: number
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      enabled: this.config.enableCache
    }
  }

  /**
   * Update cache configuration
   */
  updateConfig(config: Partial<ValidationCacheConfig>): void {
    this.config = { ...this.config, ...config }

    // Clear cache if disabled
    if (!this.config.enableCache) {
      this.clear()
    }
  }
}

// Global cache instance
export const validationCache = new ValidationCache()

// Cached validation wrapper
export function withValidationCache<T>(
  schema: z.ZodSchema<T>,
  schemaName: string,
  options: {
    ttl?: number
    skipCache?: boolean
  } = {}
) {
  return (data: unknown): { success: boolean; data?: T; errors?: string[] } => {
    // Try to get from cache first
    if (!options.skipCache) {
      const cached = validationCache.get<T>(schemaName, data)
      if (cached) {
        return cached.result
      }
    }

    // Perform validation
    let result: { success: boolean; data?: T; errors?: string[] }

    try {
      const validatedData = schema.parse(data)
      result = { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(error => `${error.path.join('.')}: ${error.message}`)
        result = { success: false, errors }
      } else {
        result = { success: false, errors: ['Validation failed'] }
      }
    }

    // Cache the result
    if (!options.skipCache) {
      validationCache.set(schemaName, data, result, options.ttl)
    }

    return result
  }
}

// Cached validation for common schemas
export class CachedValidationHelpers {
  private static cache = validationCache

  /**
   * Cached customer validation
   */
  static validateCustomer(data: unknown) {
    // Dynamic import to avoid circular dependencies
   
    const { CustomerInsertSchema } = require('./domains/customer')
    return withValidationCache(
      CustomerInsertSchema,
      'customer-insert',
      { ttl: 10 * 60 * 1000 } // 10 minutes
    )(data)
  }

  /**
   * Cached ingredient validation
   */
   
  static validateIngredient(data: unknown) {
    const { IngredientInsertSchema } = require('./domains/ingredient')
    return withValidationCache(
      IngredientInsertSchema,
      'ingredient-insert',
      { ttl: 15 * 60 * 1000 } // 15 minutes
    )(data)
  }

  /**
   * Cached order validation
  // eslint-disable-next-line @typescript-eslint/no-require-imports
   */
  static validateOrder(data: unknown) {
    const { OrderInsertSchema } = require('./domains/order')
    return withValidationCache(
      OrderInsertSchema,
      'order-insert',
      { ttl: 5 * 60 * 1000 } // 5 minutes (shorter for orders)
    )(data)
  }

  /**
  // eslint-disable-next-line @typescript-eslint/no-require-imports
   * Cached recipe validation
   */
  static validateRecipe(data: unknown) {
    const { RecipeInsertSchema } = require('./domains/recipe')
    return withValidationCache(
      RecipeInsertSchema,
      'recipe-insert',
      { ttl: 30 * 60 * 1000 } // 30 minutes (recipes change less frequently)
    )(data)
  }

  /**
   * Clear cache for specific domain
   */
  static clearDomainCache(domain: string): void {
    this.cache.clear(domain)
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return this.cache.getStats()
  }

  /**
   * Configure cache settings
   */
  static configureCache(config: Partial<{
    defaultTTL: number
    maxSize: number
    enableCache: boolean
  }>): void {
    this.cache.updateConfig(config)
  }
}

// Performance monitoring
export class ValidationPerformanceMonitor {
  private static metrics = {
    validationsPerformed: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageValidationTime: 0,
    totalValidationTime: 0
  }

  static recordValidation(startTime: number, wasCached: boolean): void {
    const duration = Date.now() - startTime

    this.metrics.validationsPerformed++
    this.metrics.totalValidationTime += duration

    if (wasCached) {
      this.metrics.cacheHits++
    } else {
      this.metrics.cacheMisses++
    }

    this.metrics.averageValidationTime = this.metrics.totalValidationTime / this.metrics.validationsPerformed
  }

  static getMetrics() {
    const cacheHitRate = this.metrics.validationsPerformed > 0
      ? (this.metrics.cacheHits / this.metrics.validationsPerformed) * 100
      : 0

    return {
      ...this.metrics,
      cacheHitRate: `${cacheHitRate.toFixed(2)}%`
    }
  }

  static resetMetrics(): void {
    this.metrics = {
      validationsPerformed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageValidationTime: 0,
      totalValidationTime: 0
    }
  }
}

// Export cache instance for external use
export { ValidationCache }
export type { ValidationCacheConfig }
