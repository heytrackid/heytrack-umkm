'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, AlertCircle } from 'lucide-react'

export default function StatsCardsSection({ formatCurrency, stats }: {
  formatCurrency: (n: number) => string
  stats: { totalSales: number; totalOrders: number; totalCustomers: number; totalIngredients: number; salesGrowth: number; ordersGrowth: number; customersGrowth: number; ingredientsLow: number }
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <TrendingUp className="h-3 w-3 mr-1" />
            {stats.salesGrowth}% dari bulan lalu
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <TrendingUp className="h-3 w-3 mr-1" />
            {stats.ordersGrowth}% dari bulan lalu
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <TrendingUp className="h-3 w-3 mr-1" />
            {stats.customersGrowth}% dari bulan lalu
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bahan Baku</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalIngredients}</div>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <AlertCircle className="h-3 w-3 mr-1" />
            {stats.ingredientsLow} stok menipis
          </div>
        </CardContent>
      </Card>
    </div>
  )
}