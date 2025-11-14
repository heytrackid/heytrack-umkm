 
import { lazy, memo, Suspense } from 'react'

import { useResponsive } from '@/hooks/useResponsive'

import { BaseMobileChart } from '@/components/ui/charts/base-chart'
import { MobileTooltip } from '@/components/ui/charts/mobile-tooltip'
import { type BaseMobileChartProps, CHART_COLORS } from '@/components/ui/charts/types'

// Lazy load recharts components
// ✅ Correct pattern for named exports with React.lazy using shared recharts bundle
const Bar = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.Bar }))
  .catch((error) => {
    console.error('Failed to load recharts Bar:', error)
    throw error
  }))
const BarChart = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.BarChart }))
  .catch((error) => {
    console.error('Failed to load recharts BarChart:', error)
    throw error
  }))
const CartesianGrid = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.CartesianGrid }))
  .catch((error) => {
    console.error('Failed to load recharts CartesianGrid:', error)
    throw error
  }))
const ResponsiveContainer = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.ResponsiveContainer }))
  .catch((error) => {
    console.error('Failed to load recharts ResponsiveContainer:', error)
    throw error
  }))
const Tooltip = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.Tooltip }))
  .catch((error) => {
    console.error('Failed to load recharts Tooltip:', error)
    throw error
  }))
const XAxis = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.XAxis }))
  .catch((error) => {
    console.error('Failed to load recharts XAxis:', error)
    throw error
  }))
const YAxis = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.YAxis }))
  .catch((error) => {
    console.error('Failed to load recharts YAxis:', error)
    throw error
  }))

/**
 * Mobile Bar Chart Component
 * Optimized bar chart for mobile devices
 */


interface MobileBarChartProps extends BaseMobileChartProps {
  xKey: string
  bars: Array<{
    key: string
    name: string
    color?: string
  }>
  showGrid?: boolean
  horizontal?: boolean
}

/**
 * MobileBarChart - Optimized with React.memo
 * Prevents unnecessary re-renders when data hasn't changed
 */
const MobileBarChart = memo(({
  data,
  xKey,
  bars,
  showGrid = true,
  horizontal = false,
  ...baseProps
}: MobileBarChartProps) => {
  const { isMobile } = useResponsive()

  return (
    <BaseMobileChart {...baseProps} data={data}>
      <Suspense fallback={<div className="h-full w-full bg-muted animate-pulse rounded" />}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={horizontal ? "horizontal" : "vertical"}
            margin={{
              top: 5,
              right: isMobile ? 10 : 30,
              left: isMobile ? 10 : 20,
              bottom: 5
            }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            )}
            <XAxis
              dataKey={horizontal ? undefined : xKey}
              type={horizontal ? "number" : "category"}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis
              dataKey={horizontal ? xKey : undefined}
              type={horizontal ? "category" : "number"}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={horizontal ? (isMobile ? 60 : 80) : (isMobile ? 40 : 60)}
            />
            <Tooltip content={<MobileTooltip />} />
            {bars.map((bar, _index) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                fill={bar.color ?? CHART_COLORS.primary[_index % CHART_COLORS.primary.length]}
                radius={isMobile ? 4 : 6}
                name={bar.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Suspense>
    </BaseMobileChart>
  )
}, (prevProps: MobileBarChartProps, nextProps: MobileBarChartProps) => prevProps['data'] === nextProps['data'] && prevProps.bars === nextProps.bars)

MobileBarChart.displayName = 'MobileBarChart'

export { MobileBarChart }
