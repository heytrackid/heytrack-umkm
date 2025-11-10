// Lazy loaded dashboard components for improved performance

import dynamic from 'next/dynamic'
import { RecentOrdersSkeleton, StockAlertSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'

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
const LazyHppDashboardWidget = dynamic(() =>
  import('./HppDashboardWidget').then(mod => ({ default: mod.HppDashboardWidget })), {
    loading: () => <div className="h-80 bg-muted animate-pulse rounded-lg" />
  }
)

const LazyRecentOrdersSection = dynamic(() =>
  import('./RecentOrdersSection').then(mod => ({ default: mod.RecentOrdersSection })), {
    loading: () => <RecentOrdersSkeleton />
  }
)

const LazyStatsCardsSection = dynamic(() =>
  import('./StatsCardsSection').then(mod => ({ default: mod.StatsCardsSection })), {
    loading: () => <StatsCardsSkeleton />
  }
)

const LazyStockAlertsSection = dynamic(() =>
  import('./StockAlertsSection').then(mod => mod.default), {
    loading: () => <StockAlertSkeleton />
  }
)

// Wrapper components that include loading boundaries
const HppDashboardWidgetWithSuspenseComponent = (): JSX.Element => (
  <LazyHppDashboardWidget />
)



const RecentOrdersSectionWithSuspenseComponent = (props: DashboardComponentProps): JSX.Element => (
  <LazyRecentOrdersSection {...props} />
)

const StatsCardsSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
    ))}
  </div>
)

const StatsCardsSectionWithSuspenseComponent = (props: DashboardComponentProps): JSX.Element => (
  <LazyStatsCardsSection {...(props as unknown as StatsCardsProps)} />
)



const StockAlertsSectionWithSuspenseComponent = (props: DashboardComponentProps): JSX.Element => (
  <LazyStockAlertsSection {...props} />
)

export const HppDashboardWidgetWithSuspense = HppDashboardWidgetWithSuspenseComponent
export const RecentOrdersSectionWithSuspense = RecentOrdersSectionWithSuspenseComponent
export const StatsCardsSectionWithSuspense = StatsCardsSectionWithSuspenseComponent
export const StockAlertsSectionWithSuspense = StockAlertsSectionWithSuspenseComponent