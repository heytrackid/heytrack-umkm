import { memo } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { BaseMobileChart } from './base-chart'
import { MobileTooltip } from './mobile-tooltip'
import { type BaseMobileChartProps, CHART_COLORS } from './types'

/**
 * Mobile Line Chart Component
 * Optimized line chart for mobile devices
 */


interface MobileLineChartProps extends BaseMobileChartProps {
  xKey: string
  lines: Array<{
    key: string
    name: string
    color?: string
    strokeWidth?: number
  }>
  showGrid?: boolean
  showLegend?: boolean
  curved?: boolean
}

/**
 * MobileLineChart - Optimized with React.memo
 * Prevents unnecessary re-renders when data hasn't changed
 */
export const MobileLineChart = memo(({
  data,
  xKey,
  lines,
  showGrid = true,
  showLegend = true,
  curved = true,
  ...baseProps
}: MobileLineChartProps) => {
  const { isMobile } = useResponsive()

  return (
    <BaseMobileChart {...baseProps} data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: isMobile ? 10 : 30,
            left: isMobile ? 10 : 20,
            bottom: 5
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
            />
          )}
          <XAxis
            dataKey={xKey}
            className="text-xs"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <YAxis
            className="text-xs"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={isMobile ? 40 : 60}
          />
          <Tooltip content={<MobileTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: isMobile ? '12px' : '14px' }}
            />
          )}
          {lines.map((line, _index) => (
            <Line
              key={line.key}
              type={curved ? "monotone" : "linear"}
              dataKey={line.key}
              stroke={line.color || CHART_COLORS.primary[_index % CHART_COLORS.primary.length]}
              strokeWidth={line.strokeWidth || (isMobile ? 2 : 3)}
              dot={{ fill: line.color || CHART_COLORS.primary[_index], strokeWidth: 0, r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 0 }}
              name={line.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </BaseMobileChart>
  )
}, (prevProps: MobileLineChartProps, nextProps: MobileLineChartProps) => prevProps.data === nextProps.data && prevProps.lines === nextProps.lines)
