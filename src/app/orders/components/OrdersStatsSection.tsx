'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, DollarSign, Package, Clock } from 'lucide-react'

export default function OrdersStatsSection({
  totalOrders,
  totalRevenue,
  averageOrderValue,
  pendingRevenue,
  formatCurrency,
}: {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  pendingRevenue: number
  formatCurrency: (n: number) => string
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pesanan</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">18.7% dari periode sebelumnya</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">23.2% dari periode sebelumnya</p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</p>
              <p className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</p>
              <p className="text-xs text-muted-foreground mt-1">per pesanan</p>
            </div>
            <Package className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(pendingRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">belum dibayar</p>
            </div>
            <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
