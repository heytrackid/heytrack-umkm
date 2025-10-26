'use client'

import * as React from 'react'
import type { ComponentType } from 'react';
import { lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Route-based Lazy Loading Helper
 * Provides consistent loading states for route components
 */

interface RouteLoaderProps<T = Record<string, unknown>> {
  loader: () => Promise<{ default: ComponentType<T> }>
  fallback?: React.ReactNode
  props?: T
}

const DefaultFallback = () => {
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            <span className="text-lg text-muted-foreground">Informasi</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Lazy load route component with fallback
 */
export function RouteLoader<T = Record<string, unknown>>({ loader, fallback, props }: RouteLoaderProps<T>) {
  const Component = lazy(loader) as any as ComponentType<T>
  
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <Component {...props} />
    </Suspense>
  )
}

/**
 * Create lazy route component
 */
export function createLazyRoute<T extends Record<string, unknown>>(
  loader: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(loader)
  
  return function LazyRoute<P extends Record<string, unknown>>(props: P) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    )
  }
}

export default RouteLoader