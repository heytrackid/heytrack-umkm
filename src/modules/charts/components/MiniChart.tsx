'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'





export interface MiniChartProps {
  data: unknown[]
  type?: 'bar' | 'line'
  dataKey: string
  color?: string
  height?: number
  className?: string
}

// Dynamically import Recharts to reduce initial bundle size
const DynamicChart = dynamic(
  () => import(/* webpackChunkName: "mini-chart-core" */ './MiniChartCore')
    .then(m => ({ default: m.MiniChartCore }))
    .catch((error) => {
      console.error('Failed to load MiniChartCore:', error)
      return { default: () => (
        <div className="flex items-center justify-center bg-red-100 rounded text-red-600 text-xs">
          Failed to load chart
        </div>
      ) }
    }),
  {
    loading: () => (
      <div className="flex items-center justify-center bg-muted rounded animate-pulse">
        <span className="text-xs text-muted-foreground">Loading chart...</span>
      </div>
    ),
    ssr: false
  }
)

export const MiniChart = (props: MiniChartProps): JSX.Element => {
  const { data, height = 60, className = '' } = props

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded ${className}`}
        style={{ height }}
      >
        <span className="text-xs text-muted-foreground">Tidak ada data</span>
      </div>
    )
  }

  return (
    <div className={className} style={{ height }}>
      <Suspense fallback={
        <div className="flex items-center justify-center bg-muted rounded animate-pulse" style={{ height }}>
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      }>
        <DynamicChart {...props} />
      </Suspense>
    </div>
  )
}

