'use client'

import { lazy, Suspense, type ComponentProps, type ComponentType } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Loading skeletons for different components
export const TableSkeleton = (): JSX.Element => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
  </div>
)

export const CardSkeleton = (): JSX.Element => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
)



// Generic lazy wrapper with customizable loading
interface LazyWrapperProps {
  component: ComponentType<unknown>
  loadingComponent?: ComponentType
  props?: Record<string, unknown>
}

export const LazyWrapper = ({
  component: Component,
  loadingComponent: LoadingComponent = TableSkeleton,
  props = {}
}: LazyWrapperProps) => (
  <Suspense fallback={<LoadingComponent />}>
    <Component {...props} />
  </Suspense>
)

// Helper function to create lazy components
export const createLazyComponent = <T extends ComponentType<Record<string, unknown>>>(
  importFunc: () => Promise<{ default: T }>,
  loadingComponent?: ComponentType
) => {
  const LazyComponent = lazy(importFunc)

  const LazyComponentWrapper = (props: ComponentProps<T>) => (
    <LazyWrapper
      component={LazyComponent as ComponentType<unknown>}
      {...(loadingComponent && { loadingComponent })}
      props={props}
    />
  )

  LazyComponentWrapper.displayName = 'LazyComponentWrapper'

  LazyComponentWrapper.displayName = 'LazyComponentWrapper'

  return LazyComponentWrapper
}
