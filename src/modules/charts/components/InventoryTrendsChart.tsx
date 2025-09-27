'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const inventoryData = [
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

const chartConfig = {
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

export default function InventoryTrendsChart() {
  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          accessibilityLayer
          data={inventoryData}
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
            content={<ChartTooltipContent 
              formatter={(value) => [Number(value).toLocaleString('id-ID'), null]}
            />} 
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
          <Legend 
            content={({ payload }) => (
              <div className="flex flex-wrap justify-center gap-6 pt-6">
                {payload?.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {entry.value === 'stock' ? 'Stok Tersedia' : 
                       entry.value === 'purchases' ? 'Pembelian' :
                       entry.value === 'usage' ? 'Pemakaian' :
                       entry.value === 'waste' ? 'Waste' : entry.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}