import { dbLogger } from '@/lib/logger'


/**
 * Cache Management System
 * 
 * Centralized cache key management and invalidation strategies
 */


/**
 * Cache key prefixes for different entities
 */
export const CACHE_PREFIXES = {
  RECIPES: 'recipes',
  INGREDIENTS: 'ingredients',
  ORDERS: 'orders',
  HPP: 'hpp',
  CUSTOMERS: 'customers',
  FINANCIAL: 'financial',
  PRODUCTION: 'production',
  OPERATIONAL_COSTS: 'operational_costs',
} as const

/**
 * Cache version for invalidating all caches when schema changes
 */
const CACHE_VERSION = 'v1'

/**
 * Generate a cache key with version and prefix
 */
export function generateCacheKey(
  prefix: keyof typeof CACHE_PREFIXES,
  identifier?: string | string[]
): string {
  const prefixValue = CACHE_PREFIXES[prefix]
  
  if (!identifier) {
    return `${CACHE_VERSION}:${prefixValue}:all`
  }
  
  if (Array.isArray(identifier)) {
    return `${CACHE_VERSION}:${prefixValue}:${identifier.join(':')}`
  }
  
  return `${CACHE_VERSION}:${prefixValue}:${identifier}`
}

/**
 * Cache invalidation patterns
 */
export const CACHE_INVALIDATION_PATTERNS = {
  // Recipe changes affect HPP calculations
  RECIPE_UPDATED: ['RECIPES', 'HPP'] as const,
  
  // Ingredient changes affect recipes and HPP
  INGREDIENT_UPDATED: ['INGREDIENTS', 'RECIPES', 'HPP'] as const,
  
  // Order changes affect financial records
  ORDER_UPDATED: ['ORDERS', 'FINANCIAL'] as const,
  
  // Operational cost changes affect HPP
  OPERATIONAL_COST_UPDATED: ['OPERATIONAL_COSTS', 'HPP'] as const,
  
  // Production changes affect inventory and HPP
  PRODUCTION_UPDATED: ['PRODUCTION', 'INGREDIENTS', 'HPP'] as const,
} as const

/**
 * Cache invalidation helper
 */
export class CacheInvalidator {
  private invalidatedKeys: Set<string> = new Set()

  /**
   * Invalidate cache for a specific entity
   */
  invalidate(prefix: keyof typeof CACHE_PREFIXES, identifier?: string | string[]): void {
    const key = generateCacheKey(prefix, identifier)
    this.invalidatedKeys.add(key)
    dbLogger.debug({ key }, 'Cache key marked for invalidation')
  }

  /**
   * Invalidate multiple related caches based on pattern
   */
  invalidatePattern(pattern: keyof typeof CACHE_INVALIDATION_PATTERNS): void {
    const prefixes = CACHE_INVALIDATION_PATTERNS[pattern]
    
    for (const prefix of prefixes) {
      this.invalidate(prefix)
    }
    
    dbLogger.debug({ pattern, prefixes }, 'Cache pattern invalidated')
  }

  /**
   * Get all invalidated keys
   */
  getInvalidatedKeys(): string[] {
    return Array.from(this.invalidatedKeys)
  }

  /**
   * Clear invalidation tracking
   */
  clear(): void {
    this.invalidatedKeys.clear()
  }

  /**
   * Execute cache invalidation (implement based on your cache backend)
   */
  async execute(): Promise<void> {
    const keys = this.getInvalidatedKeys()

    if (keys.length === 0) {
      return
    }

    dbLogger.info({ keyCount: keys.length }, 'Executing cache invalidation')

    // For Next.js revalidation (tag-based invalidation)
    try {
      const { revalidateTag } = await import('next/cache')

      keys.forEach(key => revalidateTag(key, 'page'))

      dbLogger.info({ keys }, 'Cache invalidation completed successfully')
    } catch (error) {
      dbLogger.error({ error, keys }, 'Cache invalidation failed')
      // Fallback: don't throw, just log
    }

    this.clear()
  }
}

/**
 * Global cache invalidation helper
 */
export const cacheInvalidation = {
  /**
   * Invalidate recipe caches
   */
  recipes: (recipeId?: string) => {
    const invalidator = new CacheInvalidator()
    invalidator.invalidatePattern('RECIPE_UPDATED')
    if (recipeId) {
      invalidator.invalidate('RECIPES', recipeId)
    }
    return invalidator.execute()
  },

  /**
   * Invalidate ingredient caches
   */
  ingredients: (ingredientId?: string) => {
    const invalidator = new CacheInvalidator()
    invalidator.invalidatePattern('INGREDIENT_UPDATED')
    if (ingredientId) {
      invalidator.invalidate('INGREDIENTS', ingredientId)
    }
    return invalidator.execute()
  },

  /**
   * Invalidate order caches
   */
  orders: (orderId?: string) => {
    const invalidator = new CacheInvalidator()
    invalidator.invalidatePattern('ORDER_UPDATED')
    if (orderId) {
      invalidator.invalidate('ORDERS', orderId)
    }
    return invalidator.execute()
  },

  /**
   * Invalidate HPP caches
   */
  hpp: (recipeId?: string) => {
    const invalidator = new CacheInvalidator()
    invalidator.invalidate('HPP')
    if (recipeId) {
      invalidator.invalidate('HPP', recipeId)
    }
    return invalidator.execute()
  },

  /**
   * Invalidate operational cost caches
   */
  operationalCosts: () => {
    const invalidator = new CacheInvalidator()
    invalidator.invalidatePattern('OPERATIONAL_COST_UPDATED')
    return invalidator.execute()
  },

  /**
   * Invalidate production caches
   */
  production: (productionId?: string) => {
    const invalidator = new CacheInvalidator()
    invalidator.invalidatePattern('PRODUCTION_UPDATED')
    if (productionId) {
      invalidator.invalidate('PRODUCTION', productionId)
    }
    return invalidator.execute()
  },

  /**
   * Invalidate all caches (use sparingly)
   */
  all: () => {
    const invalidator = new CacheInvalidator()
    Object.keys(CACHE_PREFIXES).forEach(prefix => {
      invalidator.invalidate(prefix as keyof typeof CACHE_PREFIXES)
    })
    return invalidator.execute()
  },
}

/**
 * Cache TTL (Time To Live) configurations in seconds
 */
export const CACHE_TTL = {
  RECIPES: 3600, // 1 hour
  INGREDIENTS: 1800, // 30 minutes
  ORDERS: 300, // 5 minutes
  HPP: 3600, // 1 hour
  CUSTOMERS: 1800, // 30 minutes
  FINANCIAL: 600, // 10 minutes
  PRODUCTION: 600, // 10 minutes
  OPERATIONAL_COSTS: 3600, // 1 hour
} as const

/**
 * Get cache TTL for a specific entity type
 */
export function getCacheTTL(prefix: keyof typeof CACHE_PREFIXES): number {
  return CACHE_TTL[prefix] || 300 // Default 5 minutes
}
