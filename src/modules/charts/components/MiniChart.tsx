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
  () => import(/* webpackChunkName: "mini-chart-core" */ './MiniChartCore'),
  {
    loading: () => (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded animate-pulse">
        <span className="text-xs text-gray-400">Loading chart...</span>
      </div>
    ),
    ssr: false
  }
)

const MiniChart = (props: MiniChartProps): JSX.Element => {
  const { data, height = 60, className = '' } = props

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded ${className}`}
        style={{ height }}
      >
        <span className="text-xs text-gray-400">Tidak ada data</span>
      </div>
    )
  }

  return (
    <div className={className} style={{ height }}>
      <Suspense fallback={
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{ height }}>
          <span className="text-xs text-gray-400">Loading...</span>
        </div>
      }>
        <DynamicChart {...props} />
      </Suspense>
    </div>
  )
}

export default MiniChart
