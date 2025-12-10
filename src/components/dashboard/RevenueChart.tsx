'use client'

import { subDays } from 'date-fns'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrency } from '@/hooks/useCurrency'

interface RevenueData {
  date: string
  revenue: number
  orders: number
  expenses?: number
  [key: string]: string | number | undefined
}

interface RevenueChartProps {
  data?: RevenueData[] | undefined
  className?: string | undefined
  isLoading?: boolean
}

export function RevenueChart({ data, className, isLoading = false }: RevenueChartProps) {
  const { formatCurrency } = useCurrency()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  // Use provided data only - no mock data
  const chartData = useMemo(() => {
    return data && data.length > 0 ? data : []
  }, [data])



  const chartConfig = {
    revenue: {
      label: 'Pendapatan',
      color: 'hsl(142, 76%, 36%)', // green
    },
    expenses: {
      label: 'Pengeluaran',
      color: 'hsl(0, 84%, 60%)', // red
    },
    orders: {
      label: 'Pesanan',
      color: 'hsl(221, 83%, 53%)', // blue
    },
  }

  // Calculate totals
  const totals = useMemo(() => {
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0)
    const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0)
    const totalExpenses = chartData.reduce((sum, d) => sum + (d.expenses || 0), 0)
    return { totalRevenue, totalOrders, totalExpenses }
  }, [chartData])

  const hasData = chartData.length > 0

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-base sm:text-lg">Tren Pendapatan</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {isLoading ? (
              <>Memuat data...</>
            ) : hasData ? (
              <>Total: {formatCurrency(totals.totalRevenue)} dari {totals.totalOrders} pesanan</>
            ) : (
              <>Belum ada data pendapatan</>
            )}
          </CardDescription>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="w-full sm:w-auto"
        />
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm">Memuat data chart...</p>
            </div>
          </div>
        ) : !hasData ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">Belum ada data untuk ditampilkan</p>
              <p className="text-xs mt-1">Buat order pertama Anda untuk melihat tren pendapatan</p>
            </div>
          </div>
        ) : (
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="revenue" className="text-xs sm:text-sm">Pendapatan</TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs sm:text-sm">Perbandingan</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm">Pesanan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="mt-4">
            <ChartContainer config={chartConfig} className="w-full" style={{ height: 300 }}>
              <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartConfig.revenue.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartConfig.revenue.color} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke={chartConfig.revenue.color} fill="url(#fillRevenue)" />
              </AreaChart>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="comparison" className="mt-4">
            <ChartContainer config={chartConfig} className="w-full" style={{ height: 300 }}>
              <BarChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="revenue" fill={chartConfig.revenue.color} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill={chartConfig.expenses.color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-4">
            <ChartContainer config={chartConfig} className="w-full" style={{ height: 300 }}>
              <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartConfig.orders.color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartConfig.orders.color} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="orders" stroke={chartConfig.orders.color} fill="url(#fillOrders)" />
              </AreaChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

// Compact version for widgets
export function RevenueChartCompact({ data, className }: RevenueChartProps) {
  const chartData = useMemo(() => {
    return data && data.length > 0 ? data : []
  }, [data])

  const chartConfig = {
    revenue: {
      label: 'Pendapatan',
      color: 'hsl(142, 76%, 36%)',
    },
  }

  const hasData = chartData.length > 0

  return (
    <div className={className}>
      {!hasData ? (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <p className="text-xs">Belum ada data</p>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="w-full" style={{ height: 200 }}>
          <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRevenueCompact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.revenue.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartConfig.revenue.color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="revenue" stroke={chartConfig.revenue.color} fill="url(#fillRevenueCompact)" />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  )
}
