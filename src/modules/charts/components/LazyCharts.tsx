'use client'

import { createLazyComponent, ChartSkeleton } from '@/components/lazy/LazyWrapper'
import { Suspense, lazy, type ComponentType } from 'react'
import type { ChartDataPoint } from '@/components/ui/charts/types'

export const LazyFinancialTrendsChart = createLazyComponent(
  () => import('@/modules/charts/components/FinancialTrendsChart'),
  ChartSkeleton
)

export const LazyInventoryTrendsChart = createLazyComponent(
  () => import('@/modules/charts/components/InventoryTrendsChart'),
  ChartSkeleton
)

export const LazyMiniChart = lazy(() =>
  import('@/components/ui/charts').then(m => ({ default: m.MiniChart }))
)

// Lazy load heavy chart libraries
export const LazyRechartsLineChart = createLazyComponent(
  () => import('recharts').then(module => ({ default: module.LineChart })),
  ChartSkeleton
)

export const LazyRechartsBarChart = createLazyComponent(
  () => import('recharts').then(module => ({ default: module.BarChart })),
  ChartSkeleton
)

export const LazyRechartsAreaChart = createLazyComponent(
  () => import('recharts').then(module => ({ default: module.AreaChart })),
  ChartSkeleton
)

export const LazyRechartsPieChart = createLazyComponent(
  () => import('recharts').then(module => ({ default: module.PieChart })),
  ChartSkeleton
)

// Preload chart components for better UX
export const preloadChartComponents = () => {
  // Preload most commonly used charts
  import('@/modules/charts/components/FinancialTrendsChart')
  import('@/modules/charts/components/InventoryTrendsChart')
  import('@/components/ui/charts')
}

// Preload heavy libraries separately
export const preloadRechartsBundle = () => {
  import('recharts')
}

// Smart chart loader with conditional loading based on data size
export const SmartChartLoader = ({
  chartType,
  data,
  height = 400,
  ...props
}: {
  chartType: 'line' | 'bar' | 'area' | 'pie'
  data: unknown[]
  height?: number
  [key: string]: unknown
}) => {
  // Use lightweight version for small datasets, heavy version for large
  const useAdvancedChart = data.length > 20

  const chartComponents: Record<'line' | 'bar' | 'area' | 'pie', ComponentType<Record<string, unknown>>> = {
    line: (useAdvancedChart ? LazyRechartsLineChart : LazyMiniChart) as ComponentType<Record<string, unknown>>,
    bar: (useAdvancedChart ? LazyRechartsBarChart : LazyMiniChart) as ComponentType<Record<string, unknown>>,
    area: (useAdvancedChart ? LazyRechartsAreaChart : LazyMiniChart) as ComponentType<Record<string, unknown>>,
    pie: (useAdvancedChart ? LazyRechartsPieChart : LazyMiniChart) as ComponentType<Record<string, unknown>>,
  }

  const ChartComponent = chartComponents[chartType]

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ChartComponent
        data={data as Array<Record<string, unknown>>}
        height={height}
        dataKey="value"
        {...props}
      />
    </Suspense>
  )
}

// Progressive chart dashboard component
export const ChartDashboardWithProgressiveLoading = ({
  charts
}: {
  charts: Array<{
    id: string
    type: 'financial' | 'inventory' | 'mini'
    priority: 'high' | 'medium' | 'low'
    data?: ChartDataPoint[]
  }>
}) => {
  // Sort charts by priority
  const sortedCharts = charts.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  return (
    <div className="space-y-6">
      {sortedCharts.map((chart) => (
        <div key={chart.id} className="chart-container">
          <Suspense fallback={<ChartSkeleton />}>
            {chart.type === 'financial' && (
              <LazyFinancialTrendsChart />
            )}
            {chart.type === 'inventory' && (
              <LazyInventoryTrendsChart />
            )}
            {chart.type === 'mini' && (
              <LazyMiniChart data={chart.data ?? []} dataKey="value" type="line" />
            )}
          </Suspense>
        </div>
      ))}
    </div>
  )
}

// Hook for progressive chart loading with metrics
export function useChartProgressiveLoading() {
  const components = [
    () => import('@/modules/charts/components/FinancialTrendsChart'),
    () => import('@/modules/charts/components/InventoryTrendsChart'),
    () => import('@/components/ui/charts'),
    () => import('recharts'), // Heavy library
  ]

  // Simple implementation since useProgressiveLoading doesn't exist
  return {
    loadNext: async () => {
      // Simple sequential loading
      for (const component of components) {
        await component()
      }
    },
    isLoading: false,
    loadedCount: components.length
  }
}

// Chart performance utilities
export const ChartPerformanceUtils = {
  // Debounce chart updates to prevent excessive re-renders
  debounceChartUpdate: (callback: Function, delay = 300) => {
    let timeoutId: NodeJS.Timeout | undefined
    return (...args: unknown[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => callback(...args), delay)
    }
  },

  // Optimize data for rendering
  optimizeChartData: (data: unknown[], maxPoints = 50) => {
    if (data.length <= maxPoints) { return data }

    // Sample data points to reduce rendering load
    const step = Math.ceil(data.length / maxPoints)
    return data.filter((_, index) => index % step === 0)
  },

  // Virtual scrolling for large datasets
  getVisibleDataRange: (data: unknown[], scrollPosition: number, viewportSize: number) => {
    const startIndex = Math.floor(scrollPosition / viewportSize) * viewportSize
    const endIndex = Math.min(startIndex + viewportSize, data.length)
    return data.slice(startIndex, endIndex)
  }
}
