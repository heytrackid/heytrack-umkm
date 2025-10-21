/**
 * Optimized API Client with Caching & Request Deduplication
 * Reduces redundant API calls and improves performance
 */

// Simple in-memory cache with TTL
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

class APICache {
  private cache = new Map<string, CacheEntry>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

// Request deduplication - prevent duplicate requests
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>()

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }
}

// Optimized API Client
class OptimizedAPIClient {
  private cache = new APICache()
  private deduplicator = new RequestDeduplicator()

  // Generic fetch with caching
  async fetch<T>(
    url: string, 
    options: RequestInit = {},
    cacheOptions?: { 
      ttl?: number
      skipCache?: boolean
      invalidatePatterns?: string[]
    }
  ): Promise<T> {
    const cacheKey = `${url}-${JSON.stringify(options)}`
    
    // Check cache first (unless explicitly skipped)
    if (!cacheOptions?.skipCache) {
      const cached = this.cache.get(cacheKey)
      if (cached) {
        return cached
      }
    }

    // Deduplicate requests
    return this.deduplicator.deduplicate(cacheKey, async () => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

      // Cache the result
      if (!cacheOptions?.skipCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
        this.cache.set(cacheKey, data, cacheOptions?.ttl)
      }

      // Invalidate related cache patterns on mutations
      if (cacheOptions?.invalidatePatterns) {
        cacheOptions.invalidatePatterns.forEach(pattern => {
          this.cache.invalidatePattern(pattern)
        })
      }

      return data
    })
  }

  // Optimized endpoints
  async getIngredients() {
    return this.fetch<any[]>('/api/ingredients', {}, { ttl: 2 * 60 * 1000 }) // 2 minutes cache
  }

  async getRecipes() {
    return this.fetch<any[]>('/api/recipes', {}, { ttl: 5 * 60 * 1000 }) // 5 minutes cache
  }

  async getOrders(limit?: number) {
    const url = limit ? `/api/orders?limit=${limit}` : '/api/orders'
    return this.fetch<any[]>(url, {}, { ttl: 1 * 60 * 1000 }) // 1 minute cache for orders
  }

  async getCustomers() {
    return this.fetch<any[]>('/api/customers', {}, { ttl: 3 * 60 * 1000 }) // 3 minutes cache
  }

  // Mutation methods with cache invalidation
  async createIngredient(data: any) {
    return this.fetch('/api/ingredients', {
      method: 'POST',
      body: JSON.stringify(data)
    }, {
      skipCache: true,
      invalidatePatterns: ['/api/ingredients']
    })
  }

  async updateIngredient(id: string, data: any) {
    return this.fetch(`/api/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, {
      skipCache: true,
      invalidatePatterns: ['/api/ingredients']
    })
  }

  async deleteIngredient(id: string) {
    return this.fetch(`/api/ingredients/${id}`, {
      method: 'DELETE'
    }, {
      skipCache: true,
      invalidatePatterns: ['/api/ingredients', '/api/recipes'] // Recipes might reference ingredients
    })
  }

  // Bulk operations
  async bulkDeleteIngredients(ids: string[]) {
    return this.fetch('/api/ingredients/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    }, {
      skipCache: true,
      invalidatePatterns: ['/api/ingredients', '/api/recipes']
    })
  }

  // Dashboard stats with short cache
  async getDashboardStats() {
    return this.fetch('/api/dashboard/stats', {}, { ttl: 30 * 1000 }) // 30 seconds cache
  }

  // Cache management
  invalidateCache(pattern?: string) {
    if (pattern) {
      this.cache.invalidatePattern(pattern)
    } else {
      this.cache.clear()
    }
  }

  // Preload critical data
  async preloadCriticalData() {
    const promises = [
      this.getIngredients(),
      this.getDashboardStats(),
    ]

    return Promise.allSettled(promises)
  }
}

// Singleton instance
export const optimizedAPI = new OptimizedAPIClient()

// React hook for using optimized API with loading states
import { useCallback, useEffect, useState } from 'react'

export function useOptimizedAPI<T>(
  apiCall: () => Promise<T>,
  deps: any[] = [],
  options?: { 
    autoFetch?: boolean
    onError?: (error: Error) => void 
  }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      options?.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, deps)

  const refetch = useCallback(() => {
    return fetchData()
  }, [fetchData])

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchData()
    }
  }, [fetchData])

  return { data, loading, error, refetch }
}