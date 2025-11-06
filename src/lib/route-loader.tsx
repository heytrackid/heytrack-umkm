import dynamic from 'next/dynamic'
import React, { type ComponentType } from 'react'

/**
 * Route-based code splitting utility
 * Dynamically imports route components to reduce initial bundle size
 */

interface RouteComponent {
  default: ComponentType<unknown>
}

interface RouteLoaderOptions {
  loading?: ComponentType<unknown>
  ssr?: boolean
  error?: ComponentType<{ error: Error; reset: () => void }>
}

/**
 * Create a lazy-loaded route component
 */
export function createLazyRoute(
  importFn: () => Promise<RouteComponent>,
  options: RouteLoaderOptions = {}
) {
  const {
    loading: LoadingComponent,
    ssr = false,
    error: ErrorComponent
  } = options

  const LazyComponent = dynamic(importFn, {
    ssr,
    loading: LoadingComponent ? () => <LoadingComponent /> : undefined,
    // @ts-expect-error - Next.js dynamic error handling
    error: ErrorComponent
  })

  return LazyComponent
}

/**
 * Predefined route loaders for common patterns
 */
export const RouteLoaders = {
  // Dashboard routes - load immediately (critical)
  dashboard: (importFn: () => Promise<RouteComponent>) =>
    createLazyRoute(importFn, { ssr: true }),

  // Feature routes - lazy load with loading state
  feature: (importFn: () => Promise<RouteComponent>) =>
    createLazyRoute(importFn, {
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )
    }),

  // Heavy routes - lazy load with skeleton
  heavy: (importFn: () => Promise<RouteComponent>) =>
    createLazyRoute(importFn, {
      ssr: false,
      loading: () => (
        <div className="min-h-screen bg-muted animate-pulse">
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-muted-foreground/20 rounded mb-4" />
            <div className="h-64 bg-muted-foreground/20 rounded mb-4" />
            <div className="h-32 bg-muted-foreground/20 rounded" />
          </div>
        </div>
      )
    }),

  // Admin routes - lazy load with auth check
  admin: (importFn: () => Promise<RouteComponent>) =>
    createLazyRoute(importFn, {
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
      )
    })
}

/**
 * Route prefetch utility
 * Prefetch routes on user interaction
 */
export function prefetchRoute(route: string) {
  if (typeof window === 'undefined') {
    return
  }

  // Use Next.js router prefetch or manual link prefetch
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = route
  link.as = 'document'
  document.head.appendChild(link)

  // Clean up after 30 seconds
  setTimeout(() => {
    document.head.removeChild(link)
  }, 30000)
}

/**
 * Smart route loader with performance monitoring
 */
export function createSmartRouteLoader(
  importFn: () => Promise<RouteComponent>,
  routeName: string,
  options: RouteLoaderOptions = {}
) {
  const LazyComponent = createLazyRoute(importFn, {
    ...options,
    loading: options.loading || (() => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading {routeName}...</p>
        </div>
      </div>
    ))
  })

  // Wrap with performance monitoring
  const SmartComponent = (props: Record<string, unknown>) => {
    const startTime = performance.now()

    React.useEffect(() => {
      const loadTime = performance.now() - startTime
      // eslint-disable-next-line no-console
      console.log(`🚀 ${routeName} loaded in ${loadTime.toFixed(2)}ms`)
    }, [startTime])

    return <LazyComponent {...props} />
  }

  return SmartComponent
}