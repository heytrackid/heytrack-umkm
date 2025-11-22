'use client'

import { useEffect, useRef, useCallback } from 'react'

import { createLogger } from '@/lib/logger'


/**
 * Performance Utilities
 * 
 * Helper functions for optimizing performance
 */


const perfLogger = createLogger('Performance')

// Debounce function imported from @/lib/debounce

/**
 * Throttle function
 * Ensures function is called at most once per specified time period
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Memoize expensive calculations
 */
export function memoize<T extends (...args: Parameters<T>) => unknown>(fn: T): T {
  const cache = new Map<string, unknown>()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) {return}

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry?.isIntersecting) {
        callback()
      }
    }, options)

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [callback, options])

  return targetRef
}

/**
 * Hook for measuring component render time
 */
export function useRenderTime(componentName: string) {
  const renderCount = useRef(0)
  const startTime = useRef(0)

  useEffect(() => {
    startTime.current = performance.now()
  }, [])

  useEffect(() => {
    renderCount.current += 1
    const endTime = performance.now()
    const renderTime = endTime - startTime.current

    if (process['env'].NODE_ENV === 'development') {
      perfLogger.info({
        componentName,
        render: renderCount.current,
        time: `${renderTime.toFixed(2)}ms`
      }, 'Component render performance')
    }

    startTime.current = performance.now()
  })
}

/**
 * Batch multiple state updates
 */
export function useBatchedUpdates() {
  const updates = useRef<Array<() => void>>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const batchUpdate = useCallback((update: () => void) => {
    updates.current.push(update)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      updates.current.forEach((fn) => fn())
      updates.current = []
    }, 16) // ~60fps
  }, [])

  return batchUpdate
}

/**
 * Preload component for faster navigation
 */
export function preloadComponent<T = Record<string, unknown>>(importFn: () => Promise<{ default: T }>) {
  return importFn()
}

/**
 * Check if user is on slow connection
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') {return false}
  
  interface NetworkInformation extends EventTarget {
    readonly effectiveType: '2g' | '3g' | '4g' | 'slow-2g'
    readonly saveData: boolean
  }
  
  type NavigatorWithConnection = Navigator & { 
    connection?: NetworkInformation
    mozConnection?: NetworkInformation
    webkitConnection?: NetworkInformation 
  }
  
  const nav = navigator as NavigatorWithConnection
  const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection
  
  if (!connection) {return false}
  
  return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' ||
         connection.saveData === true
}

/**
 * Adaptive loading based on network
 */
export function useAdaptiveLoading() {
  const isSlow = isSlowConnection()
  
  return {
    shouldLoadImages: !isSlow,
    shouldLoadVideos: !isSlow,
    shouldPreload: !isSlow,
    imageQuality: isSlow ? 'low' : 'high'
  }
}

/**
 * Measure and report web vitals
 */
export function reportWebVitals(metric: { name: string; value: number; id: string }) {
  if (process['env'].NODE_ENV === 'production') {
    // Send to analytics
    perfLogger.info({ metric }, 'Web vital metric')
  }
}
