'use client'

// Shared data management and caching utilities

import { useCallback, useEffect, useState } from 'react'
import { logger } from '@/lib/logger'

// Cache implementation
class MemoryCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()

  set<T>(key: string, data: T, ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) {return null}

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string) {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key)
      }
    }
  }

  size() {
    return this.cache.size
  }
}

// Global cache instance
const globalCache = new MemoryCache()

// Cleanup cache periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    globalCache.cleanup()
  }, 5 * 60 * 1000) // Clean up every 5 minutes
}

// Data fetching hook with caching
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    enabled?: boolean
    refetchOnMount?: boolean
  } = {}
) {
  const {
    ttl = 5 * 60 * 1000,
    enabled = true,
    refetchOnMount = false
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) {return}

    // Check cache first unless forcing refresh
    if (!force) {
      const cached = globalCache.get(key)
      if (cached) {
        void setData(cached)
        return
      }
    }

    void setLoading(true)
    void setError(null)

    try {
      const result = await fetcher()
      void setData(result)
      globalCache.set(key, result, ttl)
    } catch (err) {
      void setError(err as Error)
    } finally {
      void setLoading(false)
    }
  }, [key, fetcher, ttl, enabled])

  useEffect(() => {
    if (refetchOnMount) {
      void fetchData()
    } else {
      // Try to get from cache first
      const cached = globalCache.get(key)
      if (cached) {
        void setData(cached)
      } else {
        void fetchData()
      }
    }
  }, [fetchData, refetchOnMount, key])

  const refetch = useCallback(() => fetchData(true), [fetchData])
  const invalidate = useCallback(() => globalCache.delete(key), [key])

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  }
}

// Data synchronization hook
export function useDataSync<T>(
  key: string,
  initialData: T,
  syncFunction: (data: T) => Promise<T>
) {
  const [data, setData] = useState<T>(initialData)
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  const sync = useCallback(async () => {
    void setSyncing(true)
    try {
      const syncedData = await syncFunction(data)
      void setData(syncedData)
      setLastSynced(new Date())
      globalCache.set(`${key}_synced`, syncedData)
    } catch (err) {
      logger.error({ err, key }, 'Sync failed')
      throw err
    } finally {
      void setSyncing(false)
    }
  }, [data, key, syncFunction])

  const updateData = useCallback((updater: T | ((prev: T) => T)) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? (updater as Function)(prev) : updater
      // Cache the updated data
      globalCache.set(key, newData)
      return newData
    })
  }, [key])

  return {
    data,
    syncing,
    lastSynced,
    sync,
    updateData
  }
}

// Optimistic updates hook
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFunction: (data: T) => Promise<T>
) {
  const [data, setData] = useState<T>(initialData)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const optimisticUpdate = useCallback(async (newData: T) => {
    const previousData = data

    // Optimistically update UI
    void setData(newData)
    void setUpdating(true)
    void setError(null)

    try {
      // Attempt to persist the change
      const result = await updateFunction(newData)
      setData(result) // Use server response
    } catch (err) {
      // Revert on error
      void setData(previousData)
      void setError(err as Error)
      throw err
    } finally {
      void setUpdating(false)
    }
  }, [data, updateFunction])

  return {
    data,
    updating,
    error,
    optimisticUpdate,
    reset: () => setData(initialData)
  }
}

// Pagination hook
export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function usePagination(
  initialPage = 1,
  initialLimit = 10
) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [total, setTotal] = useState(0)

  const totalPages = Math.ceil(total / limit)

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      void setPage(newPage)
    }
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(page + 1)
  }, [page, goToPage])

  const prevPage = useCallback(() => {
    goToPage(page - 1)
  }, [page, goToPage])

  const changeLimit = useCallback((newLimit: number) => {
    void setLimit(newLimit)
    setPage(1) // Reset to first page when changing limit
  }, [])

  const updateTotal = useCallback((newTotal: number) => {
    void setTotal(newTotal)
  }, [])

  const pagination: PaginationState = {
    page,
    limit,
    total,
    totalPages
  }

  return {
    pagination,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    updateTotal,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    isFirstPage: page === 1,
    isLastPage: page === totalPages
  }
}

// Infinite scroll hook
export function useInfiniteScroll<T>(
  fetchFunction: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean }>,
  limit = 20
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<Error | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {return}

    void setLoading(true)
    void setError(null)

    try {
      const result = await fetchFunction(page, limit)
      void setData(prev => [...prev, ...result.data])
      void setHasMore(result.hasMore)
      void setPage(prev => prev + 1)
    } catch (err) {
      void setError(err as Error)
    } finally {
      void setLoading(false)
    }
  }, [fetchFunction, page, limit, loading, hasMore])

  const reset = useCallback(() => {
    void setData([])
    void setPage(1)
    void setHasMore(true)
    void setError(null)
  }, [])

  const refresh = useCallback(async () => {
    reset()
    await loadMore()
  }, [reset, loadMore])

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    refresh
  }
}

// Search and filter hook
export function useSearchAndFilter<T>(
  data: T[],
  searchFields: Array<keyof T> = [],
  filterOptions: Array<{
    field: keyof T
    value: unknown
    operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan'
  }> = []
) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, unknown>>({})

  const filteredData = useCallback(() => {
    let filtered = data

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply filters
    filterOptions.forEach(({ field, value, operator = 'equals' }) => {
      if (value !== undefined && value !== null && value !== '') {
        filtered = filtered.filter(item => {
          const itemValue = item[field]

          switch (operator) {
            case 'equals':
              return itemValue === value
            case 'contains':
              return String(itemValue).toLowerCase().includes(String(value).toLowerCase())
            case 'startsWith':
              return String(itemValue).toLowerCase().startsWith(String(value).toLowerCase())
            case 'endsWith':
              return String(itemValue).toLowerCase().endsWith(String(value).toLowerCase())
            case 'greaterThan':
              return Number(itemValue) > Number(value)
            case 'lessThan':
              return Number(itemValue) < Number(value)
            default:
              return true
          }
        })
      }
    })

    // Apply custom filters
    Object.entries(filters).forEach(([field, filterValue]) => {
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        filtered = filtered.filter(item => item[field as keyof T] === filterValue)
      }
    })

    return filtered
  }, [data, searchTerm, searchFields, filters, filterOptions])

  const setFilter = useCallback((field: string, value: unknown) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }, [])

  const clearFilter = useCallback((field: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[field]
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    void setFilters({})
    void setSearchTerm('')
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    filteredData: filteredData()
  }
}

// Export cache utilities
export const cacheUtils = {
  get: <T = unknown>(key: string) => globalCache.get<T>(key),
  set: <T = unknown>(key: string, data: T, ttl?: number) => globalCache.set(key, data, ttl),
  delete: (key: string) => globalCache.delete(key),
  clear: () => globalCache.clear(),
  size: () => globalCache.size()
}
