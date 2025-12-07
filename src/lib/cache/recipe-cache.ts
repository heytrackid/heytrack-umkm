/**
 * Recipe Generation Cache
 * Caches AI-generated recipes to avoid redundant API calls
 * Uses localStorage with TTL for persistence
 */

import type { GeneratedRecipe } from '@/app/recipes/ai-generator/components/types'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

interface RecipeCacheKey {
  productName: string
  productType: string
  servings: number
  ingredients: string[]
  customIngredients: string[]
}

const CACHE_PREFIX = 'recipe_cache_'
const DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CACHE_ENTRIES = 50

/**
 * Generate a unique cache key from recipe parameters
 */
function generateCacheKey(params: RecipeCacheKey): string {
  const normalized = {
    name: params.productName.toLowerCase().trim(),
    type: params.productType,
    servings: params.servings,
    ingredients: [...params.ingredients, ...params.customIngredients]
      .map(i => i.toLowerCase().trim())
      .sort()
      .join(',')
  }
  
  // Create a simple hash
  const str = JSON.stringify(normalized)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return `${CACHE_PREFIX}${Math.abs(hash).toString(36)}`
}

/**
 * Get cached recipe if available and not expired
 */
export function getCachedRecipe(params: RecipeCacheKey): GeneratedRecipe | null {
  if (typeof window === 'undefined') return null

  try {
    const key = generateCacheKey(params)
    const cached = localStorage.getItem(key)
    
    if (!cached) return null

    const entry: CacheEntry<GeneratedRecipe> = JSON.parse(cached)
    const now = Date.now()

    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch {
    return null
  }
}

/**
 * Cache a generated recipe
 */
export function cacheRecipe(
  params: RecipeCacheKey,
  recipe: GeneratedRecipe,
  ttl: number = DEFAULT_TTL
): void {
  if (typeof window === 'undefined') return

  try {
    const key = generateCacheKey(params)
    
    const entry: CacheEntry<GeneratedRecipe> = {
      data: recipe,
      timestamp: Date.now(),
      ttl,
      key
    }

    // Cleanup old entries if needed
    cleanupCache()

    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Silently fail - cache is optional
  }
}

/**
 * Clear all cached recipes
 */
export function clearRecipeCache(): void {
  if (typeof window === 'undefined') return

  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX))
    for (const key of keys) {
      localStorage.removeItem(key)
    }
  } catch {
    // Silently fail
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  entries: number
  totalSize: number
  oldestEntry: Date | null
  newestEntry: Date | null
} {
  if (typeof window === 'undefined') {
    return { entries: 0, totalSize: 0, oldestEntry: null, newestEntry: null }
  }

  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX))
    let totalSize = 0
    let oldest = Infinity
    let newest = 0

    for (const key of keys) {
      const value = localStorage.getItem(key)
      if (value) {
        totalSize += value.length
        const entry: CacheEntry<unknown> = JSON.parse(value)
        if (entry.timestamp < oldest) oldest = entry.timestamp
        if (entry.timestamp > newest) newest = entry.timestamp
      }
    }

    return {
      entries: keys.length,
      totalSize,
      oldestEntry: oldest !== Infinity ? new Date(oldest) : null,
      newestEntry: newest !== 0 ? new Date(newest) : null
    }
  } catch {
    return { entries: 0, totalSize: 0, oldestEntry: null, newestEntry: null }
  }
}

/**
 * Cleanup expired and excess cache entries
 */
function cleanupCache(): void {
  if (typeof window === 'undefined') return

  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX))
    const now = Date.now()
    const entries: Array<{ key: string; timestamp: number }> = []

    // Remove expired entries and collect valid ones
    for (const key of keys) {
      const value = localStorage.getItem(key)
      if (value) {
        const entry: CacheEntry<unknown> = JSON.parse(value)
        if (now - entry.timestamp > entry.ttl) {
          localStorage.removeItem(key)
        } else {
          entries.push({ key, timestamp: entry.timestamp })
        }
      }
    }

    // Remove oldest entries if over limit
    if (entries.length > MAX_CACHE_ENTRIES) {
      entries.sort((a, b) => a.timestamp - b.timestamp)
      const toRemove = entries.slice(0, entries.length - MAX_CACHE_ENTRIES)
      for (const entry of toRemove) {
        localStorage.removeItem(entry.key)
      }
    }
  } catch {
    // Silently fail
  }
}

/**
 * Hook for recipe cache with React integration
 */
export function useRecipeCache() {
  return {
    get: getCachedRecipe,
    set: cacheRecipe,
    clear: clearRecipeCache,
    stats: getCacheStats
  }
}
