'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { logger } from '@/lib/logger'





// Use shared recharts bundle to reduce bundle size
const LineChart = dynamic(
  () => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
    .then(mod => mod.LineChart)
    .catch((error) => {
      logger.error({ error }, 'Failed to load recharts LineChart')
      return { default: () => <div className="w-full h-full bg-red-100 rounded flex items-center justify-center text-red-600 text-xs">Chart failed</div> }
    }),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse rounded" />
  }
)
const Line = dynamic(
  () => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
    .then(mod => mod.Line)
    .catch((error) => {
      logger.error({ error }, 'Failed to load recharts Line')
      return { default: () => null }
    }),
  { ssr: false }
)
const BarChart = dynamic(
  () => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
    .then(mod => mod.BarChart)
    .catch((error) => {
      logger.error({ error }, 'Failed to load recharts BarChart')
      return { default: () => <div className="w-full h-full bg-red-100 rounded flex items-center justify-center text-red-600 text-xs">Chart failed</div> }
    }),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse rounded" />
  }
)
const Bar = dynamic(
  () => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
    .then(mod => mod.Bar)
    .catch((error) => {
      logger.error({ error }, 'Failed to load recharts Bar')
      return { default: () => null }
    }),
  { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
    .then(mod => mod.ResponsiveContainer)
    .catch((error) => {
      logger.error({ error }, 'Failed to load recharts ResponsiveContainer')
      return { default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }
    }),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse rounded" />
  }
)

interface MiniChartCoreProps {
  data: unknown[]
  type?: 'bar' | 'line'
  dataKey: string
  color?: string
  height?: number
  className?: string
}

export const MiniChartCore = ({
  data,
  type = 'line',
  dataKey,
  color = '#3b82f6',
  height = 60,
  className = ''
}: MiniChartCoreProps): JSX.Element => (
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

