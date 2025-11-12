// Lazy loaded dashboard components for improved performance

import { RecentOrdersSkeleton, StockAlertSkeleton } from '@/components/ui/skeletons/dashboard-skeletons';
import dynamic from 'next/dynamic';

// Define props interfaces matching the actual component props
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

interface RecentOrdersProps {
  orders?: Array<{
    id: string
    customer: string
    amount: number | null
    status: string | null
    created_at: string | null
  }>
}

interface StockAlertsProps {
  lowStockItems?: Array<{
    id: string
    name: string
    currentStock: number
    reorderPoint: number
  }>
}

// Lazy load dashboard components - using default imports
const LazyHppDashboardWidget = dynamic(() => import('./HppDashboardWidget'), {
  loading: () => <StatsCardsSkeleton />
})

const LazyRecentOrdersSection = dynamic(() => import('./RecentOrdersSection'), {
  loading: () => <RecentOrdersSkeleton />
})

const LazyStatsCardsSection = dynamic(() => import('./StatsCardsSection'), {
  loading: () => <StatsCardsSkeleton />
})

const LazyStockAlertsSection = dynamic(() => import('./StockAlertsSection'), {
  loading: () => <StockAlertSkeleton />
})

// Wrapper components that include loading boundaries
const HppDashboardWidgetWithSuspenseComponent = (): JSX.Element => (
  <LazyHppDashboardWidget />
)



const RecentOrdersSectionWithSuspenseComponent = (props: RecentOrdersProps): JSX.Element => (
  <LazyRecentOrdersSection {...props} />
)

const StatsCardsSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
    ))}
  </div>
)

const StatsCardsSectionWithSuspenseComponent = (props: StatsCardsProps): JSX.Element => (
  <LazyStatsCardsSection {...props} />
)

const StockAlertsSectionWithSuspenseComponent = (props: StockAlertsProps): JSX.Element => (
  <LazyStockAlertsSection {...props} />
)

export const HppDashboardWidgetWithSuspense = HppDashboardWidgetWithSuspenseComponent
export const RecentOrdersSectionWithSuspense = RecentOrdersSectionWithSuspenseComponent
export const StatsCardsSectionWithSuspense = StatsCardsSectionWithSuspenseComponent
export const StockAlertsSectionWithSuspense = StockAlertsSectionWithSuspenseComponent