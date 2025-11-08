'use client'

import { memo } from 'react'
import { useMemo } from 'react'
import { Line, LineChart, Area, AreaChart, Bar, BarChart, ResponsiveContainer } from 'recharts'

import { cn } from '@/lib/utils'

import { type ChartDataPoint, CHART_COLORS } from './types'

/**
 * Mini Chart Component
 * Small charts for dashboard cards
 */


interface MiniChartProps {
  data: ChartDataPoint[]
  type: 'area' | 'bar' | 'line'
  dataKey: string
  color?: string
  className?: string
  height?: number
}

/**
 * MiniChart - Optimized with React.memo
 * Prevents unnecessary re-renders for dashboard mini charts
 */
export const MiniChart = memo(({
  data,
  type,
  dataKey,
  color = CHART_COLORS.primary[0],
  className,
  height = 60
}: MiniChartProps) => {
  const ChartComponent = useMemo(() => {
    if (type === 'line') return LineChart
    if (type === 'area') return AreaChart
    return BarChart
  }, [type])

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          {type === 'line' && (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          )}
          {type === 'area' && (
            <>
              <defs>
                <linearGradient id="miniAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill="url(#miniAreaGradient)"
                dot={false}
              />
            </>
          )}
          {type === 'bar' && (
            <Bar dataKey={dataKey} fill={color} radius={2} />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}, (prevProps: MiniChartProps, nextProps: MiniChartProps) => prevProps['data'] === nextProps['data'] && prevProps['type'] === nextProps['type'])

MiniChart.displayName = 'MiniChart'

export default memo(MiniChart)
