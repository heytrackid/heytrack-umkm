'use client'

 
import dynamic from 'next/dynamic'
import { Legend } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type TrendChartConfig = Record<string, { label: string; color: string }>

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
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse rounded" />
  }
)

/**
 * Inventory trend data point
 */
interface InventoryTrendDataPoint {
  month: string
  stock: number
  purchases: number
  usage: number
  waste: number
}

const inventoryData: InventoryTrendDataPoint[] = [
  {
    month: "Jan",
    stock: 850,
    purchases: 1200,
    usage: 1100,
    waste: 50,
  },
  {
    month: "Feb",
    stock: 950,
    purchases: 1500,
    usage: 1300,
    waste: 80,
  },
  {
    month: "Mar",
    stock: 1150,
    purchases: 1800,
    usage: 1600,
    waste: 70,
  },
  {
    month: "Apr",
    stock: 1350,
    purchases: 1600,
    usage: 1400,
    waste: 60,
  },
  {
    month: "May",
    stock: 1550,
    purchases: 2000,
    usage: 1800,
    waste: 90,
  },
  {
    month: "Jun",
    stock: 1660,
    purchases: 1900,
    usage: 1700,
    waste: 110,
  },
]

/**
 * Props for InventoryTrendsChart component
 */
interface InventoryTrendsChartProps {
  data?: InventoryTrendDataPoint[]
  config?: TrendChartConfig
  height?: number
  className?: string
}

const chartConfig: TrendChartConfig = {
  stock: {
    label: "Stok Tersedia",
    color: "#22c55e",
  },
  purchases: {
    label: "Pembelian",
    color: "#3b82f6",
  },
  usage: {
    label: "Pemakaian",
    color: "#f59e0b",
  },
  waste: {
    label: "Waste",
    color: "#ef4444",
  },
}

export default function InventoryTrendsChart({
  data = inventoryData,
  config = chartConfig,
  height = 400,
  className
}: InventoryTrendsChartProps) {
  return (
    <ChartContainer _config={config} className={className}>
      <ResponsiveContainer width="100%" height={height}>
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
            tickFormatter={(value) => `${value}`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent />}
          />
          <Line
            dataKey="stock"
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
            dataKey="purchases"
            type="monotone"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          <Line
            dataKey="usage"
            type="monotone"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={false}
          />
          <Line
            dataKey="waste"
            type="monotone"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{
              fill: "#ef4444",
              strokeWidth: 2,
              r: 3,
            }}
          />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
