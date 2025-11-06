// Consolidated Performance Module
// Single source of truth for all performance monitoring utilities

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

// Hooks
// Note: These hooks should be imported from their specific files
// export * from './usePerformance' // This file should be in the hooks directory, not here