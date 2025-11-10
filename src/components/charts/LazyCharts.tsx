'use client'

import dynamic from 'next/dynamic'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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

// Chart Components - Lazy loaded with next/dynamic for SSR compatibility
export const LazyLineChart = dynamic(
    () => import('recharts').then(mod => mod.LineChart),
    {
        loading: () => <ChartSkeleton />,
        ssr: false, // Charts don't need SSR
    }
)

export const LazyBarChart = dynamic(
    () => import('recharts').then(mod => mod.BarChart),
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

export const LazyPieChart = dynamic(
    () => import('recharts').then(mod => mod.PieChart),
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

export const LazyAreaChart = dynamic(
    () => import('recharts').then(mod => mod.AreaChart),
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

export const LazyComposedChart = dynamic(
    () => import('recharts').then(mod => mod.ComposedChart),
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

// Chart Elements - Lazy loaded
export const Line = dynamic(() => import('recharts').then(mod => mod.Line))
export const Bar = dynamic(() => import('recharts').then(mod => mod.Bar))
export const Pie = dynamic(() => import('recharts').then(mod => mod.Pie))
export const Area = dynamic(() => import('recharts').then(mod => mod.Area))
export const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis))
export const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis))
export const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid))
export const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip))
export const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer))
export const Cell = dynamic(() => import('recharts').then(mod => mod.Cell))

// Legend - Static export (small component, no need for lazy loading)
export { Legend as ChartLegend } from 'recharts'

// Chart Bundle Preloader
export const preloadChartBundle = () =>
    // Preload the entire recharts bundle when user interacts with dashboard
    import('recharts')

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
