'use client'

import dynamic from 'next/dynamic'
import React, { type ComponentType } from 'react'

import { LoadingState } from '@/components/ui/loading-state'
import { createClientLogger } from '@/lib/client-logger'

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
      loading: () => <LoadingState size="md" />
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
      loading: () => <LoadingState message="Loading admin panel..." size="md" />
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
    loading: options.loading ?? (() => <LoadingState message={`Loading ${routeName}...`} size="sm" />)
  })

  // Wrap with performance monitoring
  const SmartComponent = (props: Record<string, unknown>) => {
    const startTimeRef = React.useRef<number>(0)

    React.useEffect(() => {
      // Initialize start time when component mounts
      startTimeRef.current = performance.now()
    }, [])

    React.useEffect(() => {
      const loadTime = performance.now() - startTimeRef.current
      const logger = createClientLogger('RouteLoader')
      logger.info({ routeName, loadTime }, 'Route loaded')
    }, [])

    return <LazyComponent {...props} />
  }

  return SmartComponent
}