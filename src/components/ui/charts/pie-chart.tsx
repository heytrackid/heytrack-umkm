import { lazy, memo, Suspense } from 'react'

import { useResponsive } from '@/hooks/useResponsive'

import { BaseMobileChart } from '@/components/ui/charts/base-chart'
import { MobileTooltip } from '@/components/ui/charts/mobile-tooltip'
import { type BaseMobileChartProps, CHART_COLORS } from '@/components/ui/charts/types'

import type { PieLabelRenderProps } from 'recharts'

// Lazy load recharts components using shared bundle
// ✅ Correct pattern for named exports with React.lazy
const Pie = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.Pie }))
  .catch((error) => {
    console.error('Failed to load recharts Pie:', error)
    throw error
  }))
const PieChart = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.PieChart }))
  .catch((error) => {
    console.error('Failed to load recharts PieChart:', error)
    throw error
  }))
const Cell = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.Cell }))
  .catch((error) => {
    console.error('Failed to load recharts Cell:', error)
    throw error
  }))
const Tooltip = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.Tooltip }))
  .catch((error) => {
    console.error('Failed to load recharts Tooltip:', error)
    throw error
  }))
const Legend = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.Legend }))
  .catch((error) => {
    console.error('Failed to load recharts Legend:', error)
    throw error
  }))
const ResponsiveContainer = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.ResponsiveContainer }))
  .catch((error) => {
    console.error('Failed to load recharts ResponsiveContainer:', error)
    throw error
  }))

/**
 * Mobile Pie Chart Component
 * Optimized pie chart for mobile devices
 */


interface MobilePieChartProps extends BaseMobileChartProps {
  valueKey: string
  _nameKey: string
  colors?: string[]
  showLabels?: boolean
  innerRadius?: number
}

/**
 * MobilePieChart - Optimized with React.memo
 * Prevents unnecessary re-renders when data hasn't changed
 */
const MobilePieChart = memo(({
  data,
  valueKey,
  _nameKey,
  colors = CHART_COLORS.rainbow,
  showLabels = true,
  innerRadius = 0,
  ...baseProps
}: MobilePieChartProps) => {
  const { isMobile } = useResponsive()

  const renderLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius: propsInnerRadius, outerRadius: propsOuterRadius, percent } = props
    const percentValue = typeof percent === 'number' ? percent : 0
    if (!showLabels || percentValue < 0.05) { return null } // Don't show labels for slices < 5%

    const RADIAN = Math.PI / 180
    const innerR = typeof propsInnerRadius === 'number' ? propsInnerRadius : 0
    const outerR = typeof propsOuterRadius === 'number' ? propsOuterRadius : 0
    const radius = innerR + (outerR - innerR) * 0.5
    const cxValue = typeof cx === 'number' ? cx : 0
    const cyValue = typeof cy === 'number' ? cy : 0
    const midAngleValue = typeof midAngle === 'number' ? midAngle : 0
    const x = cxValue + radius * Math.cos(-midAngleValue * RADIAN)
    const y = cyValue + radius * Math.sin(-midAngleValue * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cxValue ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={isMobile ? 10 : 12}
        fontWeight="medium"
      >
        {`${(percentValue * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <BaseMobileChart {...baseProps} data={data}>
      <Suspense fallback={<div className="h-full w-full bg-muted animate-pulse rounded" />}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={isMobile ? 80 : 100}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey={valueKey}
            >
              {data.map((_, _index) => (
                <Cell
                  key={`cell-${_index}`}
                  fill={colors[_index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<MobileTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Suspense>
    </BaseMobileChart>
  )
}, (prevProps: MobilePieChartProps, nextProps: MobilePieChartProps) => prevProps['data'] === nextProps['data'] && prevProps.valueKey === nextProps.valueKey)

MobilePieChart.displayName = 'MobilePieChart'

export { MobilePieChart }
