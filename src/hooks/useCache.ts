import { useEffect, useRef, useState } from 'react'
import { enhancedCache } from '@/lib/enhanced-cache'
import { createClientLogger } from '@/lib/client-logger'

const cacheLogger = createClientLogger('CacheHook')

/**
 * Custom hook for cache operations with memory leak prevention
 */
export const useCache = <T>(key: string, initialValue?: T) => {
  const mountedRef = useRef(true)
  const [value, setValue] = useState<T | null>(null)

  useEffect(() => {
    mountedRef.current = true
    
    // Load cached value
    const cachedValue = enhancedCache.get<T>(key)
    if (cachedValue) {
      setValue(cachedValue)
    } else if (initialValue !== undefined) {
      setValue(initialValue)
      // Store initial value in cache
      enhancedCache.set(key, initialValue)
    }
    
    return () => {
      mountedRef.current = false
    }
  }, [key, initialValue])

  const setCachedValue = (newValue: T, ttl?: number) => {
    if (!mountedRef.current) {return}
    
    setValue(newValue)
    enhancedCache.set(key, newValue, ttl)
  }

  const getCachedValue = () => {
    if (!mountedRef.current) {return value} // Return current state value if unmounted
    
    const cached = enhancedCache.get<T>(key)
    if (cached) {
      setValue(cached)
      return cached
    }
    return value
  }

  const invalidateCache = () => {
    enhancedCache.delete(key)
    if (initialValue !== undefined) {
      setValue(initialValue)
    } else {
      setValue(null)
    }
  }

  return {
    value,
    set: setCachedValue,
    get: getCachedValue,
    invalidate: invalidateCache,
    has: () => enhancedCache.get<T>(key) !== null,
    stats: enhancedCache.getStats()
  }
}

/**
 * Cache hook for async data fetching with automatic caching
 */
export const useAsyncCache = <T>(key: string, fetcher: () => Promise<T>, ttl?: number) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Check cache first
        const cachedData = enhancedCache.get<T>(key)
        if (cachedData) {
          if (mountedRef.current) {
            setData(cachedData)
            setLoading(false)
          }
          return
        }

        // Fetch fresh data
        const freshData = await fetcher()
        if (mountedRef.current) {
          setData(freshData)
          // Store in cache
          enhancedCache.set(key, freshData, ttl)
          setLoading(false)
        }
      } catch (err) {
        const error = err as Error
        if (mountedRef.current) {
          setError(error)
          setLoading(false)
        }
        cacheLogger.error({ error: error.message, key }, 'Cache fetch error')
        
        // Try to return stale data if available
        try {
          const staleData = enhancedCache.get<T>(key)
          if (staleData && mountedRef.current) {
            setData(staleData)
            cacheLogger.warn({ key }, 'Showing stale data due to fetch error')
          }
        } catch {
          // Ignore stale data retrieval errors
        }
      }
    }

    void loadData()

    return () => {
      mountedRef.current = false
    }
  }, [key, fetcher, ttl])

  const refresh = async () => {
    if (!mountedRef.current) {return}
    
    setLoading(true)
    setError(null)
    
    try {
      const freshData = await fetcher()
      if (mountedRef.current) {
        setData(freshData)
        // Update cache
        enhancedCache.set(key, freshData, ttl)
        setLoading(false)
      }
    } catch (err) {
      const error = err as Error
      if (mountedRef.current) {
        setError(error)
        setLoading(false)
      }
      cacheLogger.error({ error: error.message, key }, 'Cache refresh error')
    }
  }

  const invalidate = () => {
    enhancedCache.delete(key)
    if (mountedRef.current) {
      setData(null)
    }
  }

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    hasData: data !== null
  }
}