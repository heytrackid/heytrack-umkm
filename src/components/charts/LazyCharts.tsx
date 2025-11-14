'use client'

import dynamic from 'next/dynamic'
import { ResponsiveContainer } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { logger } from '@/lib/logger'

/**
 * Canonical Lazy-loaded Chart Components
 * Single source of truth for all Recharts lazy loading
 * Reduces initial bundle size by loading charts only when needed
 */

// Loading component for charts
const ChartSkeleton = (): JSX.Element => (
    <div className="space-y-3">
        <Skeleton className="h-[300px] w-full" />
        <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
        </div>
    </div>
)

// Lazy load recharts components using shared bundle to avoid HMR issues
export const LazyLineChart = dynamic(
    async () => {
        try {
            const mod = await import(/* webpackChunkName: "recharts-lib" */ 'recharts')
            return { default: mod.LineChart }
        } catch (error) {
            logger.error({ error }, 'Failed to load recharts LineChart')
            return { default: () => <ChartSkeleton /> }
        }
    },
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

export const LazyBarChart = dynamic(
    async () => {
        try {
            const mod = await import(/* webpackChunkName: "recharts-lib" */ 'recharts')
            return { default: mod.BarChart }
        } catch (error) {
            logger.error({ error }, 'Failed to load recharts BarChart')
            return { default: () => <ChartSkeleton /> }
        }
    },
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

export const LazyPieChart = dynamic(
    async () => {
        try {
            const mod = await import(/* webpackChunkName: "recharts-lib" */ 'recharts')
            return { default: mod.PieChart }
        } catch (error) {
            logger.error({ error }, 'Failed to load recharts PieChart')
            return { default: () => <ChartSkeleton /> }
        }
    },
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

export const LazyAreaChart = dynamic(
    async () => {
        try {
            const mod = await import(/* webpackChunkName: "recharts-lib" */ 'recharts')
            return { default: mod.AreaChart }
        } catch (error) {
            logger.error({ error }, 'Failed to load recharts AreaChart')
            return { default: () => <ChartSkeleton /> }
        }
    },
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

export const LazyComposedChart = dynamic(
    async () => {
        try {
            const mod = await import(/* webpackChunkName: "recharts-lib" */ 'recharts')
            return { default: mod.ComposedChart }
        } catch (error) {
            logger.error({ error }, 'Failed to load recharts ComposedChart')
            return { default: () => <ChartSkeleton /> }
        }
    },
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

// Chart Elements - Direct imports for better HMR compatibility
export { Line, Bar, Pie, Area, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
export { ResponsiveContainer }

// Legend - Lazy loaded for HMR compatibility
export const ChartLegend = dynamic(
  async () => {
    const mod = await import('recharts')
    return { default: mod.Legend }
  },
  {
    loading: () => <div className="h-4 bg-muted animate-pulse rounded" />,
    ssr: false, // Charts don't need SSR
  }
)

// Chart Bundle Preloader
export const preloadChartBundle = () =>
    // Preload the entire recharts bundle when user interacts with dashboard
    import('recharts').catch(() => {})

/**
 * Wrapper component for lazy-loaded charts with error boundary
 */
interface LazyChartWrapperProps {
    title?: string
    description?: string
    height?: string
    children: React.ReactNode
}

export const LazyChartWrapper = ({
    title,
    description,
    height = 'h-[300px]',
    children
}: LazyChartWrapperProps): JSX.Element => (
    <Card>
        {(title ?? description) && (
            <CardHeader>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </CardHeader>
        )}
        <CardContent>
            <div className={`w-full ${height}`}>
                {children}
            </div>
        </CardContent>
    </Card>
)

// Chart Type Detection for Dynamic Loading
export type ChartType = 'area' | 'bar' | 'composed' | 'line' | 'pie'

export interface ChartContainerProps {
    type: ChartType
    title?: string
    height?: string
    children: React.ReactNode
    [key: string]: unknown
}

export const ChartContainer = ({
    type,
    title,
    height = 'h-64',
    children,
    ...props
}: ChartContainerProps) => {
    const ChartComponents = {
        line: LazyLineChart,
        bar: LazyBarChart,
        area: LazyAreaChart,
        pie: LazyPieChart,
        composed: LazyComposedChart
    }

    const ChartComponent = ChartComponents[type]

    return (
        <LazyChartWrapper title={title} height={height}>
            <ResponsiveContainer width="100%" height="100%">
                <ChartComponent {...props}>
                    {children}
                </ChartComponent>
            </ResponsiveContainer>
        </LazyChartWrapper>
    )
}
