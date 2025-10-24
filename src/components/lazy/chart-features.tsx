'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { lazy, Suspense } from 'react'

// Chart component props interfaces
interface ChartProps {
  data?: any[]
  width?: number | string
  height?: number | string
  margin?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  [key: string]: unknown
}

interface FinancialChartProps extends ChartProps {
  period?: string
  showLegend?: boolean
  showTooltip?: boolean
  currency?: string
}

interface InventoryChartProps extends ChartProps {
  category?: string
  showLowStock?: boolean
  alertThreshold?: number
}

// Chart loading skeleton
const ChartLoadingSkeleton = ({
  title,
  height = "h-64"
}: {
  title: string;
  height?: string;
}) => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className={`${height} w-full rounded-lg`} />
        <div className="flex justify-center gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)

// Mini chart loading (untuk stats cards)
const MiniChartLoadingSkeleton = () => (
  <div className="mt-2 h-8">
    <Skeleton className="h-full w-full rounded" />
  </div>
)

// Lazy chart components
const LazyFinancialTrendsChart = lazy(
  () => import('@/modules/charts/components/FinancialTrendsChart')
    .then(module => ({ default: module.FinancialTrendsChart }))
)

const LazyInventoryTrendsChart = lazy(
  () => import('@/modules/charts/components/FinancialTrendsChart')
    .then(module => ({ default: module.InventoryTrendsChart }))
)

const LazyChart = lazy(
  () => import('@/modules/charts/components/FinancialTrendsChart')
    .then(module => ({ default: module.Chart }))
)

const LazyMiniChart = lazy(
  () => import('@/modules/charts/components/FinancialTrendsChart')
    .then(module => ({ default: module.MiniChart }))
)

// Recharts components (heavy library) - removed for now as it causes typing issues
// const LazyRechartsBundle = lazy(
//   () => import('@/modules/charts/components/FinancialTrendsChart').then(recharts => ({ default: recharts }))
// )

// Chart wrapper components dengan loading states
export const FinancialTrendsChartWithLoading = (props: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title="Financial Trends" height="h-80" />}>
    <LazyFinancialTrendsChart {...props} />
  </Suspense>
)

export const InventoryTrendsChartWithLoading = (props: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title="Inventory Trends" height="h-80" />}>
    <LazyInventoryTrendsChart {...props} />
  </Suspense>
)

export const ChartWithLoading = (props: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title="Chart" height="h-64" />}>
    <LazyChart {...props} />
  </Suspense>
)

export const MiniChartWithLoading = (props: any) => (
  <Suspense fallback={<MiniChartLoadingSkeleton />}>
    <LazyMiniChart {...props} />
  </Suspense>
)

// Advanced chart components yang bisa di-lazy load
const LazyPieChart = lazy(
  () => import('@/modules/charts/components/FinancialTrendsChart').then(module => ({ default: module.PieChart }))
)

const LazyLineChart = lazy(
  () => import('@/modules/charts/components/FinancialTrendsChart').then(module => ({ default: module.LineChart }))
)

const LazyBarChart = lazy(
  () => import('@/modules/charts/components/FinancialTrendsChart').then(module => ({ default: module.BarChart }))
)

const LazyAreaChart = lazy(
  () => import('@/modules/charts/components/FinancialTrendsChart').then(module => ({ default: module.AreaChart }))
)

// Custom chart wrapper untuk specific chart types
export const PieChartWithLoading = (props: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title="Pie Chart" height="h-64" />}>
    <LazyPieChart {...props} />
  </Suspense>
)

export const LineChartWithLoading = (props: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title="Line Chart" height="h-64" />}>
    <LazyLineChart {...props} />
  </Suspense>
)

export const BarChartWithLoading = (props: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title="Bar Chart" height="h-64" />}>
    <LazyBarChart {...props} />
  </Suspense>
)

export const AreaChartWithLoading = (props: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title="Area Chart" height="h-64" />}>
    <LazyAreaChart {...props} />
  </Suspense>
)

// Chart feature bundle
export const ChartFeatureBundle = {
  FinancialTrendsChart: FinancialTrendsChartWithLoading,
  InventoryTrendsChart: InventoryTrendsChartWithLoading,
  Chart: ChartWithLoading,
  MiniChart: MiniChartWithLoading,
  PieChart: PieChartWithLoading,
  LineChart: LineChartWithLoading,
  BarChart: BarChartWithLoading,
  AreaChart: AreaChartWithLoading,
}

// Chart utilities untuk conditional loading
export const loadChartWhenNeeded = async (chartType: string) => {
  switch (chartType) {
    case 'financial':
      return import('@/modules/charts/components/FinancialTrendsChart')
    case 'inventory':
      return import('@/modules/charts/components/InventoryTrendsChart')
    case 'pie':
      return import('recharts').then(m => ({ PieChart: m.PieChart }))
    case 'line':
      return import('recharts').then(m => ({ LineChart: m.LineChart }))
    case 'bar':
      return import('recharts').then(m => ({ BarChart: m.BarChart }))
    case 'area':
      return import('recharts').then(m => ({ AreaChart: m.AreaChart }))
    default:
      return import('recharts')
  }
}

// Progressive chart enhancement
export const useChartProgressive = (chartType: string, data: unknown[]) => {
  // Load simple chart first, then enhance with advanced features
  const shouldLoadAdvancedChart = data.length > 50 // Only load advanced features for large datasets

  return {
    shouldLoadAdvancedChart,
    ChartComponent: shouldLoadAdvancedChart
      ? ChartFeatureBundle.Chart
      : ChartWithLoading
  }
}