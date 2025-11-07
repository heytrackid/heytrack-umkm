// Lazy loaded dashboard components for improved performance

import { lazy, Suspense } from 'react'

// Define props interface to replace 'any' types
type DashboardComponentProps = Record<string, unknown>;

interface StatsCardsProps {
  stats?: {
    revenue: {
      total: number
      growth: string
      trend: 'down' | 'up'
    }
    orders: {
      total: number
      active: number
    }
    customers: {
      total: number
      vip: number
    }
    inventory: {
      total: number
      lowStock: number
    }
  }
  formatCurrency: (value: number) => string
}

// Lazy load dashboard components with proper chunk names for better bundle analysis
const LazyHppDashboardWidget = lazy(() => 
  import('./HppDashboardWidget').then(module => ({ default: module.default }))
)

const LazyRecentOrdersSection = lazy(() => 
  import('./RecentOrdersSection').then(module => ({ default: module.default }))
)

const LazyStatsCardsSection = lazy(() => 
  import('./StatsCardsSection').then(module => ({ default: module.default }))
)

const LazyStockAlertsSection = lazy(() => 
  import('./StockAlertsSection').then(module => ({ default: module.default }))
)

// Wrapper components that include Suspense boundaries
const HppDashboardWidgetWithSuspenseComponent = (): JSX.Element => (
  <Suspense fallback={<div className="h-80 bg-gray-100 animate-pulse rounded-lg" />}>
    <LazyHppDashboardWidget />
  </Suspense>
)

const RecentOrdersSkeleton = (): JSX.Element => (
  <div className="space-y-4">
    <div className="h-12 bg-gray-100 animate-pulse rounded" />
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`skeleton-${i}`} className="h-16 bg-gray-100 animate-pulse rounded" />
      ))}
    </div>
  </div>
)

const RecentOrdersSectionWithSuspenseComponent = (props: DashboardComponentProps): JSX.Element => (
  <Suspense fallback={<RecentOrdersSkeleton />}>
    <LazyRecentOrdersSection {...props} />
  </Suspense>
)

const StatsCardsSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
    ))}
  </div>
)

const StatsCardsSectionWithSuspenseComponent = (props: DashboardComponentProps): JSX.Element => (
  <Suspense fallback={<StatsCardsSkeleton />}>
    <LazyStatsCardsSection {...(props as unknown as StatsCardsProps)} />
  </Suspense>
)

const StockAlertsSkeleton = (): JSX.Element => (
  <div className="space-y-4">
    <div className="h-12 bg-gray-100 animate-pulse rounded" />
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`skeleton-${i}`} className="h-16 bg-gray-100 animate-pulse rounded" />
      ))}
    </div>
  </div>
)

const StockAlertsSectionWithSuspenseComponent = (props: DashboardComponentProps): JSX.Element => (
  <Suspense fallback={<StockAlertsSkeleton />}>
    <LazyStockAlertsSection {...props} />
  </Suspense>
)

export const HppDashboardWidgetWithSuspense = HppDashboardWidgetWithSuspenseComponent
export const RecentOrdersSectionWithSuspense = RecentOrdersSectionWithSuspenseComponent
export const StatsCardsSectionWithSuspense = StatsCardsSectionWithSuspenseComponent
export const StockAlertsSectionWithSuspense = StockAlertsSectionWithSuspenseComponent