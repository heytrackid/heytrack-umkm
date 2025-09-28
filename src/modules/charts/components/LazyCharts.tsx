'use client'

import { createLazyComponent, ComponentSkeletons } from '@/shared/components/utility/LazyWrapper'
import { Suspense } from 'react'

// Lazy load chart components with optimized loading
export const LazyFinancialTrendsChart = createLazyComponent(
  () => import('./FinancialTrendsChart'),
  {
    name: 'Financial Trends Chart',
    fallback: <ComponentSkeletons.Chart height={400} />,
    minLoadingTime: 400,
  }
)

export const LazyInventoryTrendsChart = createLazyComponent(
  () => import('./InventoryTrendsChart'),
  {
    name: 'Inventory Trends Chart', 
    fallback: <ComponentSkeletons.Chart height={400} />,
    minLoadingTime: 400,
  }
)

export const LazyMiniChart = createLazyComponent(
  () => import('./MiniChart'),
  {
    name: 'Mini Chart',
    fallback: <ComponentSkeletons.Chart height={60} />,
    minLoadingTime: 200,
  }
)

// Lazy load heavy chart libraries
export const LazyRechartsLineChart = createLazyComponent(
  () => import('recharts').then(module => ({ default: module.LineChart })),
  {
    name: 'Recharts Line Chart',
    fallback: <ComponentSkeletons.Chart height={300} />,
    minLoadingTime: 500,
  }
)

export const LazyRechartsBarChart = createLazyComponent(
  () => import('recharts').then(module => ({ default: module.BarChart })),
  {
    name: 'Recharts Bar Chart',
    fallback: <ComponentSkeletons.Chart height={300} />,
    minLoadingTime: 500,
  }
)

export const LazyRechartsAreaChart = createLazyComponent(
  () => import('recharts').then(module => ({ default: module.AreaChart })),
  {
    name: 'Recharts Area Chart',
    fallback: <ComponentSkeletons.Chart height={300} />,
    minLoadingTime: 500,
  }
)

export const LazyRechartsPieChart = createLazyComponent(
  () => import('recharts').then(module => ({ default: module.PieChart })),
  {
    name: 'Recharts Pie Chart',
    fallback: <ComponentSkeletons.Chart height={300} />,
    minLoadingTime: 500,
  }
)

// Preload chart components for better UX
export const preloadChartComponents = () => {
  // Preload most commonly used charts
  import('./FinancialTrendsChart')
  import('./InventoryTrendsChart')
  import('./MiniChart')
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
  data: any[]
  height?: number
  [key: string]: any
}) => {
  // Use lightweight version for small datasets, heavy version for large
  const useAdvancedChart = data.length > 20

  const ChartComponents = {
    line: useAdvancedChart ? LazyRechartsLineChart : LazyMiniChart,
    bar: useAdvancedChart ? LazyRechartsBarChart : LazyMiniChart,
    area: useAdvancedChart ? LazyRechartsAreaChart : LazyMiniChart,
    pie: useAdvancedChart ? LazyRechartsPieChart : LazyMiniChart,
  }

  const ChartComponent = ChartComponents[chartType]

  return (
    <Suspense fallback={<ComponentSkeletons.Chart height={height} />}>
      <ChartComponent data={data} height={height} dataKey="value" {...props} />
    </Suspense>
  )
}

// Progressive chart dashboard component
export function ChartDashboardWithProgressiveLoading({
  charts
}: {
  charts: Array<{
    id: string
    type: 'financial' | 'inventory' | 'mini'
    priority: 'high' | 'medium' | 'low'
    data?: any[]
  }>
}) {
  // Sort charts by priority
  const sortedCharts = charts.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  return (
    <div className="space-y-6">
      {sortedCharts.map((chart, index) => {
        // Stagger loading times based on priority
        const loadingDelay = chart.priority === 'high' ? 0 : chart.priority === 'medium' ? 200 : 400

        return (
          <div key={chart.id} className="chart-container">
            <Suspense fallback={<ComponentSkeletons.Chart />}>
              {chart.type === 'financial' && (
                <LazyFinancialTrendsChart />
              )}
              {chart.type === 'inventory' && (
                <LazyInventoryTrendsChart />
              )}
              {chart.type === 'mini' && (
                <LazyMiniChart data={chart.data || []} dataKey="value" />
              )}
            </Suspense>
          </div>
        )
      })}
    </div>
  )
}

// Hook for progressive chart loading with metrics
export function useChartProgressiveLoading() {
  const components = [
    () => import('./FinancialTrendsChart'),
    () => import('./InventoryTrendsChart'),
    () => import('./MiniChart'),
    () => import('recharts'), // Heavy library
  ]
  
  return useProgressiveLoading(components, 300)
}

// Chart performance utilities
export const ChartPerformanceUtils = {
  // Debounce chart updates to prevent excessive re-renders
  debounceChartUpdate: (callback: Function, delay = 300) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => callback(...args), delay)
    }
  },

  // Optimize data for rendering
  optimizeChartData: (data: any[], maxPoints = 50) => {
    if (data.length <= maxPoints) return data
    
    // Sample data points to reduce rendering load
    const step = Math.ceil(data.length / maxPoints)
    return data.filter((_, index) => index % step === 0)
  },

  // Virtual scrolling for large datasets
  getVisibleDataRange: (data: any[], scrollPosition: number, viewportSize: number) => {
    const startIndex = Math.floor(scrollPosition / viewportSize) * viewportSize
    const endIndex = Math.min(startIndex + viewportSize, data.length)
    return data.slice(startIndex, endIndex)
  }
}

import { useProgressiveLoading } from '@/shared/components/utility/LazyWrapper'