'use client'

import { ReactNode, useEffect } from 'react'
import { 
  measureWebVitals, 
  monitorMemoryUsage,
  PerformanceMonitor
} from '@/lib/performance-simple'

interface PerformanceProviderProps {
  children: ReactNode
  enableAnalytics?: boolean
  enableMemoryMonitoring?: boolean
}

export default function PerformanceProvider({
  children,
  enableAnalytics = true,
  enableMemoryMonitoring = process.env.NODE_ENV === 'development',
}: PerformanceProviderProps) {
  
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initialize performance monitoring
    const monitor = PerformanceMonitor.getInstance()
    
    if (enableAnalytics) {
      // Measure web vitals
      measureWebVitals()
      
      // Start timing page load
      const endPageLoad = monitor.startTiming('page_load')
      
      // End timing when page is fully loaded
      if (document.readyState === 'complete') {
        endPageLoad()
      } else {
        window.addEventListener('load', endPageLoad, { once: true })
      }
      
    }
    
    if (enableMemoryMonitoring && process.env.NODE_ENV === 'development') {
      monitorMemoryUsage()
    }
    
    
    // Performance optimization: Prefetch critical resources
    const prefetchCriticalResources = () => {
      // Prefetch common API routes
      const criticalRoutes = [
        '/api/dashboard/stats',
        '/api/ingredients',
        '/api/orders?limit=10'
      ]
      
      criticalRoutes.forEach(route => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = route
        document.head.appendChild(link)
      })
    }
    
    // Prefetch after initial load
    setTimeout(prefetchCriticalResources, 1000)
    
    // Log performance metrics every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        console.group('📊 Performance Metrics')
        console.log('Page Load:', monitor.getMetrics('page_load'))
        console.log('Cache Size:', `${monitor.getMetrics('cache_size')?.count || 0} items`)
        
        // Log memory if available
        if ((performance as any).memory) {
          const memory = (performance as any).memory
          console.log('Memory:', {
            used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
          })
        }
        console.groupEnd()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [enableAnalytics, enableMemoryMonitoring])
  
  return <>{children}</>
}