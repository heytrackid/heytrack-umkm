import { memo, lazy, Suspense } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { BaseMobileChart } from './base-chart'
import { MobileTooltip } from './mobile-tooltip'
import { type BaseMobileChartProps, CHART_COLORS } from './types'
import type { PieLabelRenderProps } from 'recharts'

// Lazy load recharts components
const Pie = lazy(() => import('recharts').then(mod => ({ default: mod.Pie })))
const PieChart = lazy(() => import('recharts').then(mod => ({ default: mod.PieChart })))
const Cell = lazy(() => import('recharts').then(mod => ({ default: mod.Cell })))
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })))
const Legend = lazy(() => import('recharts').then(mod => ({ default: mod.Legend })))
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })))

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
export const MobilePieChart = memo(({
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
              {data.map((_entry, _index) => (
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
}, (prevProps: MobilePieChartProps, nextProps: MobilePieChartProps) => prevProps.data === nextProps.data && prevProps.valueKey === nextProps.valueKey)
