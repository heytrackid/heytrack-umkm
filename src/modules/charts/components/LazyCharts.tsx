import dynamic from 'next/dynamic'
import type { ComponentType, ReactNode } from 'react'
import { serializeError, uiLogger } from '@/lib/logger'
import type { MiniChartProps } from './MiniChart'

'use client'







/**
 * Lazy Chart Components
 * On-demand loading of chart components for better performance
 */


// Define a type for our lazy charts
export type LazyChartComponent<T = Record<string, unknown>> = ComponentType<T>

const chartLoadingFallback = () => (
  <div className="p-4 text-center text-gray-500">Loading chart...</div>
)

const defaultChartFallback = chartLoadingFallback()

// Dynamically import chart components with loading fallback
export const LazyFinancialTrendsChart = dynamic(
  () => import('./FinancialTrendsChart'),
  {
    loading: chartLoadingFallback,
    ssr: false // Disable server-side rendering for chart components
  }
)

export const LazyInventoryTrendsChart = dynamic(
  () => import('./InventoryTrendsChart'),
  {
    loading: chartLoadingFallback,
    ssr: false
  }
)

export const LazyMiniChart = dynamic(
  () => import('./MiniChart'),
  {
    loading: chartLoadingFallback,
    ssr: false
  }
)

// Recharts components (if they exist)
export const LazyRechartsLineChart = dynamic(
  () => import('recharts').then(module => ({ default: module.LineChart })),
  {
    loading: chartLoadingFallback,
    ssr: false
  }
)

export const LazyRechartsBarChart = dynamic(
  () => import('recharts').then(module => ({ default: module.BarChart })),
  {
    loading: chartLoadingFallback,
    ssr: false
  }
)

export const LazyRechartsAreaChart = dynamic(
  () => import('recharts').then(module => ({ default: module.AreaChart })),
  {
    loading: chartLoadingFallback,
    ssr: false
  }
)

export const LazyRechartsPieChart = dynamic(
  () => import('recharts').then(module => ({ default: module.PieChart })),
  {
    loading: chartLoadingFallback,
    ssr: false
  }
)

// Utility function to preload chart components
export async function preloadChartComponents() {
  // Preload chart components
  await Promise.all([
  ])

  return true
}

// Preload Recharts library bundle
export async function preloadRechartsBundle() {
  try {
    await import('recharts')
    return true
  } catch (error) {
    uiLogger.warn(
      { error: serializeError(error), component: 'LazyCharts' },
      'Recharts not available'
    )
    return false
  }
}

interface FinancialTrendsLoaderProps {
  chartType: 'financial-trends'
  fallback?: ReactNode
}

interface InventoryTrendsLoaderProps {
  chartType: 'inventory-trends'
  fallback?: ReactNode
}

interface MiniChartLoaderProps extends MiniChartProps {
  chartType: 'mini'
  fallback?: ReactNode
}

type SmartChartLoaderProps =
  | FinancialTrendsLoaderProps
  | InventoryTrendsLoaderProps
  | MiniChartLoaderProps

// Smart loader component
export const SmartChartLoader = (props: SmartChartLoaderProps) => {
  const fallback = props.fallback || defaultChartFallback

  switch (props.chartType) {
    case 'financial-trends':
      return <LazyFinancialTrendsChart />
    case 'inventory-trends':
      return <LazyInventoryTrendsChart />
    case 'mini': {
      const { fallback: _fallback, chartType: _chartType, ...miniProps } = props
      return <LazyMiniChart {...miniProps} />
    }
    default:
      return <>{fallback}</>
  }
}

// Dashboard with progressive loading
export const ChartDashboardWithProgressiveLoading = ({ children }: { children?: ReactNode }) => (
  <div className="space-y-6">
    {children}
  </div>
)

// Hook for progressive loading
export const useChartProgressiveLoading = () =>
// This would typically handle loading states for charts
({
  isLoading: false,
  loadChart: (chartType: string) => uiLogger.info({ chartType }, 'Loading chart'),
  preloadCharts: preloadChartComponents,
})


// Chart performance utilities
export const ChartPerformanceUtils = {
  optimizeDataPoints: <T,>(data: T[], maxPoints = 100): T[] => {
    if (data.length <= maxPoints) { return data }

    const step = Math.ceil(data.length / maxPoints)
    return data.filter((_, i) => i % step === 0)
  },

  debounce: <TArgs extends unknown[]>(func: (...args: TArgs) => void, wait: number) => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    return (...args: TArgs) => {
      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(() => {
        func(...args)
      }, wait)
    }
  }
}
