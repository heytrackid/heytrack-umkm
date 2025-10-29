/**
 * Lazy-loaded Chart Components
 * Reduces initial bundle size by loading charts only when needed
 */

'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Loading component for charts
const ChartSkeleton = () => (
    <div className="space-y-3">
        <Skeleton className="h-[300px] w-full" />
        <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
        </div>
    </div>
)

// Lazy load Line Chart
export const LazyLineChart = dynamic(
    () => import('recharts').then(mod => ({
        default: mod.LineChart
    })),
    {
        loading: () => <ChartSkeleton />,
        ssr: false, // Charts don't need SSR
    }
)

// Lazy load Bar Chart
export const LazyBarChart = dynamic(
    () => import('recharts').then(mod => ({
        default: mod.BarChart
    })),
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

// Lazy load Pie Chart
export const LazyPieChart = dynamic(
    () => import('recharts').then(mod => ({
        default: mod.PieChart
    })),
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

// Lazy load Area Chart
export const LazyAreaChart = dynamic(
    () => import('recharts').then(mod => ({
        default: mod.AreaChart
    })),
    {
        loading: () => <ChartSkeleton />,
        ssr: false,
    }
)

// Export other Recharts components
export const Line = dynamic(() => import('recharts').then(mod => ({ default: mod.Line })))
export const Bar = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar })))
export const Pie = dynamic(() => import('recharts').then(mod => ({ default: mod.Pie })))
export const Area = dynamic(() => import('recharts').then(mod => ({ default: mod.Area })))
export const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })))
export const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })))
export const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })))
export const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })))
export const ChartLegend = dynamic(() => import('recharts').then(mod => mod.Legend), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})
export const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })))
export const Cell = dynamic(() => import('recharts').then(mod => ({ default: mod.Cell })))

/**
 * Wrapper component for lazy-loaded charts with error boundary
 */
interface LazyChartWrapperProps {
    title?: string
    description?: string
    children: React.ReactNode
}

export function LazyChartWrapper({ title, description, children }: LazyChartWrapperProps) {
    return (
        <Card>
            {(title || description) && (
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </CardHeader>
            )}
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}
