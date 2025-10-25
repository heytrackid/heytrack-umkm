import React, { ComponentType, lazy, memo, ReactNode, Suspense, useMemo, useCallback } from 'react'
import { apiLogger } from '@/lib/logger'
// Temporarily disabled to fix build issues
// import { debounce, throttle } from 'lodash-es'

// Lazy loading utilities
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn)
  
  return memo((props: any) => 
    React.createElement(Suspense, { 
      fallback: fallback || React.createElement("div") 
    }, React.createElement(LazyComponent, props))
  )
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  startTiming(label: string): () => void {
    if (typeof performance === 'undefined') {
      return () => {} // Return no-op function for server-side
    }
    
    const startTime = performance.now()
    
    return () => {
      if (typeof performance === 'undefined') return
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, [])
      }
      
      this.metrics.get(label)!.push(duration)
      
      // Log slow operations (>100ms)
      if (duration > 100) {
        apiLogger.warn(`⚠️ Slow operation detected: ${label} took ${duration.toFixed(2)}ms`)
      }
    }
  }
  
  getMetrics(label: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.metrics.get(label)
    if (!measurements || measurements.length === 0) return null
    
    return {
      avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length
    }
  }
  
  clearMetrics(label?: string): void {
    if (label) {
      this.metrics.delete(label)
    } else {
      this.metrics.clear()
    }
  }
}

// Simple debounce function
function debounce<T extends (...args: unknown[]) => unknown>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>
  return ((...args: Parameters<T>) => {
    clearTimeout
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

// Simple throttle function
function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): T {
  let inThrottle: boolean
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }) as T
}

// Optimized hooks
export const useDebounce = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  return useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  ) as T
}

export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): T => {
  return useMemo(
    () => throttle(callback, limit),
    [callback, limit]
  ) as T
}

// Memoized callback with performance monitoring
export const usePerformantCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList,
  label?: string
): T => {
  return useCallback((...args: Parameters<T>) => {
    if (label) {
      const endTiming = PerformanceMonitor.getInstance().startTiming(label)
      const result = callback(...args)
      endTiming()
      return result
    }
    return callback(...args)
  }, deps) as T
}

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): React.RefCallback<Element> => {
  const observer = useMemo(() => {
    if (typeof window === 'undefined') return null
    
    return new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })
  }, [callback, options])
  
  return useCallback((element: Element | null) => {
    if (!observer || !element) return
    
    observer.observe(element)
    
    return () => {
      observer.unobserve(element)
    }
  }, [observer])
}

// Virtual scrolling helper
export class VirtualScroller {
  private container: HTMLElement
  private items: unknown[]
  private itemHeight: number
  private containerHeight: number
  
  constructor(
    container: HTMLElement,
    items: unknown[],
    itemHeight: number,
    containerHeight: number
  ) {
    this.container = container
    this.items = items
    this.itemHeight = itemHeight
    this.containerHeight = containerHeight
  }
  
  getVisibleRange(scrollTop: number): { start: number; end: number } {
    const start = Math.floor(scrollTop / this.itemHeight)
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight)
    const end = Math.min(start + visibleCount + 2, this.items.length) // +2 for buffer
    
    return { start: Math.max(0, start - 1), end } // -1 for buffer
  }
  
  getTotalHeight(): number {
    return this.items.length * this.itemHeight
  }
}

// Image loading optimization
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

export const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(urls.map(preloadImage))
}

// Bundle size analyzer helper
export const analyzeBundleSize = (): void => {
  if (typeof window === 'undefined') return
  
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
  
  let totalSize = 0
  
  const analyzeResources = async () => {
    for (const script of scripts) {
      try {
        const response = await fetch((script as HTMLScriptElement).src)
        const size = parseInt(response.headers.get('content-length') || '0', 10)
        totalSize += size
        apiLogger.info(`📦 Script: ${(script as HTMLScriptElement).src} - ${(size / 1024).toFixed(2)}KB`)
      } catch (error: unknown) {
        apiLogger.warn({ script: (script as HTMLScriptElement).src }, 'Failed to analyze script')
      }
    }
    
    apiLogger.info(`📊 Total JavaScript bundle size: ${(totalSize / 1024).toFixed(2)}KB`)
  }
  
  if (process.env.NODE_ENV === 'development') {
    analyzeResources()
  }
}

// Memory usage monitoring
export const monitorMemoryUsage = (): void => {
  if (typeof window === 'undefined' || !(performance as any).memory) return
  
  setInterval(() => {
    const memory = (performance as any).memory
    const used = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
    const limit = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
    
    apiLogger.info(`🧠 Memory usage: ${used}MB / ${limit}MB`)
    
    // Warn if memory usage is high
    if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
      apiLogger.warn('⚠️ High memory usage detected!')
    }
  }, 30000) // Check every 30 seconds
}

// Service Worker registration
export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    apiLogger.info({ registration }, '✅ Service Worker registered')
    
    registration.addEventListener('updatefound', () => {
      apiLogger.info('🔄 New Service Worker version available')
    })
  } catch (error: unknown) {
    apiLogger.error({ error: error }, '❌ Service Worker registration failed:')
  }
}

// Cache utilities
export class CacheManager {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()
  
  set(key: string, data: unknown, ttlMs = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }
  
  get<T = unknown>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data as T
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    return this.cache.size
  }
  
  // Clean expired items
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const cacheManager = new CacheManager()

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup()
  }, 5 * 60 * 1000)
}

// Web Vitals monitoring
export const measureWebVitals = (): void => {
  if (typeof window === 'undefined') return
  
  // Web vitals monitoring disabled - web-vitals library not configured
  // TODO: Install and configure web-vitals library if needed
  // import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
  //   getCLS((metric) => apiLogger.info({ metric }, '📊 CLS'))
  //   getFID((metric) => apiLogger.info({ metric }, '📊 FID'))
  //   getFCP((metric) => apiLogger.info({ metric }, '📊 FCP'))
  //   getLCP((metric) => apiLogger.info({ metric }, '📊 LCP'))
  //   getTTFB((metric) => apiLogger.info({ metric }, '📊 TTFB'))
  // }).catch(() => {
  //   apiLogger.warn('web-vitals not available')
  // })
}