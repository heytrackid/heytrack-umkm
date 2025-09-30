'use client'

import { Suspense, ComponentType, lazy, ReactElement, useState, useEffect } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { LoadingSpinner } from '../data/LoadingSpinner'
import { Card, CardContent } from '../ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LazyWrapperProps {
  children: ReactElement
  fallback?: ReactElement
  errorFallback?: ReactElement
  name?: string
  minLoadingTime?: number
}

interface LazyComponentOptions {
  fallback?: ReactElement
  errorFallback?: ReactElement
  name?: string
  minLoadingTime?: number
  retryable?: boolean
}

/**
 * Enhanced LazyWrapper with error boundaries and loading states
 */
export function LazyWrapper({ 
  children, 
  fallback, 
  errorFallback,
  name = 'Component',
  minLoadingTime = 300 
}: LazyWrapperProps) {
  
  const defaultFallback = fallback || (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-3 text-muted-foreground">{"Placeholder"} {name}...</span>
        </div>
      </CardContent>
    </Card>
  )

  const defaultErrorFallback = errorFallback || (
    <Card className="border-destructive">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium text-destructive mb-2">
            {"Placeholder"} {name}
          </h3>
          <p className="text-muted-foreground mb-4">
            {"Placeholder"}
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {"Placeholder"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ErrorBoundary fallback={defaultErrorFallback}>
      <Suspense fallback={defaultFallback}>
        <DelayedWrapper minDelay={minLoadingTime}>
          {children}
        </DelayedWrapper>
      </Suspense>
    </ErrorBoundary>
  )
}

/**
 * Ensures minimum loading time to prevent flash of loading state
 */
function DelayedWrapper({ 
  children, 
  minDelay 
}: { 
  children: ReactElement
  minDelay: number 
}) {
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), minDelay)
    return () => clearTimeout
  }, [minDelay])
  
  return isReady ? children : null
}

/**
 * Creates a lazy component with enhanced loading and error handling
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): T {
  const LazyComponent = lazy(importFn)
  
  const WrappedComponent = (props: Parameters<T>[0]) => (
    <LazyWrapper {...options}>
      <LazyComponent {...props} />
    </LazyWrapper>
  ) as T
  
  // Preserve component name for debugging
  WrappedComponent.displayName = `Lazy(${options.name || 'Component'})`
  
  return WrappedComponent
}

/**
 * Preload a lazy component for better UX
 */
export function preloadComponen"" => Promise<{ default: any }>) {
  // Start loading the component but don't wait for it
  importFn().catch(console.error)
}

/**
 * Hook for progressive component loading
 */
export function useProgressiveLoading(
  components: (() => Promise<{ default: any }>)[],
  delay = 100
) {
  const [loadedCount, setLoadedCount] = useState(0)
  
  useEffect(() => {
    components.forEach((importFn, index) => {
      setTimeout(() => {
        importFn().then(() => {
          setLoadedCoun""
        }).catch(console.error)
      }, delay * index)
    })
  }, [components, delay])
  
  return {
    loadedCount,
    totalCount: components.length,
    progress: Math.round((loadedCount / components.length) * 100)
  }
}

// Enhanced loading skeletons for different component types
export const ComponentSkeletons = {
  Card: () => (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </CardContent>
    </Card>
  ),
  
  Chart: ({ height = 400 }: { height?: number }) => (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-muted rounded w-32"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
          <div className={`bg-muted rounded`} style={{ height }}>
            <div className="flex items-end justify-center h-full space-x-2 p-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-muted-foreground/20 rounded-t"
                  style={{ 
                    height: `${Math.random() * 80 + 20}%`,
                    width: '20px' 
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  
  Table: ({ rows = 5 }: { rows?: number }) => (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded flex-1"></div>
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 bg-muted/60 rounded flex-1"></div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ),
  
  Dashboard: () => (
    <div className="space-y-6 animate-pulse">
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main content */}
      <div className="grid gap-6 md:grid-cols-2">
        <ComponentSkeletons.Chart />
        <ComponentSkeletons.Table />
      </div>
    </div>
  )
}

