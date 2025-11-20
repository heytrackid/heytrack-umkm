'use client'

import { lazy, Suspense, type ComponentProps, type ComponentType } from 'react'

import { CardSkeleton as SharedCardSkeleton, TableSkeleton as SharedTableSkeleton } from '@/components/ui/skeleton-loader'

// Loading skeletons for different components
export const TableSkeleton = (): JSX.Element => (
  <SharedTableSkeleton rows={6} columns={4} />
)

export const CardSkeleton = (): JSX.Element => (
  <SharedCardSkeleton rows={3} />
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
