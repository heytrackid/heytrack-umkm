'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCurrency } from '@/hooks/useCurrency'
import { apiLogger } from '@/lib/logger'

interface DashboardStats {
  revenue: {
    today: number
    total: number
    growth: string
    trend: 'up' | 'down'
  }
  orders: {
    active: number
    total: number
    today: number
  }
  customers: {
    total: number
    vip: number
    regular: number
  }
  inventory: {
    total: number
    lowStock: number
    categories: number
  }
}

interface StatsCardsSectionProps {
  stats?: {
    revenue: {
      total: number
      growth: string
      trend: 'up' | 'down'
    }
    orders: {
      total: number
      active: number
    }
    customers: {
      total: number
      vip: number
    }
    inventory: {
      total: number
      lowStock: number
    }
  }
  formatCurrency: (value: number) => string
}

export default function StatsCardsSection({ stats, formatCurrency }: StatsCardsSectionProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                </div>
                <div className="space-y-1">
                  <div className="h-7 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Penjualan */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Penjualan
              </span>
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold break-words">
                {formatCurrency(stats.revenue.total)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stats.revenue.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600 flex-shrink-0" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600 flex-shrink-0" />
                )}
                <span className="truncate">{stats.revenue.growth}% hari ini</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Pesanan */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Pesanan
              </span>
              <ShoppingCart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold">
                {stats.orders.total}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="truncate">
                  {stats.orders.active} pesanan aktif
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Pelanggan */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Pelanggan
              </span>
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold">
                {stats.customers.total}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="truncate">
                  {stats.customers.vip} pelanggan VIP
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bahan Baku */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Bahan Baku
              </span>
              <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold">
                {stats.inventory.total}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {stats.inventory.lowStock} stok menipis
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}