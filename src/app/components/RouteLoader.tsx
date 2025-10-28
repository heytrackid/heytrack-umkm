'use client'

import { type ReactNode, type ComponentType, lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Route-based Lazy Loading Helper
 * Provides consistent loading states for route components
 */

interface RouteLoaderProps {
  loader: () => Promise<{ default: ComponentType<any> }>
  fallback?: ReactNode
  props?: Record<string, any>
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Card className="w-full max-w-md">
      <CardContent className="p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
          <span className="text-lg text-muted-foreground">Informasi</span>
        </div>
      </CardContent>
    </Card>
  </div>
)

/**
 * Lazy load route component with fallback
 */
export function RouteLoader({ loader, fallback, props }: RouteLoaderProps) {
  const Component = lazy(loader)

  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <Component {...props} />
    </Suspense>
  )
}

/**
 * Create lazy route component
 */
export function createLazyRoute(
  loader: () => Promise<{ default: ComponentType<any> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(loader)

  return function LazyRoute(props: Record<string, any>) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

export default RouteLoader