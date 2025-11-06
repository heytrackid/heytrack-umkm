// Performance monitoring and optimization utilities for HeyTrack

import { apiLogger } from '@/lib/logger'
// Removed import as performanceMonitor is not used in this file

// Performance monitoring utility with enhanced memory leak detection
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private measurements: Map<string, { start: number; end?: number; active: boolean }> = new Map()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  start(label: string): void {
    // Clean up any previously active measurements with the same label to prevent memory leaks
    if (this.measurements.has(label)) {
      const existing = this.measurements.get(label)
      if (existing?.active) {
        apiLogger.warn({ label }, 'Previous measurement was not properly ended, cleaning up')
      }
    }
    this.measurements.set(label, { start: performance.now(), active: true })
  }

  end(label: string): number | null {
    const measurement = this.measurements.get(label)
    if (!measurement?.active) {
      return null
    }

    const duration = performance.now() - measurement.start
    // Mark as inactive instead of deleting immediately to track completion
    this.measurements.set(label, { ...measurement, active: false })

    // Log slow operations
    if (duration > 100) {
      apiLogger.warn({ duration, label }, 'Slow operation detected')
    }

    // Clean up completed measurements after a short delay to prevent memory leaks
    setTimeout(() => {
      this.measurements.delete(label)
    }, 1000) // Clean up after 1 second to allow for any post-processing

    return duration
  }

  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label)
    try {
      const result = await fn()
      const duration = this.end(label)
      if (duration) {
        apiLogger.debug({ duration, label }, 'Operation completed')
      }
      return result
    } catch (error) {
      this.end(label)
      throw error
    }
  }

  /**
   * Clean up any remaining active measurements to prevent memory leaks
   */
  cleanup(): void {
    for (const [label, measurement] of this.measurements.entries()) {
      if (measurement.active) {
        apiLogger.warn({ label }, 'Cleaning up active measurement during general cleanup')
        this.measurements.delete(label)
      }
    }
  }
}

// Cache utility with TTL and memory leak prevention
export class Cache {
  private static instance: Cache
  private cache: Map<string, { data: unknown; expiry: number; size?: number }> = new Map()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes
  private maxSize = 100 // Maximum number of items to prevent memory bloat

  private constructor() {
    // Set up regular cleanup to prevent memory leaks
    setInterval(() => {
      this.cleanup()
    }, 60000) // Cleanup every minute
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache()
    }
    return Cache.instance
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // If cache is at max size, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    const expiry = Date.now() + (ttl ?? this.defaultTTL)
    // Calculate approximate size for memory management
    let size = 0
    try {
      size = JSON.stringify(data).length
    } catch (_e) {
      // If serialization fails, set a default size
      size = 100
    }
    
    this.cache.set(key, { data, expiry, size })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) {
      return null
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    // Refresh expiry time on access (LRU-like behavior)
    const newExpiry = Date.now() + this.defaultTTL
    this.cache.set(key, { ...item, expiry: newExpiry })
    
    return item.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired items and prevent memory bloat
  cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key)
    }

    // Log cache size for monitoring
    if (this.cache.size > this.maxSize * 0.8) { // 80% of max size
      apiLogger.warn({
        cacheSize: this.cache.size,
        maxSize: this.maxSize
      }, 'Cache approaching maximum size')
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): { size: number; maxSize: number; estimatedMemory: number } {
    let estimatedMemory = 0
    for (const item of this.cache.values()) {
      estimatedMemory += item.size ?? 0
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      estimatedMemory
    }
  }
}

// Enhanced debounce utility with cancellation support to prevent memory leaks
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): { (...args: Parameters<T>): void; cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null
  
  const debouncedFunc: ((...args: Parameters<T>) => void) & { cancel: () => void } = ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }) as ((...args: Parameters<T>) => void) & { cancel: () => void }
  
  debouncedFunc.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }
  
  return debouncedFunc
}

// Enhanced throttle utility with cancellation support
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): { (...args: Parameters<T>): void; cancel: () => void } {
  let inThrottle: boolean
  let timeout: NodeJS.Timeout | null = null
  
  const throttledFunc: ((...args: Parameters<T>) => void) & { cancel: () => void } = ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      timeout = setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }) as ((...args: Parameters<T>) => void) & { cancel: () => void }
  
  throttledFunc.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
      inThrottle = false
    }
  }
  
  return throttledFunc
}

// Interval utility with automatic cleanup to prevent memory leaks
export function createInterval(fn: () => void, delay: number) {
  const intervalId = setInterval(fn, delay)
  
  return {
    id: intervalId,
    clear: () => clearInterval(intervalId)
  }
}

// Timeout utility with automatic cleanup
export function createTimeout(fn: () => void, delay: number) {
  const timeoutId = setTimeout(fn, delay)
  
  return {
    id: timeoutId,
    clear: () => clearTimeout(timeoutId)
  }
}