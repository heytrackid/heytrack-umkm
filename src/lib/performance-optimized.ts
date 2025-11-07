'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type DependencyList } from 'react'

import { createClientLogger } from '@/lib/client-logger'



/**
 * Advanced Performance Optimization Utilities
 * Extends base performance.ts with more advanced features
 */


const perfLogger = createClientLogger('Component')

/**
 * Memoize array operations to prevent unnecessary recalculations
 */
/**
 * Memoize array operations to prevent unnecessary recalculations
 */
export function useMemoizedArrayOps<T, M = T>(
  array: T[],
  operations: {
    filter?: (item: T) => boolean
    map?: (item: T) => M
    reduce?: (acc: M[], item: T) => M[]
    sort?: (a: T, b: T) => number
  }
) {
  return useMemo(() => {
    let result: M[] | T[] = [...array]

    if (operations.filter) {
      result = (result).filter(operations.filter)
    }
    if (operations.map) {
      result = (result).map(operations.map)
    }
    if (operations.sort) {
      result = [...(result as T[])].sort(operations.sort)
    }
    if (operations.reduce) {
      result = (result as T[]).reduce(operations.reduce, [] as M[])
    }

    return result
  }, [array, operations.filter, operations.map, operations.reduce, operations.sort])
}

/**
 * Optimize expensive calculations with memoization
 */
export function useExpensiveCalculation<T, R>(
  data: T,
  calculator: (data: T) => R,
  deps: DependencyList = []
): R {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => calculator(data), [data, calculator, ...deps])
}

/**
 * Batch multiple calculations together
 */
export function useBatchedCalculations<T extends Record<string, () => unknown>>(
  calculations: T
): { [K in keyof T]: T[K] extends () => infer R ? R : never } {
  return useMemo(() => {
    const results = {} as { [K in keyof T]: T[K] extends () => infer R ? R : never }
    Object.keys(calculations).forEach((key) => {
      const k = key as keyof T
      results[k] = calculations[k]() as { [K in keyof T]: T[K] extends () => infer R ? R : never }[typeof k]
    })
    return results
  }, [calculations])
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length])

  const visibleItems = useMemo(() => items.slice(visibleRange.startIndex, visibleRange.endIndex + 1), [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  }
}

/**
 * Optimize re-renders with stable callbacks
 */
export function useStableCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T
): T {
  const callbackRef = useRef<T>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback((...args: Parameters<T>) => callbackRef.current(...args), []) as T
}

/**
 * Prevent unnecessary re-renders with deep comparison
 */
export function useDeepMemo<T>(value: T): T {
  const ref = useRef<T>(value)
  const [signal, setSignal] = useState<number>(0)

  if (JSON.stringify(value) !== JSON.stringify(ref.current)) {
    ref.current = value
    setSignal(prev => prev + 1)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ref.current, [signal])
}

/**
 * Optimize array calculations (sum, average, etc)
 */
export const arrayCalculations = {
  sum: <T>(array: T[], key: keyof T): number => array.reduce((sum, item) => sum + (Number(item[key]) || 0), 0),

  average: <T>(array: T[], key: keyof T): number => {
    if (array.length === 0) {return 0}
    return arrayCalculations.sum(array, key) / array.length
  },

  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => array.reduce((groups, item) => {
      const groupKey = String(item[key])
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    }, {} as Record<string, T[]>),

  unique: <T>(array: T[], key: keyof T): T[] => {
    const seen = new Set()
    return array.filter((item) => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }
}

/**
 * Memoized filter with multiple conditions
 */
export function useFilteredData<T extends Record<string, unknown>>(
  data: T[],
  filters: Record<string, unknown>
): T[] {
  return useMemo(() => data.filter((item) => Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') {return true}
        return item[key as keyof T] === value
      })), [data, filters])
}

/**
 * Paginated data with memoization
 */
export function usePaginatedData<T>(
  data: T[],
  page: number,
  pageSize: number
) {
  return useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      items: data.slice(start, end),
      totalPages: Math.ceil(data.length / pageSize),
      totalItems: data.length,
      hasNext: end < data.length,
      hasPrev: page > 1
    }
  }, [data, page, pageSize])
}

/**
 * Debounced value with cleanup
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttled callback
 */
export function useThrottledCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = now
      }
    },
    [callback, delay]
  ) as T
}

/**
 * Measure component performance
 */
export function usePerformanceMonitor(componentName: string, enabled = false) {
  const renderCount = useRef(0)
  const renderTimes = useRef<number[]>([])

  useEffect(() => {
    if (!enabled) {return}

    renderCount.current += 1
    const startTime = performance.now()
    const currentRenderTimes = renderTimes.current

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      currentRenderTimes.push(renderTime)

      if (renderCount.current % 10 === 0) {
        const avg = currentRenderTimes.reduce((a, b) => a + b, 0) / currentRenderTimes.length
        perfLogger.info({
          componentName,
          renders: renderCount.current,
          avgTime: `${avg.toFixed(2)}ms`,
          lastTime: `${renderTime.toFixed(2)}ms`
        }, 'Component performance metrics')
      }
    }
  })
}

/**
 * Lazy load component with intersection observer
 */
export function useLazyLoad(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

/**
 * Cache expensive function results
 */
export function createMemoizedFunction<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  maxCacheSize = 100
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      const cached = cache.get(key)
      if (cached !== undefined) {
        return cached
      }
    }

    const result = fn(...args)

    // Limit cache size
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value
      if (typeof firstKey === 'string') {
        cache.delete(firstKey)
      }
    }

    cache.set(key, result)
    return result
  }) as T
}
