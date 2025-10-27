'use client'

import { lazy, Suspense } from 'react'
import dynamic from 'next/dynamic'

interface MiniChartProps {
  data: unknown[]
  type?: 'line' | 'bar'
  dataKey: string
  color?: string
  height?: number
  className?: string
}

// Dynamically import Recharts to reduce initial bundle size
const DynamicChart = dynamic(
  () => import('./MiniChartCore'),
  {
    loading: () => (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded animate-pulse">
        <span className="text-xs text-gray-400">Loading chart...</span>
      </div>
    ),
    ssr: false
  }
)

export default function MiniChart(props: MiniChartProps) {
  const { data, height = 60, className = '' } = props

  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded ${className}`}
        style={{ height }}
      >
        <span className="text-xs text-gray-400">No data</span>
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
