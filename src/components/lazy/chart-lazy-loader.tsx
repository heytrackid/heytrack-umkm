'use client'
import * as React from 'react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { lazy, Suspense } from 'react'
import { logger } from '@/lib/logger'

// Chart Loading Skeleton Component
const ChartLoadingSkeleton = ({ title, height = 'h-64' }: { title?: string, height?: string }) => (
  <Card>
    <CardHeader>
      {title && <Skeleton className="h-6 w-48" />}
    </CardHeader>
    <CardContent>
      <div className={`w-full ${height} rounded-lg bg-muted animate-pulse flex items-center justify-center`}>
        <div className="text-muted-foreground text-sm">Loading chart...</div>
      </div>
    </CardContent>
  </Card>
)

// Recharts Components - Dynamically Loaded
export const LazyLineChart = lazy(() => import('@/components').then(m => ({ default: m.LineChart })))
export const LazyBarChart = lazy(() => import('@/components').then(m => ({ default: m.BarChart })))
export const LazyAreaChart = lazy(() => import('@/components').then(m => ({ default: m.AreaChart })))
export const LazyPieChart = lazy(() => import('@/components').then(m => ({ default: m.PieChart })))
export const LazyComposedChart = lazy(() => import('@/components').then(m => ({ default: m.ComposedChart })))

// Recharts Component Elements
export const LazyXAxis = lazy(() => import('@/components').then(m => ({ default: m.XAxis })))
export const LazyYAxis = lazy(() => import('@/components').then(m => ({ default: m.YAxis })))
export const LazyCartesianGrid = lazy(() => import('@/components').then(m => ({ default: m.CartesianGrid })))
export const LazyTooltip = lazy(() => import('@/components').then(m => ({ default: m.Tooltip })))
export const LazyLegend = lazy(() => import('@/components').then(m => ({ default: m.Legend })))
export const LazyResponsiveContainer = lazy(() => import('@/components').then(m => ({ default: m.ResponsiveContainer })))

// Chart Data Elements
export const LazyLine = lazy(() => import('@/components').then(m => ({ default: m.Line })))
export const LazyBar = lazy(() => import('@/components').then(m => ({ default: m.Bar })))
export const LazyArea = lazy(() => import('@/components').then(m => ({ default: m.Area })))
export const LazyCell = lazy(() => import('@/components').then(m => ({ default: m.Cell })))

// Wrapper Components with Suspense
export const LineChartWithSuspense = ({ children, title, height = 'h-64', ...props }: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title={title} height={height} />}>
    <LazyResponsiveContainer width="100%" height={300}>
      <LazyLineChart {...props}>
        {children}
      </LazyLineChart>
    </LazyResponsiveContainer>
  </Suspense>
)

export const BarChartWithSuspense = ({ children, title, height = 'h-64', ...props }: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title={title} height={height} />}>
    <LazyResponsiveContainer width="100%" height={300}>
      <LazyBarChart {...props}>
        {children}
      </LazyBarChart>
    </LazyResponsiveContainer>
  </Suspense>
)

export const AreaChartWithSuspense = ({ children, title, height = 'h-64', ...props }: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title={title} height={height} />}>
    <LazyResponsiveContainer width="100%" height={300}>
      <LazyAreaChart {...props}>
        {children}
      </LazyAreaChart>
    </LazyResponsiveContainer>
  </Suspense>
)

export const PieChartWithSuspense = ({ children, title, height = 'h-64', ...props }: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title={title} height={height} />}>
    <LazyResponsiveContainer width="100%" height={300}>
      <LazyPieChart {...props}>
        {children}
      </LazyPieChart>
    </LazyResponsiveContainer>
  </Suspense>
)

// Advanced Chart Components
export const ComposedChartWithSuspense = ({ children, title, height = 'h-64', ...props }: any) => (
  <Suspense fallback={<ChartLoadingSkeleton title={title} height={height} />}>
    <LazyResponsiveContainer width="100%" height={300}>
      <LazyComposedChart {...props}>
        {children}
      </LazyComposedChart>
    </LazyResponsiveContainer>
  </Suspense>
)

// Chart Component Elements with Suspense
export const CartesianGridWithSuspense = (props: unknown) => (
  <Suspense fallback={null}>
    <LazyCartesianGrid {...props} />
  </Suspense>
)

export const TooltipWithSuspense = (props: unknown) => (
  <Suspense fallback={null}>
    <LazyTooltip {...props} />
  </Suspense>
)

export const LegendWithSuspense = (props: unknown) => (
  <Suspense fallback={null}>
    <LazyLegend {...props} />
  </Suspense>
)

export const XAxisWithSuspense = (props: unknown) => (
  <Suspense fallback={null}>
    <LazyXAxis {...props} />
  </Suspense>
)

export const YAxisWithSuspense = (props: unknown) => (
  <Suspense fallback={null}>
    <LazyYAxis {...props} />
  </Suspense>
)

// Chart Data Elements with Suspense
export const LineWithSuspense = (props: unknown) => (
  <Suspense fallback={null}>
    <LazyLine {...props} />
  </Suspense>
)

export const BarWithSuspense = (props: unknown) => (
  <Suspense fallback={null}>
    <LazyBar {...props} />
  </Suspense>
)

export const AreaWithSuspense = (props: unknown) => (
  <Suspense fallback={null}>
    <LazyArea {...props} />
  </Suspense>
)

export const CellWithSuspense = (props: unknown) => (
  <Suspense fallback={null}>
    <LazyCell {...props} />
  </Suspense>
)

// Chart Bundle Preloader
export const preloadChartBundle = () => {
  // Preload the entire recharts bundle when user interacts with dashboard
  return import('@/components')
}

// Chart Type Detection for Dynamic Loading
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'composed'

export const ChartContainer = ({ 
  type, 
  title, 
  height = 'h-64', 
  children, 
  ...props 
}: {
  type: ChartType
  title?: string
  height?: string
  children: React.ReactNode
  [key: string]: unknown
}) => {
  const ChartComponents = {
    line: LineChartWithSuspense,
    bar: BarChartWithSuspense,
    area: AreaChartWithSuspense,
    pie: PieChartWithSuspense,
    composed: ComposedChartWithSuspense
  }

  const ChartComponent = ChartComponents[type]
  
  return (
    <ChartComponent title={title} height={height} {...props}>
      {children}
    </ChartComponent>
  )
}

// Hook for Chart Performance Monitoring
export const useChartPerformance = () => {
  const startTiming = (chartType: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`chart-${chartType}-start`)
    }
  }

  const endTiming = (chartType: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`chart-${chartType}-end`)
      performance.measure(
        `chart-${chartType}-duration`,
        `chart-${chartType}-start`,
        `chart-${chartType}-end`
      )
      
      const measure = performance.getEntriesByName(`chart-${chartType}-duration`)[0]
      if (measure && measure.duration > 1000) {
        logger.warn('Slow chart rendering', { 
          chartType, 
          duration: measure.duration.toFixed(2) 
        })
      }
    }
  }

  return { startTiming, endTiming }
}