'use client'

'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Suspense, lazy, Component, type ComponentType, type ReactNode, useEffect, type FC } from 'react'

import { uiLogger } from '@/lib/logger'

/**
 * Lazy Wrapper Component
 * Provides consistent lazy loading with skeletons and error boundaries
 */


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
  const router = useRouter()
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
          onClick={() => router.refresh()}
        >
          Reload page
        </button>
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={errorFallback ?? defaultErrorFallback}>
      <Suspense fallback={fallback ?? defaultFallback}>
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

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    uiLogger.error({ error, errorInfo }, 'Lazy loading error:')
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

// Utility function to create lazy components with consistent patterns
export function createLazyComponent(
  importFunc: () => Promise<{ default: ComponentType<Record<string, unknown>> }>,
  fallback?: ReactNode
): ComponentType<Record<string, unknown>> {
  const LazyComponent = lazy(importFunc)

  const WrappedComponent: FC<Record<string, unknown>> = (props) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  )

  WrappedComponent.displayName = 'LazyComponent'

  return WrappedComponent
}

// Preload utility for critical components
export function preloadComponent<T = Record<string, unknown>>(importFunc: () => Promise<{ default: ComponentType<T> }>) {
  // Note: Actual implementation would need dynamic import URL resolution
  // For now, we just type the function properly
  // The actual preload would need the resolved module URL
  const modulePromise = importFunc();
  return modulePromise;
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
      interface WindowWithGtag extends Window {
        gtag?: (event: string, action: string, params: Record<string, unknown>) => void
      }

      const win = window as WindowWithGtag
      if (typeof window !== 'undefined' && win.gtag) {
        win.gtag('event', 'component_load_time', {
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
    const navigation = performance.getEntriesByType('navigation')[0]

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
        if (lastEntry) {
          uiLogger.info({ lcp: `${lastEntry.startTime.toFixed(0)}ms` }, 'LCP:')
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })

      return () => observer.disconnect()
    }
  }

  return null
}
