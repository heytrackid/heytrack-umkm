// @ts-nocheck
'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import recharts components to reduce bundle size
const LineChart = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.LineChart),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse rounded" />
  }
)
const Line = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.Line),
  { ssr: false }
)
const BarChart = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.BarChart),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse rounded" />
  }
)
const Bar = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.Bar),
  { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import(/* webpackChunkName: "recharts" */ 'recharts').then(mod => mod.ResponsiveContainer),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse rounded" />
  }
)

interface MiniChartCoreProps {
  data: unknown[]
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
    <div className={className} style={{ height }}>
      <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse rounded" />}>
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
      </Suspense>
    </div>
  )
}
