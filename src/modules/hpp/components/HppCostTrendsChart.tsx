'use client'

import { useMemo } from 'react'
import { LazyAreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis, ChartLegend, ResponsiveContainer } from '@/components/charts/LazyCharts'
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent'
import clsx from 'clsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency as formatCurrencyUtil } from '@/lib/currency'
import { useCurrency } from '@/hooks/useCurrency'
import type { Currency } from '@/shared'
import { uiLogger } from '@/lib/logger'





export interface HppCostTrendPoint {
  date: string
  averageHpp: number
  bestHpp?: number
  worstHpp?: number
  recipeCount?: number
}

interface HppCostTrendsChartProps {
  data?: HppCostTrendPoint[]
  height?: number
  className?: string
  showLegend?: boolean
  currency?: Currency
}

const generateFallbackData = (): HppCostTrendPoint[] => Array.from({ length: 14 }, (_, idx) => {
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() - (13 - idx))
  const averageHpp = 25000 + Math.random() * 8000
  const spread = 2000 + Math.random() * 2000
  return {
    date: baseDate.toISOString().split('T')[0] || '',
    averageHpp,
    bestHpp: averageHpp - spread,
    worstHpp: averageHpp + spread,
    recipeCount: 10 + Math.floor(Math.random() * 8)
  }
})

export const HppCostTrendsChart = ({
  data,
  height = 320,
  className,
  showLegend = true,
  currency
}: HppCostTrendsChartProps) => {
  const { currency: defaultCurrency } = useCurrency()
  const resolvedCurrency = currency || defaultCurrency

  const chartData = useMemo(() => {
    if (data && data.length > 0) { return data }
    uiLogger.debug('HppCostTrendsChart: using fallback data')
    return generateFallbackData()
  }, [data])

  const formatCurrencyValue = (value: number) => formatCurrencyUtil(value, resolvedCurrency)

  return (
    <Card className={clsx('h-full', className)}>
      <CardHeader>
        <CardTitle>HPP Cost Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <ResponsiveContainer width="100%" height={height}>
          <LazyAreaChart data={chartData} margin={{ top: 16, right: 24, left: 12, bottom: 8 }}>
            <defs>
              <linearGradient id="hppAverage" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="hppBest" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="hppWorst" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis
              tickFormatter={formatCurrencyValue}
              tickMargin={12}
              width={90}
              fontSize={12}
            />
            <Tooltip
              formatter={(value: ValueType) => formatCurrencyValue(Number(value))}
              labelFormatter={(value: string) => `Tanggal: ${value}`}
            />
            {showLegend && <ChartLegend formatter={(value) => legendLabel(String(value))} />}
            <Area
              type="monotone"
              dataKey="bestHpp"
              stroke="var(--success)"
              fill="url(#hppBest)"
              name="HPP Terbaik"
            />
            <Area
              type="monotone"
              dataKey="averageHpp"
              stroke="var(--primary)"
              fill="url(#hppAverage)"
              name="HPP Rata-rata"
            />
            <Area
              type="monotone"
              dataKey="worstHpp"
              stroke="var(--destructive)"
              fill="url(#hppWorst)"
              name="HPP Terburuk"
            />
          </LazyAreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

const legendLabel = (key: string) => {
  switch (key) {
    case 'bestHpp':
      return 'HPP Terbaik'
    case 'averageHpp':
      return 'HPP Rata-rata'
    case 'worstHpp':
      return 'HPP Terburuk'
    default:
      return key
  }
}

export default HppCostTrendsChart
