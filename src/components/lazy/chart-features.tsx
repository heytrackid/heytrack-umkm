'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Chart loading skeleton
const ChartLoadingSkeleton = ({ 
  title, 
  height ="h-64" 
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
  () => import('@/components')
    .then(module => ({ default: module.FinancialTrendsChart }))
)

const LazyInventoryTrendsChart = lazy(
  () => import('@/components')
    .then(module => ({ default: module.InventoryTrendsChart }))
)

const LazyChart = lazy(
  () => import('@/components')
    .then(module => ({ default: module.Chart }))
)

const LazyMiniChart = lazy(
  () => import('@/components')
    .then(module => ({ default: module.MiniChart }))
)

// Recharts components (heavy library) - removed for now as it causes typing issues
// const LazyRechartsBundle = lazy(
//   () => import('@/components').then(recharts => ({ default: recharts }))
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
  () => import('@/components').then(module => ({ default: module.PieChart }))
)

const LazyLineChart = lazy(
  () => import('@/components').then(module => ({ default: module.LineChart }))
)

const LazyBarChart = lazy(
  () => import('@/components').then(module => ({ default: module.BarChart }))
)

const LazyAreaChart = lazy(
  () => import('@/components').then(module => ({ default: module.AreaChart }))
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
      return import('@/components')
    case 'inventory':
      return import('@/components')
    case 'pie':
      return import('@/components').then(m => ({ PieChart: m.PieChart }))
    case 'line':
      return import('@/components').then(m => ({ LineChart: m.LineChart }))
    case 'bar':
      return import('@/components').then(m => ({ BarChart: m.BarChart }))
    case 'area':
      return import('@/components').then(m => ({ AreaChart: m.AreaChart }))
    default:
      return import('@/components')
  }
}

// Progressive chart enhancement
export const useChartProgressive = (chartType: string, data: any[]) => {
  // Load simple chart first, then enhance with advanced features
  const shouldLoadAdvancedChart = data.length > 50 // Only load advanced features for large datasets
  
  return {
    shouldLoadAdvancedChart,
    ChartComponent: shouldLoadAdvancedChart 
      ? ChartFeatureBundle.Chart 
      : ChartWithLoading
  }
}