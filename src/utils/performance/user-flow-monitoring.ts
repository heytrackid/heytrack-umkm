import { performanceMonitor } from '@/utils/performance/performance-monitoring'
import { createClientLogger } from '@/lib/client-logger'
import { useEffect, useRef, useState, useCallback, createElement } from 'react'

const perfLogger = createClientLogger('UserFlowMonitoring')

/**
 * Performance monitoring wrapper for critical user flows
 * Tracks key user interactions and identifies performance bottlenecks
 */

interface FlowOptions {
  timeout?: number // Timeout in ms after which to log slow flows
  errorOnTimeout?: boolean // Whether to throw an error on timeout
  enabled?: boolean // Whether to enable monitoring
}

/**
 * Monitor a critical user flow
 */
export const monitorUserFlow = async <T>(
  flowName: string,
  flowFn: () => Promise<T>,
  options: FlowOptions = {}
): Promise<T> => {
  const { timeout = 5000, errorOnTimeout: _errorOnTimeout = false, enabled = true } = options

  if (!enabled) {
    return flowFn()
  }

  const operationId = `${flowName}-${Date.now()}`

  performanceMonitor.startOperation(operationId)
  
  const startTime = performance.now()
  perfLogger.info({ flow: flowName }, 'User flow started')

  try {
    // Set up timeout monitoring
    let timeoutId: NodeJS.Timeout | null = null
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        const elapsed = performance.now() - startTime
        perfLogger.warn({
          flow: flowName,
          elapsed: elapsed.toFixed(2)
        }, 'User flow taking longer than expected')
      }, timeout)
    }

    // Execute the flow
    const result = await flowFn()

    // Clear timeout if still active
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const duration = performanceMonitor.endOperation(operationId, { flow: flowName })
    
    if (duration) {
      perfLogger.info({
        flow: flowName,
        duration: duration.toFixed(2)
      }, 'User flow completed')
    }

    return result
  } catch (error) {
    // End operation on error
    performanceMonitor.endOperation(operationId, { 
      flow: flowName, 
      error: (error as Error).message 
    })

    const duration = performance.now() - startTime
    perfLogger.error({
      flow: flowName,
      duration: duration.toFixed(2),
      error: (error as Error).message
    }, 'User flow failed')
    
    throw error
  }
}

/**
 * Monitor form submissions
 */
export const monitorFormSubmission = <T>(
  formName: string,
  submitFn: () => Promise<T>
): Promise<T> => monitorUserFlow(
    `form:${formName}`,
    submitFn,
    { timeout: 10000 } // 10s timeout for form submissions
  )

/**
 * Monitor API calls related to user actions
 */
export const monitorApiCall = <T>(
  endpoint: string,
  apiFn: () => Promise<T>
): Promise<T> => monitorUserFlow(
    `api:${endpoint}`,
    apiFn,
    { timeout: 5000 } // 5s timeout for API calls
  )

/**
 * Monitor navigation transitions
 */
export const monitorNavigation = (
  to: string,
  navigateFn: () => Promise<void>
): Promise<void> => monitorUserFlow(
    `navigation:${to}`,
    navigateFn,
    { timeout: 3000 } // 3s timeout for navigation
  )

/**
 * Monitor data loading operations
 */
export const monitorDataLoad = <T>(
  dataType: string,
  loadFn: () => Promise<T>
): Promise<T> => monitorUserFlow(
    `data:${dataType}`,
    loadFn,
    { timeout: 8000 } // 8s timeout for data loading
  )

/**
 * Performance tracking HOC for React components
 */
export const withPerformanceTracking = <P extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> => {
  const TrackedComponent = (props: P) => {
    const startTime = useRef(performance.now())
    const [renderTime, setRenderTime] = useState<number | null>(null)
    const [interactionCount, setInteractionCount] = useState(0)

    // Track component mount and render time
    useEffect(() => {
      const mountStartTime = startTime.current
      const mountTime = performance.now() - mountStartTime
      setRenderTime(mountTime)

      perfLogger.debug({
        component: componentName,
        renderTime: mountTime.toFixed(2)
      }, 'Component mounted')

      return () => {
        perfLogger.debug({
          component: componentName,
          interactionCount,
          totalTime: performance.now() - mountStartTime
        }, 'Component unmounted')
      }
    }, [interactionCount])

    // Track user interactions
    const trackInteraction = useCallback((interactionType: string) => {
      setInteractionCount(prev => prev + 1)

      perfLogger.debug({
        component: componentName,
        interaction: interactionType,
        interactionCount: interactionCount + 1
      }, 'User interaction tracked')
    }, [interactionCount])

    // Add interaction tracking to props
    const trackedProps = {
      ...props,
      trackInteraction,
      performanceMetrics: {
        renderTime,
        interactionCount
      }
    } as P

    return createElement(WrappedComponent, trackedProps)
  }

  return TrackedComponent
}

/**
 * Track specific user interactions
 */
export const trackUserInteraction = (
  interactionType: string,
  elementName: string,
  additionalData?: Record<string, unknown>
) => {
  const interactionId = `${interactionType}:${elementName}:${Date.now()}`
  
  performanceMonitor.startOperation(interactionId)
  
  perfLogger.info({
    interactionType,
    element: elementName,
    ...additionalData
  }, 'User interaction started')

  // Return a function to end tracking
  return () => {
    const duration = performanceMonitor.endOperation(interactionId, {
      interactionType,
      element: elementName
    })

    perfLogger.info({
      interactionType,
      element: elementName,
      duration: duration?.toFixed(2) ?? 'unknown'
    }, 'User interaction completed')
  }
}

/**
 * Performance monitoring hook for components
 */
export const useComponentPerformance = (_componentName: string) => {
  const [performanceData, setPerformanceData] = useState({
    componentName: _componentName,
    renderCount: 0,
    avgRenderTime: 0,
    totalRenderTime: 0,
    interactionCount: 0
  })

  useEffect(() => {
    setPerformanceData(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1
    }))
  }, [])

  const trackRender = (renderTime: number) => {
    setPerformanceData(prev => {
      const newTotal = prev.totalRenderTime + renderTime
      const newCount = prev.renderCount + 1
      return {
        ...prev,
        totalRenderTime: newTotal,
        avgRenderTime: newTotal / newCount
      }
    })
  }

  const trackInteraction = () => {
    setPerformanceData(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1
    }))
  }

  return {
    performanceData,
    trackRender,
    trackInteraction
  }
}

/**
 * Performance monitoring for complex workflows
 */
export const createWorkflowMonitor = (workflowName: string) => {
  const steps: Array<{ name: string; duration?: number; error?: string }> = []
  
  return {
    startStep: (stepName: string) => {
      const stepId = `${workflowName}:${stepName}:${Date.now()}`
      performanceMonitor.startOperation(stepId)
      
      perfLogger.debug({
        workflow: workflowName,
        step: stepName
      }, 'Workflow step started')
      
      return {
        complete: () => {
          const duration = performanceMonitor.endOperation(stepId, {
            workflow: workflowName,
            step: stepName
          })
          
          if (duration) {
            steps.push({ name: stepName, duration })
            perfLogger.debug({
              workflow: workflowName,
              step: stepName,
              duration: duration.toFixed(2)
            }, 'Workflow step completed')
          }
        },
        error: (error: Error) => {
          performanceMonitor.endOperation(stepId, {
            workflow: workflowName,
            step: stepName,
            error: error.message
          })
          
          steps.push({ name: stepName, error: error.message })
          perfLogger.error({
            workflow: workflowName,
            step: stepName,
            error: error.message
          }, 'Workflow step failed')
        }
      }
    },
    
    getMetrics: () => {
      const totalDuration = steps.reduce((sum, step) => sum + (step.duration ?? 0), 0)
      const errorCount = steps.filter(step => step.error).length
      const completedCount = steps.filter(step => step.duration).length
      
      return {
        workflow: workflowName,
        steps,
        totalDuration,
        errorCount,
        completedCount,
        successRate: completedCount / steps.length || 0
      }
    }
  }
}