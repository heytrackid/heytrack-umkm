'use client'

import { lazy, Suspense, useMemo, useState } from 'react'
import { logger } from '@/lib/logger'

// ✅ Correct pattern for named exports with React.lazy using shared recharts bundle
const CartesianGrid = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.CartesianGrid }))
  .catch((error) => {
    logger.error({ error }, 'Failed to load recharts CartesianGrid')
    throw error
  }))
const Line = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.Line }))
  .catch((error) => {
    logger.error({ error }, 'Failed to load recharts Line')
    throw error
  }))
const LineChart = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.LineChart }))
  .catch((error) => {
    logger.error({ error }, 'Failed to load recharts LineChart')
    throw error
  }))
const XAxis = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.XAxis }))
  .catch((error) => {
    logger.error({ error }, 'Failed to load recharts XAxis')
    throw error
  }))

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type {
    ChartConfig
} from '@/components/ui/chart'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'

interface ChartLineInteractiveProps {
  data: Array<{ date: string; [key: string]: number | string }>
  title?: string
  description?: string
  config: ChartConfig
  defaultChart?: string
}

export const ChartLineInteractive = ({
  data,
  title = 'Line Chart - Interactive',
  description = 'Showing data trends',
  config,
  defaultChart,
}: ChartLineInteractiveProps) => {
  const chartKeys = Object.keys(config).filter((key) => key !== 'views')
  const [activeChart, setActiveChart] = useState<string>(
    defaultChart || chartKeys[0] || 'desktop'
  )

  const total = useMemo(
    () =>
      chartKeys.reduce(
        (acc, key) => {
          acc[key] = data.reduce((sum, curr) => sum + (Number(curr[key]) || 0), 0)
          return acc
        },
        {} as Record<string, number>
      ),
    [data, chartKeys]
  )

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex">
          {chartKeys.map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-muted-foreground text-xs">
                {config[key]?.label || key}
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {total[key]?.toLocaleString() || 0}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <Suspense fallback={<div className="h-[250px] bg-muted animate-pulse" />}>
          <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
            <LineChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('id-ID', {
                    month: 'short',
                    day: 'numeric',
                  })
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value: unknown) => {
                      return new Date(value as string).toLocaleDateString('id-ID', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    }}
                  />
                }
              />
              <Line
                dataKey={activeChart}
                type="monotone"
                stroke={`var(--color-${activeChart})`}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </Suspense>
      </CardContent>
    </Card>
  )
}
