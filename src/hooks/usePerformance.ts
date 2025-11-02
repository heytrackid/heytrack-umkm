import { useEffect, useState, useCallback } from 'react'

/**
 * Performance Optimization Utilities
 * Collection of performance monitoring and optimization helpers
 */


// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const loadTime = endTime - startTime

      // Performance monitoring in development is handled by Next.js compiler

      // Send to analytics in production
      type WindowWithGtag = Window & { gtag?: (...args: unknown[]) => void }
      const win = window as WindowWithGtag
      
      if (typeof window !== 'undefined' && 'gtag' in window && typeof win.gtag === 'function') {
        win.gtag('event', 'component_load_time', {
          component_name: componentName,
          load_time: loadTime,
          page_path: window.location.pathname
        })
      }
    }
  }, [componentName])
}

// Bundle size monitoring
export function logBundleMetrics() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Log basic performance metrics
    const navigation = performance.getEntriesByType('navigation')[0]

    if (navigation) {
      // Performance metrics tracked silently
      void navigation.loadEventEnd
      void navigation.fetchStart
    }

    // Monitor largest contentful paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(() => {
        // LCP tracked silently
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })

      return () => observer.disconnect()
    }
  }
  
  return undefined
}

// Lazy loading with intersection observer
export function useLazyLoad(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [element, setElement] = useState<Element | null>(null)

  const observerRef = useCallback((node: Element | null) => {
    void setElement(node)
  }, [])

  useEffect(() => {
    if (!element) {return}

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void setIsIntersecting(true)
          // Disconnect after first intersection
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [element, options])

  return { observer: observerRef, isIntersecting }
}

// Preload critical resources
export function preloadResource(href: string, as = 'fetch') {
  if (typeof document === 'undefined') {return}

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = href
  link.crossOrigin = 'anonymous'

  document.head.appendChild(link)

  return () => {
    document.head.removeChild(link)
  }
}

// Debounced performance logger
export function usePerformanceLogger(eventName: string, delay = 1000) {
  const [logs, setLogs] = useState<Array<{ timestamp: number; data: unknown }>>([])

  const logPerformance = useCallback(
    (data: unknown) => {
      const timestamp = Date.now()
      setLogs(prev => [...prev.slice(-9), { timestamp, data }]) // Keep last 10 logs

      // Debounced analytics call
      const timeoutId = setTimeout(() => {
        type WindowWithGtag = Window & { gtag?: (...args: unknown[]) => void }
        const win = window as WindowWithGtag
        
        if (typeof window !== 'undefined' && 'gtag' in window && typeof win.gtag === 'function') {
          const payload =
            typeof data === 'object' && data !== null
              ? data as Record<string, unknown>
              : { value: data }

          win.gtag('event', eventName, {
            ...payload,
            timestamp,
            page_path: window.location.pathname
          })
        }
      }, delay)

      return () => clearTimeout(timeoutId)
    },
    [eventName, delay]
  )

  return { logPerformance, logs }
}

// Memory usage monitor
export interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  timestamp: number
}

export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const updateMemoryInfo = () => {
        if ('memory' in performance) {
          type PerformanceWithMemory = Performance & {
            memory: {
              usedJSHeapSize: number
              totalJSHeapSize: number
              jsHeapSizeLimit: number
            }
          }
          
          const perfWithMemory = performance as PerformanceWithMemory
          const {memory} = perfWithMemory
          setMemoryInfo({
            usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
            totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
            jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
            timestamp: Date.now()
          })
        }
      }

      void updateMemoryInfo()
      const interval = setInterval(updateMemoryInfo, 5000) // Update every 5 seconds

      return () => clearInterval(interval)
    }
    return undefined
  }, [])

  return memoryInfo
}

// Component render time profiler
export function useRenderProfiler(_componentName: string) {
  const [renderTimes, setRenderTimes] = useState<number[]>([])

  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      setRenderTimes(prev => [...prev.slice(-9), renderTime]) // Keep last 10 renders
      // Render time tracked silently
    }
  })

  const averageRenderTime = renderTimes.length > 0
    ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
    : 0

  return {
    averageRenderTime,
    lastRenderTime: renderTimes[renderTimes.length - 1] || 0,
    renderCount: renderTimes.length
  }
}

// Network status monitor
export interface NetworkConnection {
  effectiveType: string
  downlink: number
  rtt: number
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [connection, setConnection] = useState<NetworkConnection | null>(null)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Monitor connection quality if available
    if ('connection' in navigator) {
      type NetworkConnection = EventTarget & {
        effectiveType: string
        downlink: number
        rtt: number
        addEventListener(type: 'change', listener: () => void): void
        removeEventListener(type: 'change', listener: () => void): void
      }
      type NavigatorWithConnection = Navigator & {
        connection?: NetworkConnection
      }
      const nav = navigator as NavigatorWithConnection
      const {connection} = nav
      if (connection) {
        setConnection({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        })

        const updateConnection = () => {
          setConnection({
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
          })
        }

        connection.addEventListener('change', updateConnection)

        return () => {
          connection.removeEventListener('change', updateConnection)
        }
      }
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return { isOnline, connection }
}

// Bundle size estimator
export function estimateBundleImpact(codeSize: number): {
  estimatedLoadTime: number
  performanceImpact: 'low' | 'medium' | 'high'
  recommendations: string[]
} {
  // Rough estimation for 3G network (~750KB/s)
  const estimatedLoadTime = codeSize / (750 * 1024)

  let performanceImpact: 'low' | 'medium' | 'high' = 'low'
  let recommendations: string[] = []

  if (codeSize > 500 * 1024) { // > 500KB
    performanceImpact = 'high'
    recommendations = [
      '🚨 Consider code splitting',
      '📦 Implement lazy loading',
      '🗜️ Enable gzip compression',
      '💾 Cache with service worker'
    ]
  } else if (codeSize > 100 * 1024) { // > 100KB
    performanceImpact = 'medium'
    recommendations = [
      '⚠️ Monitor bundle size growth',
      '📦 Consider lazy loading for non-critical parts',
      '🗜️ Ensure compression is enabled'
    ]
  } else {
    recommendations = [
      '✅ Bundle size is good',
      '👀 Keep monitoring for growth'
    ]
  }

  return {
    estimatedLoadTime,
    performanceImpact,
    recommendations
  }
}

// Critical resource preloader
export function useCriticalResourcePreloader(resources: Array<{ href: string; as: string }>) {
  useEffect(() => {
    const cleanup: Array<() => void> = []

    resources.forEach(resource => {
      const cleanupFn = preloadResource(resource.href, resource.as)
      if (cleanupFn) {cleanup.push(cleanupFn)}
    })

    return () => {
      cleanup.forEach(fn => fn())
    }
  }, [resources])
}
