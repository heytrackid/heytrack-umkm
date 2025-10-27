/**
 * Lazy Wrapper Component
 * Provides consistent lazy loading with skeletons and error boundaries
 */

import { Suspense, lazy, Component, type ComponentType, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { uiLogger } from '@/lib/logger'

// Lazy loading wrapper with consistent loading states
export const LazyWrapper = ({
  children,
  fallback,
  errorFallback
}: {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ReactNode
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )

  const defaultErrorFallback = (
    <div className="flex items-center justify-center p-8 text-destructive">
      <div className="text-center">
        <p className="text-sm">Failed to load component</p>
        <button
          className="text-xs underline mt-2"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={errorFallback || defaultErrorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Error boundary for lazy loaded components
class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    uiLogger.error({ error, errorInfo }, 'Lazy loading error:')
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

// Utility function to create lazy components with consistent patterns
export function createLazyComponent(
  importFunc: () => Promise<{ default: ComponentType<any> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFunc)

  return (props: any) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  )
}

// Preload utility for critical components
export function preloadComponent(importFunc: () => Promise<any>) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'script'
  link.href = '' // This would need to be implemented based on the import
  document.head.appendChild(link)
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const loadTime = endTime - startTime

      // Log component load time
      uiLogger.info({ componentName, loadTime }, `${componentName} loaded in ${loadTime.toFixed(2)}ms`)

      // Could send to analytics service
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ; (window as any).gtag('event', 'component_load_time', {
          component_name: componentName,
          load_time: loadTime,
          page_path: window.location.pathname
        })
      }
    }
  }, [componentName])
}

// Bundle size monitoring utility
export function logBundleSize() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart

      uiLogger.info({
        performanceData: {
          totalLoadTime: `${loadTime.toFixed(0)}ms`,
          domContentLoaded: `${domContentLoaded.toFixed(0)}ms`,
          timestamp: new Date().toISOString()
        }
      }, 'Page Load Performance:')
    }

    // Monitor largest contentful paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]

        uiLogger.info({ lcp: `${lastEntry.startTime.toFixed(0)}ms` }, 'LCP:')
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })

      return () => observer.disconnect()
    }
  }
}
