'use client'

import { memo } from 'react'
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, AlertCircle, HelpCircle } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface StatsCardsSectionProps {
  stats?: {
    revenue: {
      total: number
      growth: string
      trend: 'down' | 'up'
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

const StatsCardsSection = memo(({ stats, formatCurrency }: StatsCardsSectionProps): JSX.Element => {
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
    <TooltipProvider>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Penjualan */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Penjualan
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total pendapatan dari semua pesanan yang telah selesai</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                  <span className="truncate">{stats.revenue.growth}% dari hari kemarin</span>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Pesanan
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Jumlah total pesanan yang telah dibuat</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Pelanggan
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Jumlah pelanggan yang telah bertransaksi</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Bahan Baku
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Jumlah jenis bahan baku yang tersedia di inventory</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold">
                  {stats.inventory.total}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 mr-1 text-orange-500 flex-shrink-0" />
                  <span className="truncate">
                    {stats.inventory.lowStock} stok menipis
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
})

StatsCardsSection.displayName = 'StatsCardsSection'

export { StatsCardsSection }