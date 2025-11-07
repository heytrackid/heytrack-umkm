// Consolidated Performance Module
// Single source of truth for all performance monitoring utilities
import { createClientLogger } from '@/lib/client-logger'

// Utils - Avoid duplicate exports
export {
  PerformanceMonitor as PerformanceMonitoring,
  Cache,
  debounce,
  throttle,
  createInterval,
  createTimeout
} from './performance'

export {
  PerformanceMonitor as PerformanceTracker,
  performanceMonitor
} from './performance-monitoring'

export * from './performance-benchmarks'
export * from './user-flow-monitoring'

// Performance optimization utilities from lib/performance
export { VirtualScroll, useVirtualScroll } from '../../lib/performance/virtual-scroll'
export {
  withMemo,
  useMemoizedValue,
  useMemoizedCallback,
  shallowEqual,
  deepEqual,
  memoShallow,
  memoDeep
} from '../../lib/performance/memoization'
export {
  useDeferredLoad,
  useIdleCallback,
  DeferredContent,
  useUserIdle,
  useIdlePreload
} from '../../lib/performance/defer-script'
export {
  OptimizedImage,
  generateBlurDataURL,
  useLazyImage
} from '../../lib/performance/image-optimization'
export {
  useWebVitals,
  usePerformanceObserver,
  useLongTaskTracking,
  useResourceTiming,
  getPerformanceMetrics,
  PerformanceMonitor as WebVitalsMonitor
} from '../../lib/performance/web-vitals'
export {
  lazyImports,
  preloadCriticalResources,
  prefetchRoute,
  shouldLoadFeature,
  getOptimalImageQuality,
  deferNonCriticalScripts,
  removeUnusedCSS,
  optimizeThirdPartyScripts,
  monitorBundleSize
} from '../../lib/performance/bundle-optimization'

// Performance middleware
export const performanceMiddleware = (
  req: any,
  res: any,
  next?: () => void
) => {
  req.performanceStart = Date.now()

  if (next) {
    next()
  }

  res.on('finish', () => {
    const duration = Date.now() - (req.performanceStart ?? Date.now())
    const url = req.url ?? ''
    const method = req.method ?? 'GET'

    const logger = createClientLogger('API')
    if (duration > 500) {
      logger.warn(`Slow API request: ${method} ${url} took ${duration}ms`)
    } else {
      logger.debug(`API request: ${method} ${url} took ${duration}ms`)
    }
  })
}

export const withPerformanceMonitoring = <T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  const start = Date.now()
  return operation().finally(() => {
    const duration = Date.now() - start
    const logger = createClientLogger('Performance')
    logger.debug(`${operationName} took ${duration}ms`)
  })
}

export const withCache = async <T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> => {
  // Simple in-memory cache for demo
  const cache = new Map()
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached['timestamp'] < ttl) {
    return cached['data']
  }

  const data = await fetcher()
  cache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

// Hooks
// Note: These hooks should be imported from their specific files
// export * from './usePerformance' // This file should be in the hooks directory, not here