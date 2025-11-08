

/**
 * Performance Optimization Utilities
 * 
 * Centralized exports for all performance-related utilities
 */

export * from './core'
export * from './advanced'
export * from './monitoring'
export * from './operation-monitor'
export * from './performance-monitoring'
export * from './user-flows'
export * from './hooks'
export * from './use-performance-monitoring'

// Virtual scrolling
export { VirtualScroll, useVirtualScroll } from './virtual-scroll'

// Memoization
export {
  withMemo,
  useMemoizedValue,
  useMemoizedCallback,
  shallowEqual,
  deepEqual,
  memoShallow,
  memoDeep
} from './memoization'

// Deferred loading
export {
  useDeferredLoad,
  useIdleCallback,
  DeferredContent,
  useUserIdle,
  useIdlePreload
} from './defer-script'

// Image optimization
export {
  OptimizedImage,
  generateBlurDataURL,
  useLazyImage
} from './image-optimization'

// Web vitals
export {
  useWebVitals,
  usePerformanceObserver,
  useLongTaskTracking,
  useResourceTiming,
  getPerformanceMetrics,
  PerformanceMonitor as WebVitalsPerformanceMonitor
} from './web-vitals'

// Bundle optimization
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
} from './bundle-optimization'
