'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface InventoryTrendsChartProps {
  data?: Array<{
    month: string
    stockIn: number
    stockOut: number
    waste: number
    remaining: number
  }>
  height?: number
}

const defaultInventoryData = [
  {
    month: "Jan",
    stockIn: 4000,
    stockOut: 2400,
    waste: 240,
    remaining: 3760,
  },
  {
    month: "Feb",
    stockIn: 3000,
    stockOut: 1398,
    waste: 221,
    remaining: 5141,
  },
  {
    month: "Mar",
    stockIn: 2000,
    stockOut: 9800,
    waste: 329,
    remaining: 2812,
  },
  {
    month: "Apr",
    stockIn: 2780,
    stockOut: 3908,
    waste: 200,
    remaining: 1672,
  },
  {
    month: "May",
    stockIn: 1890,
    stockOut: 4800,
    waste: 181,
    remaining: 4581,
  },
  {
    month: "Jun",
    stockIn: 2390,
    stockOut: 3800,
    waste: 250,
    remaining: 4731,
  },
]

const chartConfig = {
  stockIn: {
    label: "Stok Masuk",
    color: "hsl(var(--chart-1))",
  },
  stockOut: {
    label: "Stok Keluar",
    color: "hsl(var(--chart-2))",
  },
  waste: {
    label: "Waste",
    color: "hsl(var(--destructive))",
  },
  remaining: {
    label: "Sisa Stok",
    color: "hsl(var(--chart-4))",
  },
}

export function InventoryTrendsChart({ 
  data = defaultInventoryData,
  height = 400 
}: InventoryTrendsChartProps) {
  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
        height={height}
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
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          dataKey="stockIn"
          type="monotone"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="stockOut"
          type="monotone"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="waste"
          type="monotone"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="remaining"
          type="monotone"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
        />
        <Legend 
          content={({ payload }) => (
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {payload?.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.value === 'stockIn' ? 'Stok Masuk' : 
                     entry.value === 'stockOut' ? 'Stok Keluar' :
                     entry.value === 'waste' ? 'Waste' :
                     entry.value === 'remaining' ? 'Sisa Stok' : entry.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        />
      </LineChart>
    </ChartContainer>
  )
}

export default InventoryTrendsChart