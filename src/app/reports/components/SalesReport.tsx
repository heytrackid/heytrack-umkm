'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChartComponent, type ChartConfig } from '@/components/ui/charts'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { memo, useCallback, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { CheckCircle, Clock, DollarSign, ShoppingCart } from '@/components/icons'
import { StatsCards as UiStatsCards, type StatCardData } from '@/components/ui/stats-cards'
import { useSalesStats } from '@/hooks/useReports'

interface SalesReportProps {
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
}

const SalesReportComponent = ({ dateRange: externalDateRange, onDateRangeChange }: SalesReportProps = {}) => {
  const defaultRange: DateRange = {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  }
  
  const [internalDateRange, setInternalDateRange] = useState<DateRange>(defaultRange)
  
  const dateRange = externalDateRange ?? internalDateRange
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (onDateRangeChange) {
      onDateRangeChange(range)
    } else {
      setInternalDateRange(range ?? defaultRange)
    }
  }

  const { data: salesStats, isLoading } = useSalesStats(
    dateRange?.from || dateRange?.to ? {
      dateRange: {
        ...(dateRange.from && { start: format(dateRange.from, 'yyyy-MM-dd') }),
        ...(dateRange.to && { end: format(dateRange.to, 'yyyy-MM-dd') })
      }
    } : {}
  )

  // Memoize safe stats
  const safeSalesStats = useMemo(() => 
    salesStats ?? { totalOrders: 0, totalRevenue: 0, completedOrders: 0, pendingOrders: 0 },
    [salesStats]
  )

  // Memoize growth calculations
  const { revenueGrowth, orderGrowth } = useMemo(() => ({
    revenueGrowth: 0,
    orderGrowth: 0
  }), [])

  // Memoize currency formatter
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }, [])

  // Chart data for order status breakdown - must be before early returns
  const orderStatusData = useMemo(() => [
    { name: 'Selesai', value: safeSalesStats.completedOrders, fill: 'hsl(142, 76%, 36%)' },
    { name: 'Pending', value: safeSalesStats.pendingOrders, fill: 'hsl(38, 92%, 50%)' },
  ], [safeSalesStats])

  const chartConfig: ChartConfig = useMemo(() => ({
    Selesai: { label: 'Selesai', color: 'hsl(142, 76%, 36%)' },
    Pending: { label: 'Pending', color: 'hsl(38, 92%, 50%)' },
  }), [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32 mb-2" />
                <div className="h-3 bg-muted rounded w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (safeSalesStats.totalOrders === 0) {
    return (
      <EmptyState
        {...EmptyStatePresets.reports}
        actions={[
          {
            label: 'Buat Pesanan',
            href: '/orders/new',
            icon: ShoppingCart
          }
        ]}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold">Laporan Penjualan</h3>
        <DateRangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          placeholder="Pilih periode"
          className="w-full sm:w-auto"
        />
      </div>

      {/* Summary Cards */}
      <UiStatsCards
        stats={([
          {
            title: 'Total Pesanan',
            value: safeSalesStats.totalOrders,
            description: `+${orderGrowth}% dari periode sebelumnya`,
            icon: ShoppingCart,
          },
          {
            title: 'Total Pendapatan',
            value: formatCurrency(safeSalesStats.totalRevenue),
            description: `+${revenueGrowth}% dari periode sebelumnya`,
            icon: DollarSign,
          },
          {
            title: 'Selesai',
            value: safeSalesStats.completedOrders,
            description: 'Diterima pelanggan',
            icon: CheckCircle,
            iconClassName: 'text-green-500',
            valueClassName: 'text-green-600',
          },
          {
            title: 'Pending',
            value: safeSalesStats.pendingOrders,
            description: 'Perlu ditindaklanjuti',
            icon: Clock,
            iconClassName: 'text-orange-500',
            valueClassName: 'text-orange-600',
          },
        ] satisfies StatCardData[])}
        gridClassName="grid grid-cols-2 gap-4 lg:grid-cols-4"
      />

      {/* Charts */}
      {safeSalesStats.totalOrders > 0 && (
        <div className="grid grid-cols-1 gap-4 grid-cols-1 md:grid-cols-2">
          <PieChartComponent
            data={orderStatusData}
            title="Status Pesanan"
            description="Distribusi status pesanan"
            dataKey="value"
            nameKey="name"
            config={chartConfig}
            height={280}
            donut
            showLegend
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Penjualan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Rata-rata per Pesanan</span>
                  <span className="font-bold">
                    {formatCurrency(safeSalesStats.totalOrders > 0 ? safeSalesStats.totalRevenue / safeSalesStats.totalOrders : 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Tingkat Penyelesaian</span>
                  <span className="font-bold text-green-600">
                    {safeSalesStats.totalOrders > 0 
                      ? ((safeSalesStats.completedOrders / safeSalesStats.totalOrders) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm">Pesanan Pending</span>
                  <span className="font-bold text-orange-600">
                    {safeSalesStats.totalOrders > 0 
                      ? ((safeSalesStats.pendingOrders / safeSalesStats.totalOrders) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Memoized export for performance
export const SalesReport = memo(SalesReportComponent)
