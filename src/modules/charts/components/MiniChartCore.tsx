'use client'

import { LineChart, Line, BarChart, Bar, ResponsiveContainer } from 'recharts'

interface MiniChartCoreProps {
  data: any[]
  type?: 'line' | 'bar'
  dataKey: string
  color?: string
  height?: number
  className?: string
}

export default function MiniChartCore({
  data,
  type = 'line',
  dataKey,
  color = '#3b82f6',
  height = 60,
  className = ''
}: MiniChartCoreProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {type === 'line' ? (
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <Bar dataKey={dataKey} fill={color} />
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}