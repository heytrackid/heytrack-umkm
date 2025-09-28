// Simple performance utilities without external dependencies
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
        console.warn(`⚠️ Slow operation detected: ${label} took ${duration.toFixed(2)}ms`)
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

// Cache utilities
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }
  
  get<T = any>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
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

// Memory usage monitoring
export const monitorMemoryUsage = (): void => {
  if (typeof window === 'undefined' || !(performance as any).memory) return
  
  setInterval(() => {
    const memory = (performance as any).memory
    const used = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
    const limit = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
    
    console.log(`🧠 Memory usage: ${used}MB / ${limit}MB`)
    
    // Warn if memory usage is high
    if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
      console.warn('⚠️ High memory usage detected!')
    }
  }, 30000) // Check every 30 seconds
}

// Web Vitals monitoring (simplified)
export const measureWebVitals = (): void => {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return
  
  // Simple performance measurement
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log(`📊 ${entry.name}:`, entry.duration || entry.value)
    })
  })
  
  try {
    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
  } catch (e) {
    console.log('Performance Observer not supported')
  }
}