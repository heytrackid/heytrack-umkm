'use client'

import { LineChart, Line, BarChart, Bar, ResponsiveContainer } from 'recharts'

interface MiniChartProps {
  data: any[]
  type?: 'line' | 'bar'
  dataKey: string
  color?: string
  height?: number
  className?: string
}

export default function MiniChart({
  data,
  type = 'line',
  dataKey,
  color = '#3b82f6',
  height = 60,
  className = ''
}: MiniChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded ${className}`}
        style={{ height }}
      >
        <span className="text-xs text-gray-400">No data</span>
      </div>
    )
  }

  return (
    <div className={className} style={{ height }}>
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
    </div>
  )
}