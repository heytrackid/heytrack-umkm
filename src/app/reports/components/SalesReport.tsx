'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChartComponent, type ChartConfig } from '@/components/ui/charts'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { memo, useCallback, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { CheckCircle, Clock, DollarSign, ShoppingCart } from '@/components/icons'
import { useSalesStats } from '@/hooks/api/useReports'

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pesanan
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeSalesStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+{orderGrowth}% dari periode sebelumnya</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendapatan
            </CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(safeSalesStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+{revenueGrowth}% dari periode sebelumnya</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Selesai
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{safeSalesStats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">Diterima pelanggan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{safeSalesStats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Perlu ditindaklanjuti</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {safeSalesStats.totalOrders > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
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
