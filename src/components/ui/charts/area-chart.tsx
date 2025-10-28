/**
 * Mobile Area Chart Component
 * Optimized area chart for mobile devices
 */

import { memo } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BaseMobileChart } from './base-chart'
import { MobileTooltip } from './mobile-tooltip'
import { type BaseMobileChartProps, CHART_COLORS } from './types'

interface MobileAreaChartProps extends BaseMobileChartProps {
  xKey: string
  areas: Array<{
    key: string
    name: string
    color?: string
  }>
  showGrid?: boolean
  stacked?: boolean
}

/**
 * MobileAreaChart - Optimized with React.memo
 * Prevents unnecessary re-renders when data hasn't changed
 */
export const MobileAreaChart = memo(({
  data,
  xKey,
  areas,
  showGrid = true,
  stacked = false,
  ...baseProps
}: MobileAreaChartProps) => {
  const { isMobile } = useResponsive()

  return (
    <BaseMobileChart {...baseProps} data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: isMobile ? 10 : 30,
            left: isMobile ? 10 : 20,
            bottom: 0
          }}
          stackOffset={stacked ? 'expand' : undefined}
        >
          <defs>
            {areas.map((area, _index) => (
              <linearGradient
                key={area.key}
                id={`gradient-${area.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={area.color || CHART_COLORS.primary[_index]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={area.color || CHART_COLORS.primary[_index]}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          )}
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={isMobile ? 40 : 60}
          />
          <Tooltip content={<MobileTooltip />} />
          {areas.map((area, _index) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              stackId={stacked ?"1" : undefined}
              stroke={area.color || CHART_COLORS.primary[_index]}
              fill={`url(#gradient-${area.key})`}
              strokeWidth={isMobile ? 2 : 3}
              name={area.name}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </BaseMobileChart>
  )
}, (prevProps: MobileAreaChartProps, nextProps: MobileAreaChartProps) => prevProps.data === nextProps.data && prevProps.areas === nextProps.areas)
