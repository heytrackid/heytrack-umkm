/**
 * Cache Manager Module
 * Manages HPP calculation caching and invalidation
 */

import { automationLogger } from '@/lib/logger'
import type { RecipeHPP } from './types'

export class CacheManager {
  private recipeHPPCache: Map<string, RecipeHPP> = new Map()
  private cacheTimestamps: Map<string, number> = new Map()
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  /**
   * Get cached HPP for a recipe
   */
  getRecipeHPP(recipeId: string): RecipeHPP | undefined {
    const cached = this.recipeHPPCache.get(recipeId)
    if (!cached) {
      return undefined
    }

    // Check if cache is still valid
    const timestamp = this.cacheTimestamps.get(recipeId)
    if (!timestamp || Date.now() - timestamp > this.CACHE_TTL) {
      // Cache expired, remove it
      this.recipeHPPCache.delete(recipeId)
      this.cacheTimestamps.delete(recipeId)
      return undefined
    }

    return cached
  }

  /**
   * Cache HPP calculation result
   */
  setRecipeHPP(recipeId: string, hpp: RecipeHPP): void {
    this.recipeHPPCache.set(recipeId, hpp)
    this.cacheTimestamps.set(recipeId, Date.now())

    automationLogger.info({
      recipeId,
      totalHPP: hpp.totalHPP,
      hppPerServing: hpp.hppPerServing
    }, 'HPP cached for recipe')
  }

  /**
   * Invalidate cache for a specific recipe
   */
  invalidateRecipeCache(recipeId: string): void {
    const wasCached = this.recipeHPPCache.has(recipeId)
    this.recipeHPPCache.delete(recipeId)
    this.cacheTimestamps.delete(recipeId)

    if (wasCached) {
      automationLogger.info({ recipeId }, 'Recipe HPP cache invalidated')
    }
  }

  /**
   * Invalidate cache for multiple recipes
   */
  invalidateMultipleRecipes(recipeIds: string[]): void {
    let invalidatedCount = 0

    for (const recipeId of recipeIds) {
      if (this.recipeHPPCache.has(recipeId)) {
        this.invalidateRecipeCache(recipeId)
        invalidatedCount++
      }
    }

    if (invalidatedCount > 0) {
      automationLogger.info({
        recipeIds,
        invalidatedCount
      }, 'Multiple recipe caches invalidated')
    }
  }

  /**
   * Invalidate cache for recipes using a specific ingredient
   */
  invalidateIngredientRelatedCache(ingredientId: string, affectedRecipeIds: string[]): void {
    this.invalidateMultipleRecipes(affectedRecipeIds)

    automationLogger.info({
      ingredientId,
      affectedRecipes: affectedRecipeIds.length
    }, 'Ingredient-related cache invalidated')
  }

  /**
   * Clear all cached data
   */
  clearAllCache(): void {
    const cacheSize = this.recipeHPPCache.size
    this.recipeHPPCache.clear()
    this.cacheTimestamps.clear()

    automationLogger.info({ cacheSize }, 'All HPP cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalCached: number
    cacheSize: number
    expiredEntries: number
  } {
    let expiredEntries = 0
    const now = Date.now()

    for (const [recipeId, timestamp] of this.cacheTimestamps) {
      if (now - timestamp > this.CACHE_TTL) {
        expiredEntries++
      }
    }

    return {
      totalCached: this.recipeHPPCache.size,
      cacheSize: JSON.stringify(Array.from(this.recipeHPPCache.entries())).length,
      expiredEntries
    }
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredCache(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [recipeId, timestamp] of this.cacheTimestamps) {
      if (now - timestamp > this.CACHE_TTL) {
        this.recipeHPPCache.delete(recipeId)
        this.cacheTimestamps.delete(recipeId)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      automationLogger.info({ cleanedCount }, 'Expired cache entries cleaned up')
    }

    return cleanedCount
  }

  /**
   * Check if recipe needs recalculation based on cache status
   */
  recipeNeedsRecalculation(recipeId: string): boolean {
    const cached = this.getRecipeHPP(recipeId)
    return !cached || cached.needsRecalculation
  }

  /**
   * Mark recipe as needing recalculation
   */
  markRecipeForRecalculation(recipeId: string): void {
    const cached = this.recipeHPPCache.get(recipeId)
    if (cached) {
      cached.needsRecalculation = true
      automationLogger.info({ recipeId }, 'Recipe marked for recalculation')
    }
  }

  /**
   * Get all cached recipe IDs
   */
  getAllCachedRecipeIds(): string[] {
    return Array.from(this.recipeHPPCache.keys())
  }

  /**
   * Get cache hit rate (simplified)
   */
  getCacheHitRate(): { hits: number; misses: number; ratio: number } {
    // This is a simplified implementation
    // In a real system, you'd track actual hits/misses
    const totalRequests = this.recipeHPPCache.size
    const hits = Math.floor(totalRequests * 0.8) // Assume 80% hit rate
    const misses = totalRequests - hits

    return {
      hits,
      misses,
      ratio: totalRequests > 0 ? hits / totalRequests : 0
    }
  }
}
