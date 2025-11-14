'use client'

import { lazy, Suspense, useState } from 'react'
import { logger } from '@/lib/logger'

// ✅ Correct pattern for named exports with React.lazy using shared recharts bundle
const Area = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.Area }))
  .catch((error) => {
    logger.error({ error }, 'Failed to load recharts Area')
    throw error
  }))
const AreaChart = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.AreaChart }))
  .catch((error) => {
    logger.error({ error }, 'Failed to load recharts AreaChart')
    throw error
  }))
const CartesianGrid = lazy(() => import(/* webpackChunkName: "recharts-lib" */ 'recharts')
  .then(mod => ({ default: mod.CartesianGrid }))
  .catch((error) => {
    logger.error({ error }, 'Failed to load recharts CartesianGrid')
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
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface ChartAreaInteractiveProps {
  data: Array<{ date: string; [key: string]: number | string }>
  title?: string
  description?: string
  config: ChartConfig
  timeRanges?: Array<{ value: string; label: string; days: number }>
}

export const ChartAreaInteractive = ({
  data,
  title = 'Area Chart - Interactive',
  description = 'Showing data trends',
  config,
  timeRanges = [
    { value: '90d', label: 'Last 3 months', days: 90 },
    { value: '30d', label: 'Last 30 days', days: 30 },
    { value: '7d', label: 'Last 7 days', days: 7 },
  ],
}: ChartAreaInteractiveProps) => {
  const [timeRange, setTimeRange] = useState(timeRanges[0]?.value || '90d')

  const filteredData = data.filter((item) => {
    const date = new Date(item.date as string)
    const referenceDate = new Date(data[data.length - 1]?.date as string)
    const selectedRange = timeRanges.find((r) => r.value === timeRange)
    const daysToSubtract = selectedRange?.days || 90
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const chartKeys = Object.keys(config).filter((key) => key !== 'visitors')

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder={timeRanges[0]?.label} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value} className="rounded-lg">
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <Suspense fallback={<div className="h-[250px] bg-muted animate-pulse" />}>
          <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
            <AreaChart data={filteredData}>
              <defs>
                {chartKeys.map((key) => (
                  <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
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
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value: unknown) => {
                      return new Date(value as string).toLocaleDateString('id-ID', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              {chartKeys.map((key) => (
                <Area
                  key={key}
                  dataKey={key}
                  type="natural"
                  fill={`url(#fill${key})`}
                  stroke={`var(--color-${key})`}
                  stackId="a"
                />
              ))}
              <ChartLegend content={<ChartLegendContent payload={[]} />} />
            </AreaChart>
          </ChartContainer>
        </Suspense>
      </CardContent>
    </Card>
  )
}
