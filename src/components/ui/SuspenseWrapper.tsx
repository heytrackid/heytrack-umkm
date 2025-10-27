/**
 * Suspense Wrapper for Lazy Components
 * Provides consistent loading states and error boundaries
 */

import { Suspense, lazy, useEffect, type ComponentType, type ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

// Import comprehensive skeletons
import {
  OrdersTableSkeleton,
  CustomersTableSkeleton,
  InventoryTableSkeleton,
  RecipesTableSkeleton,
  RecipeTableSkeleton,
  RecipeFormSkeleton,
  OrderFormSkeleton,
  SettingsFormSkeleton,
  AuthFormSkeleton,
  ModalFormSkeleton,
  SearchFormSkeleton,
  StatsCardSkeleton,
  QuickActionsSkeleton,
  RecentOrdersSkeleton,
  StockAlertSkeleton,
  HPPResultsSkeleton,
  DashboardHeaderSkeleton,
  ChartCardSkeleton
} from '@/components/ui/skeletons'

interface SkeletonProps {
  className?: string
  rows?: number
  type?: 'login' | 'register'
}

// Loading components mapped to skeleton types
const loadingComponents: Record<string, ComponentType<any>> = {
  // Page-level skeletons
  page: () => <div className="p-6 space-y-6">
    <DashboardHeaderSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentOrdersSkeleton />
      <StockAlertSkeleton />
    </div>
  </div>,

  // Table skeletons
  table: OrdersTableSkeleton,
  ordersTable: OrdersTableSkeleton,
  customersTable: CustomersTableSkeleton,
  inventoryTable: InventoryTableSkeleton,
  recipesTable: RecipesTableSkeleton,
  recipeTable: RecipeTableSkeleton,

  // Form skeletons
  form: RecipeFormSkeleton,
  recipeForm: RecipeFormSkeleton,
  orderForm: OrderFormSkeleton,
  settingsForm: SettingsFormSkeleton,
  authForm: ({ type = 'login' }: SkeletonProps) => <AuthFormSkeleton type={type} />,
  modalForm: ModalFormSkeleton,
  searchForm: SearchFormSkeleton,

  // Chart skeletons
  chart: ChartCardSkeleton,

  // Dashboard components
  statsCard: StatsCardSkeleton,
  quickActions: QuickActionsSkeleton,
  recentOrders: RecentOrdersSkeleton,
  stockAlert: StockAlertSkeleton,
  hppResults: HPPResultsSkeleton,
  dashboardHeader: DashboardHeaderSkeleton,

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
  const LoadingComponent = loadingComponents[loadingType]

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback || <LoadingComponent />}>
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
    import('@/components/lazy').then(({ globalLazyLoadingUtils }) => {
      globalLazyLoadingUtils.preloadForRoute(routeName as any).catch(() => {
        // Ignore preload errors
      })
    })
  }, [routeName])

  return (
    <SuspenseWrapper loadingType="page">
      {children}
    </SuspenseWrapper>
  )
}

/**
 * Lazy component with automatic performance tracking
 */
export function createTrackedLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  options: {
    loadingType?: keyof typeof loadingComponents
    errorFallback?: ReactNode
  } = {}
) {
  const LazyComponent = lazy(() =>
    importFn().then(module => {
      // Track component load time
      const startTime = performance.now()
      setTimeout(() => {
        import('@/components/lazy').then(({ LazyLoadingMetrics }) => {
          LazyLoadingMetrics.trackComponentLoad(componentName, startTime)
        })
      }, 0)

      return { default: module.default }
    })
  )

  return withSuspense(LazyComponent, {
    ...options,
    displayName: `Lazy${componentName}`
  })
}
