import { useState, useEffect, useCallback, useRef } from 'react'

import { createClientLogger } from '@/lib/client-logger'
import { performanceMonitor } from '@/utils/performance/performance-monitoring'

const perfLogger = createClientLogger('PerformanceHook')

/**
 * Custom hook for performance monitoring with memory leak prevention
 */
export const usePerformanceMonitoring = (componentName: string) => {
  const [isMonitoring] = useState(false)
  const mountedRef = useRef(false)
  const cleanupFunctions = useRef<Array<() => void>>([])

  // Track component mount and unmount for performance analysis
  useEffect(() => {
    mountedRef.current = true
    
    // Start monitoring for this component
    const operationId = `${componentName}-mount`
    performanceMonitor.startOperation(operationId)
    
    perfLogger.debug({ componentName }, 'Component mounted')
    
    // Cleanup function
    return () => {
      mountedRef.current = false
      
      // Execute all cleanup functions
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup()
        } catch (error) {
          perfLogger.error({ error, componentName }, 'Error during cleanup')
        }
      })
      cleanupFunctions.current = []
      
      // End mount operation if still active
      performanceMonitor.endOperation(operationId, { stage: 'unmount' })
      
      perfLogger.debug({ componentName }, 'Component unmounted')
    }
  }, [componentName])

  // Start performance monitoring
  const start = useCallback((operation: string) => {
    if (!mountedRef.current) {return}
    performanceMonitor.startOperation(`${componentName}-${operation}`)
  }, [componentName])

  // End performance monitoring
  const end = useCallback((operation: string, context?: Record<string, unknown>) => {
    if (!mountedRef.current) {return null}
    return performanceMonitor.endOperation(`${componentName}-${operation}`, context)
  }, [componentName])

  // Measure async operations
  const measure = useCallback(<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> => {
    if (!mountedRef.current) {return fn()}
    return performanceMonitor.measure(`${componentName}-${operation}`, fn, context)
  }, [componentName])

  // Register a cleanup function to prevent memory leaks
  const registerCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctions.current.push(cleanupFn)
  }, [])

  // Check if component is still mounted (useful for async operations)
  const isMounted = useCallback(() => mountedRef.current, [])

  return {
    start,
    end,
    measure,
    registerCleanup,
    isMounted,
    performanceMonitor,
    isMonitoring
  }
}

/**
 * Custom hook for optimized rendering with performance tracking
 */
export const useOptimizedRender = (dependencies: unknown[], componentName: string) => {
  const renderCount = useRef(0)
  const prevDeps = useRef<unknown[]>([])
  const startTime = useRef<number>(0)

  useEffect(() => {
    renderCount.current += 1
    startTime.current = performance.now()
    
    // Check if dependencies actually changed
    const depsChanged = dependencies.some((dep, index) => 
      dep !== prevDeps.current[index]
    )
    
    // Track expensive renders
    const renderTime = performance.now() - startTime.current
    if (renderTime > 16.67) { // More than one frame at 60fps
      perfLogger.warn({
        componentName,
        renderTime: renderTime.toFixed(2),
        renderCount: renderCount.current,
        depsChanged
      }, 'Expensive render detected')
    }
    
    prevDeps.current = [...dependencies]
  })

  return { renderCount: renderCount.current }
}

/**
 * Custom hook for memory usage tracking in components
 */
export const useMemoryMonitoring = (componentName: string, intervalMs = 10000) => {
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number | null
    total: number | null
    limit: number | null
  } | null>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const updateMemory = () => {
        try {
          const {memory} = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } })
          if (memory) {
            setMemoryUsage({
              used: memory.usedJSHeapSize,
              total: memory.totalJSHeapSize,
              limit: memory.jsHeapSizeLimit
            })
          }
        } catch (error) {
          perfLogger.warn({ error, componentName }, 'Could not access memory info')
        }
      }

      // Update memory immediately
      updateMemory()

      // Update memory periodically
      const interval = setInterval(updateMemory, intervalMs)
      
      return () => clearInterval(interval)
    }
    
    // Return empty cleanup function if condition isn't met
    return () => {};
  }, [componentName, intervalMs])
  
  return { memoryUsage }
}

/**
 * Custom hook for debounced callbacks with automatic cleanup
 */
export const useDebounce = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  // Cleanup timeout on unmount
  useEffect(() => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }, [])
  
  return useCallback(((...args: Parameters<T>): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay)
  }) as T, [delay])
}