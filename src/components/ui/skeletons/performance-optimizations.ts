import { useCallback, useMemo } from 'react'

import { apiLogger, logger } from '@/lib/logger'

/**
 * Performance Optimizations untuk Skeleton Loading System
 * 
 * File ini berisi utility functions untuk mengoptimalkan performance
 * skeleton loading dan memastikan smooth transitions.
 */


// Minimum loading duration untuk smooth UX
export const MIN_LOADING_DURATION = {
  FAST: 300,    // For simple operations
  NORMAL: 500,  // For normal API calls 
  SLOW: 1000,   // For heavy operations
} as const

// Debounce utility untuk mencegah flickering
export function useSkeletonDebounce(delay: number = MIN_LOADING_DURATION.FAST) {
  return useCallback((callback: () => void) => {
    const timeoutId = setTimeout(callback, delay)
    return () => clearTimeout(timeoutId)
  }, [delay])
}

// Memoized skeleton array untuk menghindari re-renders
export function useSkeletonArray(length: number, dependency?: unknown[]) {
  const depsString = JSON.stringify(dependency)
  return useMemo(
    () => Array.from({ length }, (_, i) => i),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [length, depsString]
  )
}

// Progressive loading utility
export class ProgressiveLoader {
  private readonly timers: Map<string, NodeJS.Timeout> = new Map()

  scheduleLoading(key: string, callback: () => void, delay: number) {
    // Clear existing timer if any
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Schedule new timer
    const timer = setTimeout(() => {
      callback()
      this.timers.delete(key)
    }, delay)

    this.timers.set(key, timer)
  }

  cancelLoading(key: string) {
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  cancelAll() {
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
  }
}

// Skeleton cache untuk menghindari re-creating skeleton elements
export const skeletonCache = new Map<string, JSX.Element>()

export function getCachedSkeleton(
  key: string, 
  factory: () => JSX.Element
): JSX.Element {
  if (!skeletonCache.has(key)) {
    skeletonCache.set(key, factory())
  }
  const cached = skeletonCache.get(key)
  if (!cached) {
    throw new Error(`Skeleton cache failed for key: ${key}`)
  }
  return cached
}

// Animation timing untuk smooth transitions
export const ANIMATION_CONFIG = {
  FADE_IN: 'animate-in fade-in duration-300',
  FADE_OUT: 'animate-out fade-out duration-200',
  SKELETON_PULSE: 'animate-pulse',
  SLIDE_IN: 'animate-in slide-in-from-top duration-300',
} as const

// Preload optimization untuk skeleton components
export function preloadSkeletonComponents() {
  // Preload common skeleton components to avoid loading delays
  if (typeof window !== 'undefined') {
    // Static preloading - components are already imported
    logger.info('Skeleton components preloaded (static imports)')
  }
}

// Intersection Observer untuk lazy loading dengan skeleton
export function createSkeletonObserver(
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined') {return null}

  return new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        callback(entry.isIntersecting)
      })
    },
    {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    }
  )
}

// Performance monitoring untuk skeleton loading
export interface SkeletonMetrics {
  skeletonDisplayTime: number
  transitionTime: number
  totalLoadTime: number
}

export class SkeletonPerformanceMonitor {
  private readonly startTimes = new Map<string, number>()
  private readonly metrics = new Map<string, SkeletonMetrics>()

  startSkeleton(key: string) {
    this.startTimes.set(key, performance.now())
  }

  endSkeleton(key: string) {
    const startTime = this.startTimes.get(key)
    if (startTime) {
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      this.metrics.set(key, {
        skeletonDisplayTime: totalTime,
        transitionTime: 0, // Will be set during transition
        totalLoadTime: totalTime
      })
      
      this.startTimes.delete(key)
    }
  }

  getMetrics(key: string): SkeletonMetrics | undefined {
    return this.metrics.get(key)
  }

  getAllMetrics(): Map<string, SkeletonMetrics> {
    return new Map(this.metrics)
  }

  clear() {
    this.startTimes.clear()
    this.metrics.clear()
  }
}

export const globalSkeletonMonitor = new SkeletonPerformanceMonitor()

// Static skeleton components (converted from lazy loading)
import { Skeleton } from '@/components/ui/skeleton'

export const LazySkeletons = {
  Dashboard: () => Promise.resolve({ default: Skeleton }),
  Table: () => Promise.resolve({ default: Skeleton }),
  Form: () => Promise.resolve({ default: Skeleton }),
}

// Memory optimization - cleanup skeleton cache periodically
let skeletonCacheCleanupInterval: NodeJS.Timeout | null = null

export function startSkeletonCacheCleanup(intervalMs = 300000) { // 5 minutes
  if (skeletonCacheCleanupInterval) {
    clearInterval(skeletonCacheCleanupInterval)
  }

  skeletonCacheCleanupInterval = setInterval(() => {
    // Clear half of the cache to prevent memory buildup
    const keys = Array.from(skeletonCache.keys())
    const keysToDelete = keys.slice(0, Math.floor(keys.length / 2))
    keysToDelete.forEach(key => skeletonCache.delete(key))
    
    apiLogger.info(`🧹 Skeleton cache cleaned: ${keysToDelete.length} items removed`)
  }, intervalMs)
}

export function stopSkeletonCacheCleanup() {
  if (skeletonCacheCleanupInterval) {
    clearInterval(skeletonCacheCleanupInterval)
    skeletonCacheCleanupInterval = null
  }
}
