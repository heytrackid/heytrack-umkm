'use client'

import dynamic from 'next/dynamic'
import { Legend } from 'recharts'
import { formatCurrentCurrency } from '@/lib/currency'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Dynamically import recharts components to reduce bundle size
const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse rounded" />
  }
)
const Line = dynamic(
  () => import('recharts').then(mod => mod.Line),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then(mod => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then(mod => mod.YAxis),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then(mod => mod.CartesianGrid),
  { ssr: false }
)

const financialData = [
  {
    month: "Jan",
    revenue: 12000,
    expenses: 8000,
    profit: 4000,
    hpp: 6000,
  },
  {
    month: "Feb",
    revenue: 15000,
    expenses: 9500,
    profit: 5500,
    hpp: 7500,
  },
  {
    month: "Mar",
    revenue: 18000,
    expenses: 11000,
    profit: 7000,
    hpp: 8800,
  },
  {
    month: "Apr",
    revenue: 16500,
    expenses: 10200,
    profit: 6300,
    hpp: 8100,
  },
  {
    month: "May",
    revenue: 20000,
    expenses: 12000,
    profit: 8000,
    hpp: 9600,
  },
  {
    month: "Jun",
    revenue: 22000,
    expenses: 13000,
    profit: 9000,
    hpp: 10400,
  },
]

const chartConfig = {
  revenue: {
    label: "Pendapatan",
    color: "#22c55e",
  },
  expenses: {
    label: "Pengeluaran",
    color: "#ef4444",
  },
  profit: {
    label: "Keuntungan",
    color: "#3b82f6",
  },
  hpp: {
    label: "HPP",
    color: "#f59e0b",
  },
}

const FinancialTrendsChart = () => (
  <ChartContainer config={chartConfig}>
    <LineChart
      accessibilityLayer
      data={financialData}
      margin={{
        left: 12,
        right: 12,
      }}
    >
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="month"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={(value) => value.slice(0, 3)}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        tickFormatter={(value) => formatCurrentCurrency(Number(value))}
      />
      <ChartTooltip
        cursor={false}
        formatter={(value: number | string) => formatCurrentCurrency(Number(value))}
        content={<ChartTooltipContent />}
      />
      <Line
        dataKey="revenue"
        type="monotone"
        stroke="#22c55e"
        strokeWidth={3}
        dot={{
          fill: "#22c55e",
          strokeWidth: 2,
          r: 4,
        }}
        activeDot={{
          r: 6,
          stroke: "#22c55e",
          strokeWidth: 2,
        }}
      />
      <Line
        dataKey="expenses"
        type="monotone"
        stroke="#ef4444"
        strokeWidth={3}
        dot={{
          fill: "#ef4444",
          strokeWidth: 2,
          r: 4,
        }}
        activeDot={{
          r: 6,
          stroke: "#ef4444",
          strokeWidth: 2,
        }}
      />
      <Line
        dataKey="profit"
        type="monotone"
        stroke="#3b82f6"
        strokeWidth={3}
        dot={{
          fill: "#3b82f6",
          strokeWidth: 2,
          r: 4,
        }}
        activeDot={{
          r: 6,
          stroke: "#3b82f6",
          strokeWidth: 2,
        }}
      />
      <Line
        dataKey="hpp"
        type="monotone"
        stroke="#f59e0b"
        strokeWidth={2}
        strokeDasharray="5 5"
        dot={false}
      />
      <Legend />
    </LineChart>
  </ChartContainer>
)

export default FinancialTrendsChart
