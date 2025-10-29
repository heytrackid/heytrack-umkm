'use client'

import { type ReactNode, type ComponentType, lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Route-based Lazy Loading Helper
 * Provides consistent loading states for route components
 */

interface RouteLoaderProps<TProps = Record<string, unknown>> {
  loader: () => Promise<{ default: ComponentType<TProps> }>
  fallback?: ReactNode
  props?: TProps
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
export function createLazyRoute<TProps extends Record<string, any> = Record<string, unknown>>(
  loader: () => Promise<{ default: ComponentType<TProps> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(loader)

  return function LazyRoute(props: TProps) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    )
  }
}

export default RouteLoader