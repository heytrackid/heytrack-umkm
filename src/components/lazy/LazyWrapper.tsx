'use client'

import { Suspense, lazy, ComponentType } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

// Loading skeletons for different components
export const TableSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
  </div>
)

export const CardSkeleton = () => (
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

export const ChartSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Generic lazy wrapper with customizable loading
interface LazyWrapperProps {
  component: ComponentType<any>
  loadingComponent?: ComponentType
  props?: any
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
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingComponent?: ComponentType
) => {
  const LazyComponent = lazy(importFunc)
  
  return (props: any) => (
    <LazyWrapper 
      component={LazyComponent} 
      loadingComponent={loadingComponent}
      props={props} 
    />
  )
}