'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

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

interface PerformanceObserverEntry {
  name: string
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
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
  const observersRef = useRef<PerformanceObserver[]>([])
  const startTimeRef = useRef<number>(performance.now())

  // Initialize performance monitoring
  useEffect(() => {
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
        updateMemoryUsage()
      }, 5000) // Update every 5 seconds

      return () => {
        clearInterval(memoryInterval)
        cleanupObservers()
      }
    }

    return cleanupObservers
  }, [])

  const observeCoreWebVitals = () => {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { size?: number }

        setMetrics(prev => ({
          ...prev,
          lcp: lastEntry.startTime
        }))
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      observersRef.current.push(lcpObserver)
    } catch (e) {
      console.warn('LCP observation not supported')
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          setMetrics(prev => ({
            ...prev,
            fid: entry.processingStart - entry.startTime
          }))
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      observersRef.current.push(fidObserver)
    } catch (e) {
      console.warn('FID observation not supported')
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        setMetrics(prev => ({
          ...prev,
          cls: clsValue
        }))
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      observersRef.current.push(clsObserver)
    } catch (e) {
      console.warn('CLS observation not supported')
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          setMetrics(prev => ({
            ...prev,
            fcp: entry.startTime
          }))
        })
      })
      fcpObserver.observe({ entryTypes: ['paint'] })
      observersRef.current.push(fcpObserver)
    } catch (e) {
      console.warn('FCP observation not supported')
    }
  }

  const observeNavigationTiming = () => {
    // Use Navigation Timing API
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (navigation) {
      setMetrics(prev => ({
        ...prev,
        ttfb: navigation.responseStart - navigation.requestStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart
      }))
    }

    // Monitor page load
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTimeRef.current
      setMetrics(prev => ({
        ...prev,
        loadComplete: loadTime
      }))
    })

    // Monitor DOM Content Loaded
    document.addEventListener('DOMContentLoaded', () => {
      const domTime = performance.now() - startTimeRef.current
      setMetrics(prev => ({
        ...prev,
        domContentLoaded: domTime
      }))
    })
  }

  const observeResourceTiming = () => {
    // Monitor resource loading performance
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      // Could analyze resource loading times here
      console.log('[Performance] Resource timing:', entries.length, 'resources loaded')
    })
    resourceObserver.observe({ entryTypes: ['resource'] })
    observersRef.current.push(resourceObserver)
  }

  const updateMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      setMetrics(prev => ({
        ...prev,
        memoryUsage: {
          used: memory.usedJSHeapSize || null,
          total: memory.totalJSHeapSize || null,
          limit: memory.jsHeapSizeLimit || null
        }
      }))
    }
  }

  const cleanupObservers = () => {
    observersRef.current.forEach(observer => {
      observer.disconnect()
    })
    observersRef.current = []
  }

  // Get performance score based on Core Web Vitals
  const getPerformanceScore = useCallback(() => {
    const { lcp, fid, cls } = metrics

    if (lcp === null || fid === null || cls === null) {
      return null
    }

    // Score based on Google's thresholds
    let score = 100

    // LCP scoring
    if (lcp > 4000) score -= 30 // Poor
    else if (lcp > 2500) score -= 15 // Needs improvement

    // FID scoring
    if (fid > 300) score -= 30 // Poor
    else if (fid > 100) score -= 15 // Needs improvement

    // CLS scoring
    if (cls > 0.25) score -= 30 // Poor
    else if (cls > 0.1) score -= 15 // Needs improvement

    return Math.max(0, Math.min(100, score))
  }, [metrics])

  // Get performance rating
  const getPerformanceRating = useCallback(() => {
    const score = getPerformanceScore()
    if (score === null) return 'unknown'
    if (score >= 90) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 50) return 'needs-improvement'
    return 'poor'
  }, [getPerformanceScore])

  // Export metrics for analytics
  const exportMetrics = useCallback(() => {
    return {
      ...metrics,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      score: getPerformanceScore(),
      rating: getPerformanceRating()
    }
  }, [metrics, getPerformanceScore, getPerformanceRating])

  return {
    metrics,
    isSupported,
    performanceScore: getPerformanceScore(),
    performanceRating: getPerformanceRating(),
    exportMetrics,
    updateMemoryUsage
  }
}
