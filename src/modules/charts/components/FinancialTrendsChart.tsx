'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

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

export default function FinancialTrendsChart() {
  return (
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
          tickFormatter={(value) => `Rp ${value.toLocaleString()}`}
        />
        <ChartTooltip 
          cursor={false} 
          content={<ChartTooltipContent 
            formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, null]}
          />} 
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
                    {entry.value === 'revenue' ? 'Pendapatan' : 
                     entry.value === 'expenses' ? 'Pengeluaran' :
                     entry.value === 'profit' ? 'Keuntungan' :
                     entry.value === 'hpp' ? 'HPP' : entry.value}
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