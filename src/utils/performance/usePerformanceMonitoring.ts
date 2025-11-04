'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClientLogger } from '@/lib/client-logger'

const perfLogger = createClientLogger('PerformanceMonitoring')

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift

  // Additional metrics
  fcp: number | null // First Contentful Paint
  ttfb: number | null // Time to First Byte
  domContentLoaded: number | null
  loadComplete: number | null

  // Custom metrics
  timeToInteractive: number | null
  firstMeaningfulPaint: number | null
  bundleSize: number | null

  // Memory usage (if available)
  memoryUsage: {
    used: number | null
    total: number | null
    limit: number | null
  }
}



export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    domContentLoaded: null,
    loadComplete: null,
    timeToInteractive: null,
    firstMeaningfulPaint: null,
    bundleSize: null,
    memoryUsage: {
      used: null,
      total: null,
      limit: null
    }
  })

  const [isSupported, setIsSupported] = useState(false)
  const observersRef = useRef<Set<PerformanceObserver>>(new Set())
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const eventListenersRef = useRef<Set<{ element: EventTarget; event: string; handler: EventListener }>>(new Set())
  const startTimeRef = useRef<number>(performance.now())
  const mountedRef = useRef(true)

  const cleanupAll = useCallback(() => {
    // Disconnect all performance observers
    observersRef.current.forEach(observer => {
      try {
        observer.disconnect()
      } catch (e) {
        perfLogger.warn({ error: e }, 'Error disconnecting performance observer')
      }
    })
    observersRef.current.clear()

    // Clear all intervals
    intervalsRef.current.forEach(interval => {
      clearInterval(interval)
    })
    intervalsRef.current.clear()

    // Remove all event listeners
    eventListenersRef.current.forEach(({ element, event, handler }) => {
      try {
        element.removeEventListener(event, handler)
      } catch (e) {
        perfLogger.warn({ error: e, event }, 'Error removing event listener')
      }
    })
    eventListenersRef.current.clear()
  }, [])

  // Initialize performance monitoring
  useEffect(() => {
    mountedRef.current = true

    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)

    // Observe Core Web Vitals
    observeCoreWebVitals()

    // Observe navigation timing
    observeNavigationTiming()

    // Observe resource loading
    observeResourceTiming()

    // Monitor memory usage (Chrome only)
    if ('memory' in performance) {
      const memoryInterval = setInterval(() => {
        if (mountedRef.current) {
          updateMemoryUsage()
        }
      }, 5000) // Update every 5 seconds
      
      intervalsRef.current.add(memoryInterval)
    }

    return () => {
      mountedRef.current = false
      cleanupAll()
    }
  }, [cleanupAll])

  const observeCoreWebVitals = () => {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        if (!mountedRef.current) {return}
        
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { size?: number }

        setMetrics(prev => ({
          ...prev,
          lcp: lastEntry.startTime
        }))
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      observersRef.current.add(lcpObserver)
    } catch (_e) {
      perfLogger.warn('LCP observation not supported')
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        if (!mountedRef.current) {return}
        
        const entries = list.getEntries()
        entries.forEach((entry: PerformanceEntry) => {
          const firstInputEntry = entry as PerformanceEventTiming
          setMetrics(prev => ({
            ...prev,
            fid: firstInputEntry.processingStart - firstInputEntry.startTime
          }))
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      observersRef.current.add(fidObserver)
    } catch (_e) {
      perfLogger.warn('FID observation not supported')
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        if (!mountedRef.current) {return}
        
        const entries = list.getEntries()
        entries.forEach((entry: PerformanceEntry) => {
          const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
          if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
            clsValue += layoutShiftEntry.value
          }
        })
        setMetrics(prev => ({
          ...prev,
          cls: clsValue
        }))
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      observersRef.current.add(clsObserver)
    } catch (_e) {
      perfLogger.warn('CLS observation not supported')
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        if (!mountedRef.current) {return}
        
        const entries = list.getEntries()
        entries.forEach((entry) => {
          setMetrics(prev => ({
            ...prev,
            fcp: entry.startTime
          }))
        })
      })
      fcpObserver.observe({ entryTypes: ['paint'] })
      observersRef.current.add(fcpObserver)
    } catch (_e) {
      perfLogger.warn('FCP observation not supported')
    }
  }

  const observeNavigationTiming = () => {
    // Use Navigation Timing API
    const navigation = performance.getEntriesByType('navigation')[0]

    if (navigation) {
      setMetrics(prev => ({
        ...prev,
        ttfb: navigation.responseStart - navigation.requestStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart
      }))
    }

    // Monitor page load
    const loadHandler = () => {
      if (!mountedRef.current) {return}
      
      const loadTime = performance.now() - startTimeRef.current
      setMetrics(prev => ({
        ...prev,
        loadComplete: loadTime
      }))
    }
    
    window.addEventListener('load', loadHandler)
    eventListenersRef.current.add({ element: window, event: 'load', handler: loadHandler })

    // Monitor DOM Content Loaded
    const domContentLoadedHandler = () => {
      if (!mountedRef.current) {return}
      
      const domTime = performance.now() - startTimeRef.current
      setMetrics(prev => ({
        ...prev,
        domContentLoaded: domTime
      }))
    }
    
    document.addEventListener('DOMContentLoaded', domContentLoadedHandler)
    eventListenersRef.current.add({ element: document, event: 'DOMContentLoaded', handler: domContentLoadedHandler })
  }

  const observeResourceTiming = () => {
    // Monitor resource loading performance
    const resourceObserver = new PerformanceObserver((list) => {
      if (!mountedRef.current) {return}
      
      // Could analyze resource loading times here
      // Silently track resource timing
      const entries = list.getEntries()
      perfLogger.debug({
        resourceCount: entries.length,
        url: window.location.href
      }, 'Resource timing observed')
    })
    resourceObserver.observe({ entryTypes: ['resource'] })
    observersRef.current.add(resourceObserver)
  }

  const updateMemoryUsage = () => {
    if (!mountedRef.current || !('memory' in performance)) {return}
    
    type PerformanceWithMemory = Performance & {
      memory: {
        usedJSHeapSize?: number
        totalJSHeapSize?: number
        jsHeapSizeLimit?: number
      }
    }
    
    const perfWithMemory = performance as PerformanceWithMemory
    const {memory} = perfWithMemory
    
    setMetrics(prev => ({
      ...prev,
      memoryUsage: {
        used: memory.usedJSHeapSize ?? null,
        total: memory.totalJSHeapSize ?? null,
        limit: memory.jsHeapSizeLimit ?? null
      }
    }))
  }

  // Get performance score based on Core Web Vitals
  const getPerformanceScore = useMemo(() => () => {
    const { lcp, fid, cls } = metrics

    if (lcp === null || fid === null || cls === null) {
      return null
    }

    // Score based on Google's thresholds
    let score = 100

    // LCP scoring
    if (lcp > 4000) {score -= 30} // Poor
    else if (lcp > 2500) {score -= 15} // Needs improvement

    // FID scoring
    if (fid > 300) {score -= 30} // Poor
    else if (fid > 100) {score -= 15} // Needs improvement

    // CLS scoring
    if (cls > 0.25) {score -= 30} // Poor
    else if (cls > 0.1) {score -= 15} // Needs improvement

    return Math.max(0, Math.min(100, score))
  }, [metrics])

  // Get performance rating
  const getPerformanceRating = useMemo(() => () => {
    const score = getPerformanceScore()
    if (score === null) {return 'unknown'}
    if (score >= 90) {return 'excellent'}
    if (score >= 70) {return 'good'}
    if (score >= 50) {return 'needs-improvement'}
    return 'poor'
  }, [getPerformanceScore])

  // Export metrics for analytics
  const exportMetrics = useMemo(() => () => ({
      ...metrics,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      score: getPerformanceScore(),
      rating: getPerformanceRating()
    }), [metrics, getPerformanceScore, getPerformanceRating])

  return {
    metrics,
    isSupported,
    performanceScore: getPerformanceScore(),
    performanceRating: getPerformanceRating(),
    exportMetrics,
    cleanupAll
  }
}
