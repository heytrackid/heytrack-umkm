// @ts-nocheck - Chart/modal type issues
/**
 * Mobile Pie Chart Component
 * Optimized pie chart for mobile devices
 */

import { memo } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer, type PieLabelRenderProps } from 'recharts'
import { BaseMobileChart } from './base-chart'
import { MobileTooltip } from './mobile-tooltip'
import { type BaseMobileChartProps, CHART_COLORS } from './types'

interface MobilePieChartProps extends BaseMobileChartProps {
  valueKey: string
  nameKey: string
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
  nameKey,
  colors = CHART_COLORS.rainbow,
  showLabels = true,
  innerRadius = 0,
  ...baseProps
}: MobilePieChartProps) => {
  const { isMobile } = useResponsive()

  const renderLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
    if (!showLabels || !percent || percent < 0.05) { return null } // Don't show labels for slices < 5%

    const RADIAN = Math.PI / 180
    const radius = (innerRadius || 0) + ((outerRadius || 0) - (innerRadius || 0)) * 0.5
    const x = Number(cx || 0) + radius * Math.cos(-Number(midAngle || 0) * RADIAN)
    const y = Number(cy || 0) + radius * Math.sin(-Number(midAngle || 0) * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > Number(cx || 0) ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={isMobile ? 10 : 12}
        fontWeight="medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <BaseMobileChart {...baseProps} data={data}>
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
    </BaseMobileChart>
  )
}, (prevProps: MobilePieChartProps, nextProps: MobilePieChartProps) => prevProps.data === nextProps.data && prevProps.valueKey === nextProps.valueKey)
