// Performance monitoring and optimization utilities

import { useCallback, useEffect, useRef, useState } from 'react'
import { logger } from '@/lib/logger'

// Log performance metrics
export function logPerformance(metric: string, value: number) {
  logger.info({ metric, value }, 'Performance metric')
}

// Performance monitoring types
export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'measure' | 'mark' | 'navigation' | 'resource' | 'paint'
}

export interface PerformanceReport {
  metrics: PerformanceMetric[]
  summary: {
    totalLoadTime: number
    domContentLoaded: number
    firstPaint: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    timeToInteractive: number
    cumulativeLayoutShift: number
    firstInputDelay: number
  }
  recommendations: string[]
}

// Web Vitals types
export interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

// Performance monitoring hooks
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [webVitals, setWebVitals] = useState<WebVitalsMetric[]>([])
  const observerRef = useRef<PerformanceObserver | null>(null)

  useEffect(() => {
    // Monitor navigation timing
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as any

        if (navigation) {
          const navMetrics: PerformanceMetric[] = [
            {
              name: 'navigation_start',
              value: navigation.startTime || 0,
              timestamp: Date.now(),
              type: 'navigation'
            },
            {
              name: 'dom_content_loaded',
              value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              timestamp: Date.now(),
              type: 'navigation'
            },
            {
              name: 'load_complete',
              value: navigation.loadEventEnd - navigation.loadEventStart,
              timestamp: Date.now(),
              type: 'navigation'
            }
          ]

          void setMetrics(prev => [...prev, ...navMetrics])
        }
      } catch (err) {
        // Navigation timing not available
      }

      // Monitor paint timing
      try {
        const paintEntries = performance.getEntriesByType('paint')
        paintEntries.forEach(entry => {
          const paintMetric: PerformanceMetric = {
            name: entry.name,
            value: (entry as any).startTime || 0,
            timestamp: Date.now(),
            type: 'paint'
          }
          void setMetrics(prev => [...prev, paintMetric])
        })
      } catch (err) {
        // Paint timing not available
      }

      // Create performance observer for ongoing monitoring
      if ('PerformanceObserver' in window) {
        try {
          observerRef.current = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const newMetrics: PerformanceMetric[] = entries.map(entry => ({
              name: entry.name,
              value: 'duration' in entry ? (entry as any).duration : ((entry as any).startTime || 0),
              timestamp: Date.now(),
              type: entry.entryType as any
            }))

            void setMetrics(prev => [...prev, ...newMetrics])
          })

          // Observe different performance entry types
          observerRef.current.observe({ entryTypes: ['measure', 'mark', 'resource', 'navigation', 'paint'] })
        } catch (err) {
          // Performance monitoring not fully supported
        }
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const measurePerformance = useCallback((name: string, startMark?: string, endMark?: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        if (startMark && endMark) {
          performance.measure(name, startMark, endMark)
        } else {
          performance.mark(name)
        }

        const entries = performance.getEntriesByName(name)
        if (entries.length > 0) {
          const entry = entries[entries.length - 1]
          const metric: PerformanceMetric = {
            name,
            value: 'duration' in entry ? (entry as any).duration : ((entry as any).startTime || 0),
            timestamp: Date.now(),
            type: entry.entryType as any
          }

          void setMetrics(prev => [...prev, metric])
          return metric
        }
      } catch (err) {
        // Performance measurement failed
      }
    }
    return null
  }, [])

  const markPerformance = useCallback((name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        performance.mark(name)
        const metric: PerformanceMetric = {
          name,
          value: performance.now(),
          timestamp: Date.now(),
          type: 'mark'
        }
        void setMetrics(prev => [...prev, metric])
        return metric
      } catch (err) {
        // Performance mark failed
      }
    }
    return null
  }, [])

  const getPerformanceReport = useCallback((): PerformanceReport => {
    const summary = {
      totalLoadTime: 0,
      domContentLoaded: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      timeToInteractive: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    }

    // Calculate summary metrics
    metrics.forEach(metric => {
      switch (metric.name) {
        case 'load_complete':
          summary.totalLoadTime = metric.value
          break
        case 'dom_content_loaded':
          summary.domContentLoaded = metric.value
          break
        case 'first-paint':
          summary.firstPaint = metric.value
          break
        case 'first-contentful-paint':
          summary.firstContentfulPaint = metric.value
          break
        case 'largest-contentful-paint':
          summary.largestContentfulPaint = metric.value
          break
        case 'time-to-interactive':
          summary.timeToInteractive = metric.value
          break
        case 'cumulative-layout-shift':
          summary.cumulativeLayoutShift = metric.value
          break
        case 'first-input-delay':
          summary.firstInputDelay = metric.value
          break
      }
    })

    // Generate recommendations
    const recommendations: string[] = []

    if (summary.totalLoadTime > 3000) {
      recommendations.push('Consider optimizing bundle size and reducing initial load time')
    }
    if (summary.firstContentfulPaint > 2000) {
      recommendations.push('Improve First Contentful Paint by optimizing critical resources')
    }
    if (summary.largestContentfulPaint > 2500) {
      recommendations.push('Optimize Largest Contentful Paint by improving image loading')
    }
    if (summary.cumulativeLayoutShift > 0.1) {
      recommendations.push('Reduce Cumulative Layout Shift by reserving space for dynamic content')
    }

    return {
      metrics,
      summary,
      recommendations
    }
  }, [metrics])

  return {
    metrics,
    webVitals,
    measurePerformance,
    markPerformance,
    getPerformanceReport,
  }
}

// Web Vitals monitoring hook - simplified to avoid import issues
export function useWebVitals() {
  const [metrics, setMetrics] = useState<WebVitalsMetric[]>([])

  useEffect(() => {
    // Web Vitals monitoring disabled to avoid import issues
    // In a real implementation, you would conditionally import web-vitals
  }, [])

  return metrics
}

// Memory monitoring hook
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
    usagePercentage: number
  } | null>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const {memory} = (performance as any)
        if (memory) {
          const used = memory.usedJSHeapSize
          const total = memory.totalJSHeapSize
          const limit = memory.jsHeapSizeLimit

          setMemoryInfo({
            usedJSHeapSize: used,
            totalJSHeapSize: total,
            jsHeapSizeLimit: limit,
            usagePercentage: (used / limit) * 100
          })
        }
      }
    }

    // Update immediately and then every 5 seconds
    void updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Network monitoring hook
export function useNetworkMonitor() {
  const [networkInfo, setNetworkInfo] = useState<{
    isOnline: boolean
    connection?: {
      effectiveType: string
      downlink: number
      rtt: number
    }
  }>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      setNetworkInfo({
        isOnline: navigator.onLine,
        connection: connection ? {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        } : undefined
      })
    }

    void updateNetworkInfo()

    const handleOnline = () => setNetworkInfo(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setNetworkInfo(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if ((navigator as any).connection) {
      ;(navigator as any).connection.addEventListener('change', updateNetworkInfo)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if ((navigator as any).connection) {
        ;(navigator as any).connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  return networkInfo
}

// Bundle analyzer hook - simplified
export function useBundleAnalyzer() {
  const [bundleInfo, setBundleInfo] = useState<{
    chunks: Array<{
      name: string
      size: number
      sizeGzip: number
    }>
    totalSize: number
    totalSizeGzip: number
  } | null>(null)

  useEffect(() => {
    // Simplified bundle analysis - in real app, load from build artifacts
    void setBundleInfo(null)
  }, [])

  return bundleInfo
}

// Performance optimization utilities
export const perfUtils = {
  // Debounce function
  debounce: <T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    wait: number,
    immediate = false
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null
        if (!immediate) {func(...args)}
      }

      const callNow = immediate && !timeout

      if (timeout) {clearTimeout(timeout)}
      timeout = setTimeout(later, wait)

      if (callNow) {func(...args)}
    }
  },

  // Throttle function
  throttle: <T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  // Memoization utility
  memoize: <T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    getKey?: (...args: Parameters<T>) => string
  ): T => {
    const cache = new Map<string, ReturnType<T>>()

    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = getKey ? getKey(...args) : JSON.stringify(args)

      if (cache.has(key)) {
        return cache.get(key)!
      }

      const result = func(...args)
      cache.set(key, result)
      return result
    }) as T
  },

  // Request idle callback
  requestIdleCallback: (callback: () => void, timeout = 5000) => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(callback, { timeout })
    } else {
      void setTimeout(callback, 0)
    }
  }
}
