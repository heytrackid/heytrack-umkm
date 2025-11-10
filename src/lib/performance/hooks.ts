'use client'

import { useEffect, useRef, useState } from 'react'

import { createClientLogger } from '@/lib/client-logger'

import { performanceMonitor } from '@/lib/performance/performance-monitoring'

// Performance monitoring hooks for React components with enhanced memory leak prevention

const perfLogger = createClientLogger('Performance')

// Hook to measure component render performance with memory leak detection
export const useRenderPerformance = (componentName: string) => {
  const renderStartRef = useRef<number | null>(null)
  const mountedRef = useRef(true)
  const renderCountRef = useRef(0)
  const [renderCount, setRenderCount] = useState(0)

  useEffect(() => {
    mountedRef.current = true
    renderCountRef.current += 1
    setRenderCount(renderCountRef.current)

    // Measure initial render
    renderStartRef.current = performance.now()

    // Log when component mounts
    perfLogger.debug({ componentName, renderCount: 1 }, 'Component mounted')

    return () => {
      mountedRef.current = false

      // Component unmount cleanup
      perfLogger.debug({ componentName, renderCount: renderCountRef.current }, 'Component unmounted')

      // Clean up any pending operations
      if (renderStartRef.current !== null) {
        const duration = performance.now() - renderStartRef.current
        perfLogger.warn({
          componentName,
          duration: duration.toFixed(2),
          renderCount: renderCountRef.current
        }, 'Pending render operation cleaned up')
        renderStartRef.current = null
      }
    }
  }, [componentName])

  // Note: Removed per-render measurement to prevent infinite loops
  // If needed, implement with useLayoutEffect or different approach
  
  // Return render count for optimization decisions
  return { renderCount }
}

// Hook to measure function execution performance with enhanced tracking
export const useFunctionPerformance = (context?: Record<string, unknown>) => {
  const mountedRef = useRef(true)

  useEffect(() => () => {
      mountedRef.current = false
    }, [])

  const measure = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    if (!mountedRef.current) {return fn()} // Execute function directly if component is unmounted
    
    const operationId = `${name}-${Date.now()}`
    performanceMonitor.startOperation(operationId)
    
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      
      performanceMonitor.endOperation(operationId, {
        ...context,
        duration: duration.toFixed(2)
      })
      
      if (duration > 100) {
        perfLogger.warn({
          name,
          duration: duration.toFixed(2),
          ...context
        }, 'Slow function execution detected')
      } else {
        perfLogger.debug({
          name,
          duration: duration.toFixed(2),
          ...context
        }, 'Function executed')
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      
      performanceMonitor.endOperation(operationId, {
        ...context,
        duration: duration.toFixed(2),
        error: (error as Error).message
      })

      perfLogger.error({
        name,
        duration: duration.toFixed(2),
        ...context,
        error
      }, 'Function execution failed')
      throw error
    }
  }

  return { measure }
}

// Hook to track expensive renders and memoize components with memory leak prevention
export const useExpensiveRender = (
  dependencies: unknown[], 
  thresholdMs = 5
) => {
  const prevDepsRef = useRef<unknown[]>([])
  const renderStartRef = useRef<number>(0)
  const [totalRenderTime, setTotalRenderTime] = useState(0)
  const totalRenderTimeRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => () => {
      mountedRef.current = false
    }, [])

  useEffect(() => {
    if (!mountedRef.current) {return}
    
    renderStartRef.current = performance.now()
    
    // Check if dependencies changed compared to previous render
    const depsChanged = dependencies.some((dep, index) => 
      dep !== prevDepsRef.current[index]
    )
    
    prevDepsRef.current = [...dependencies]
    
    if (depsChanged) {
      const renderTime = performance.now() - renderStartRef.current
      
      // Update total render time
      setTotalRenderTime(prev => {
        const newTotal = prev + renderTime
        totalRenderTimeRef.current = newTotal

        if (renderTime > thresholdMs) {
          perfLogger.warn({
            renderTime: renderTime.toFixed(2),
            dependenciesCount: dependencies.length,
            totalRenderTime: newTotal
          }, 'Expensive render with dependencies change')
        }

        return newTotal
      })
    }
  }, [dependencies, thresholdMs])

  return { totalRenderTime }
}
