'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { uiLogger } from '@/lib/client-logger'
import { CheckCircle, Clock, DollarSign, ShoppingCart } from '@/components/icons'
import { useEffect, useState } from 'react'

interface SalesReportProps {
  dateRange: {
    start: string | undefined
    end: string | undefined
  }
}

interface SalesStats {
  totalOrders: number
  totalRevenue: number
  completedOrders: number
  pendingOrders: number
}

interface OrderSummary {
  total_amount?: number | null
  status?: string | null
}

export const SalesReport = ({ dateRange }: SalesReportProps) => {
  const [salesStats, setSalesStats] = useState<SalesStats>({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [previousStats, setPreviousStats] = useState({
    totalOrders: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    const fetchSalesData = async () => {
      setIsLoading(true)
      if (!dateRange.start || !dateRange.end) {
        setSalesStats({ totalOrders: 0, totalRevenue: 0, completedOrders: 0, pendingOrders: 0 })
        setPreviousStats({ totalOrders: 0, totalRevenue: 0 })
        setIsLoading(false)
        return
      }

      try {
        const buildParams = (start: string, end: string) => {
          const params = new URLSearchParams()
          params.set('from', start)
          params.set('to', end)
          params.set('limit', '500')
          params.set('page', '1')
          params.set('sort_order', 'desc')
          return params
        }

        const parseOrders = (payload: unknown): OrderSummary[] => {
          if (!payload || typeof payload !== 'object' || !('data' in payload)) {
            return []
          }
          const data = (payload as { data?: unknown }).data
          if (!Array.isArray(data)) {
            return []
          }
          return data as OrderSummary[]
        }

        const toNumber = (value: unknown): number => {
          if (typeof value === 'number' && Number.isFinite(value)) {
            return value
          }
          const parsed = Number(value)
          return Number.isFinite(parsed) ? parsed : 0
        }

        const response = await fetch(`/api/orders?${buildParams(dateRange.start, dateRange.end).toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch sales data')
        }

        const currentOrders = parseOrders(await response.json())

        const currentTotals = currentOrders.reduce(
          (acc, order) => {
            const status = (order.status ?? '').toString().toUpperCase()
            acc.totalRevenue += toNumber(order.total_amount)
            acc.totalOrders += 1
            if (status === 'DELIVERED') {
              acc.completedOrders += 1
            } else if (status !== 'CANCELLED') {
              acc.pendingOrders += 1
            }
            return acc
          },
          { totalOrders: 0, totalRevenue: 0, completedOrders: 0, pendingOrders: 0 }
        )

        setSalesStats(currentTotals)

        // Fetch previous period for growth calculation
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        const periodLength = endDate.getTime() - startDate.getTime()

        const previousEnd = new Date(startDate.getTime() - 1)
        const previousStart = new Date(previousEnd.getTime() - periodLength)

        const prevResponse = await fetch(
          `/api/orders?${buildParams(
            previousStart.toISOString().split('T')[0],
            previousEnd.toISOString().split('T')[0]
          ).toString()}`
        )
        if (prevResponse.ok) {
          const previousOrders = parseOrders(await prevResponse.json())
          const previousTotals = previousOrders.reduce(
            (acc, order) => {
              acc.totalOrders += 1
              acc.totalRevenue += toNumber(order.total_amount)
              return acc
            },
            { totalOrders: 0, totalRevenue: 0 }
          )
          setPreviousStats(previousTotals)
        } else {
          setPreviousStats({ totalOrders: 0, totalRevenue: 0 })
        }
      } catch (error) {
        uiLogger.error({ error }, 'Failed to fetch sales data')
        setSalesStats({ totalOrders: 0, totalRevenue: 0, completedOrders: 0, pendingOrders: 0 })
        setPreviousStats({ totalOrders: 0, totalRevenue: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    void fetchSalesData()
  }, [dateRange.start, dateRange.end])

  const revenueGrowth = previousStats.totalRevenue > 0
    ? Math.round(((salesStats.totalRevenue - previousStats.totalRevenue) / previousStats.totalRevenue) * 100)
    : 0
  const orderGrowth = previousStats.totalOrders > 0
    ? Math.round(((salesStats.totalOrders - previousStats.totalOrders) / previousStats.totalOrders) * 100)
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

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

  if (salesStats.totalOrders === 0) {
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
            <div className="text-2xl font-bold">{salesStats.totalOrders}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(salesStats.totalRevenue)}</div>
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
            <div className="text-2xl font-bold text-green-600">{salesStats.completedOrders}</div>
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
            <div className="text-2xl font-bold text-orange-600">{salesStats.pendingOrders}</div>
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
              ({salesStats.totalOrders} transaksi dalam periode ini)
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
