'use client'

import { BarChart3, Clock, DollarSign, ShoppingCart } from '@/components/icons'
import { Card, CardContent } from '@/components/ui/card'

import type { OrderStats } from './types'

interface OrderStatsCardsProps {
  stats: OrderStats
  formatCurrency: (amount: number) => string
}

export function OrderStatsCards({ stats, formatCurrency }: OrderStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pesanan</p>
              <p className="text-2xl font-bold">{stats.total_orders}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Rata-rata nilai per pesanan
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.revenue_growth}% dari periode sebelumnya
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.average_order_value)}</p>
              <p className="text-xs text-muted-foreground mt-1">per pesanan</p>
            </div>
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendapatan Tertunda</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.pending_revenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">belum dibayar</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
