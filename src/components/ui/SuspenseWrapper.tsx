'use client'

import { Suspense, lazy, useEffect, type ComponentType, type ReactNode } from 'react'

import { globalLazyLoadingUtils } from '@/components/lazy/index'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import {
  DataTableSkeleton,
  ChartSkeleton,
  DashboardCardSkeleton,
  AvatarSkeleton
} from '@/components/ui/skeletons'


// Type for window with lazy loading metrics
interface WindowWithMetrics extends Window {
  LazyLoadingMetrics?: {
    trackComponentLoad: (componentName: string, startTime: number) => void
  }
}

/**
 * Suspense Wrapper for Lazy Components
 * Provides consistent loading states and error boundaries
 */

interface SkeletonProps {
  className?: string
  rows?: number
  type?: 'login' | 'register'
}

// Loading components mapped to skeleton types
const loadingComponents: Record<string, ComponentType<Record<string, unknown>>> = {
  // Page-level skeletons
  page: () => <div className="p-6 space-y-6">
    <DashboardCardSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <DashboardCardSkeleton key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DataTableSkeleton />
      <ChartSkeleton />
    </div>
  </div>,

  // Table skeletons
  table: DataTableSkeleton,
  ordersTable: DataTableSkeleton,
  customersTable: DataTableSkeleton,
  inventoryTable: DataTableSkeleton,
  recipesTable: DataTableSkeleton,
  recipeTable: DataTableSkeleton,

  // Form skeletons
  form: () => <div className="space-y-4 p-4">
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
  </div>,
  recipeForm: () => <div className="space-y-4 p-4">
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
  </div>,
  orderForm: () => <div className="space-y-4 p-4">
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
  </div>,
  settingsForm: () => <div className="space-y-4 p-4">
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
  </div>,
  authForm: ({ type = 'login' }: SkeletonProps) => <div className="space-y-4 p-4">
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
    {type === 'register' && <DashboardCardSkeleton />}
  </div>,
  modalForm: () => <div className="space-y-4 p-4">
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
  </div>,
  searchForm: () => <div className="flex gap-2 p-4">
    <DashboardCardSkeleton />
    <AvatarSkeleton />
  </div>,

  // Chart skeletons
  chart: ChartSkeleton,

  // Dashboard components
  statsCard: DashboardCardSkeleton,
  quickActions: () => <div className="flex gap-2">
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
    <DashboardCardSkeleton />
  </div>,
  recentOrders: DataTableSkeleton,
  stockAlert: ChartSkeleton,
  hppResults: ChartSkeleton,
  dashboardHeader: DashboardCardSkeleton,

  // Default fallback
  default: () => <div className="flex items-center justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
}

interface SuspenseWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  loadingType?: keyof typeof loadingComponents
  errorFallback?: ReactNode
}

/**
 * Generic suspense wrapper with consistent loading states
 */
export const SuspenseWrapper = ({
  children,
  fallback,
  loadingType = 'default',
  errorFallback
}: SuspenseWrapperProps) => {
  const LoadingComponent = loadingComponents[loadingType] ?? DataTableSkeleton

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback ?? <LoadingComponent />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

/**
 * Higher-order component for lazy loading with suspense
 */
export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  options: {
    loadingType?: keyof typeof loadingComponents
    errorFallback?: ReactNode
    displayName?: string
  } = {}
) {
  const { loadingType = 'default', errorFallback, displayName } = options

  const WrappedComponent = (props: P) => (
    <SuspenseWrapper loadingType={loadingType} errorFallback={errorFallback}>
      <Component {...props} />
    </SuspenseWrapper>
  )

  if (displayName) {
    WrappedComponent.displayName = displayName
  }

  return WrappedComponent
}

/**
 * Route-based lazy loading wrapper
 */
export const RouteSuspenseWrapper = ({
  children,
  routeName
}: {
  children: ReactNode
  routeName: string
}) => {
  // Preload critical components for this route
  useEffect(() => {
    // Import the lazy loading utils and preload for route
    // Type assertion is safe here as we're catching errors from invalid routes
    void globalLazyLoadingUtils.preloadForRoute(routeName as never).catch(() => {
      // Ignore preload errors for invalid routes
    })
  }, [routeName])

  return <>{children}</>
}

/**
 * Lazy component with automatic performance tracking
 */
export function createTrackedLazyComponent(
  componentName: string,
  options: {
    loadingType?: keyof typeof loadingComponents
    errorFallback?: ReactNode
  } = {}
) {
  const LazyComponent = lazy(() =>
    import(componentName).then((module: { default: React.ComponentType<unknown> }) => {
      // Track component load time
      const startTime = performance.now()
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as WindowWithMetrics).LazyLoadingMetrics) {
          (window as WindowWithMetrics).LazyLoadingMetrics?.trackComponentLoad(componentName, startTime)
        }
      }, 0)
       
      return module
    })
  )

  return withSuspense(LazyComponent, {
    ...options,
    displayName: `Lazy${componentName}`
  })
}
