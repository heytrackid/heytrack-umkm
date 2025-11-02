

/**
 * Performance Optimization Utilities
 * 
 * Centralized exports for all performance-related utilities
 */

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
  PerformanceMonitor
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
