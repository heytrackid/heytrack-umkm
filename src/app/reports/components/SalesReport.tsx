'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { memo, useCallback, useMemo } from 'react'

import { CheckCircle, Clock, DollarSign, ShoppingCart } from '@/components/icons'
import { useSalesStats } from '@/hooks/api/useReports'

interface SalesReportProps {
  dateRange?: {
    start: string | undefined
    end: string | undefined
  }
}

const SalesReportComponent = ({ dateRange }: SalesReportProps = {}) => {
  const { data: salesStats, isLoading } = useSalesStats(
    dateRange && (dateRange.start || dateRange.end) ? {
      dateRange: {
        ...(dateRange.start && { start: dateRange.start }),
        ...(dateRange.end && { end: dateRange.end })
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

      {/* Detailed View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Detail Penjualan
            <span className="text-sm text-muted-foreground">
              ({safeSalesStats.totalOrders} transaksi dalam periode ini)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Detail transaksi akan ditampilkan di versi lengkap</p>
            <p className="text-sm text-muted-foreground mt-1">Fitur ini sedang dalam pengembangan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Memoized export for performance
export const SalesReport = memo(SalesReportComponent)
