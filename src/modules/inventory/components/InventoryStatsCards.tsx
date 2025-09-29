'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Package,
  AlertTriangle,
  TrendingDown,
  BarChart3
} from 'lucide-react'

interface InventoryStatsProps {
  stats: {
    total: number
    critical: number
    low: number
    needReorder: number
    totalValue: number
  }
}

/**
 * Inventory overview statistics cards
 */
export function InventoryStatsCards({ stats }: InventoryStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <p className="text-xs text-muted-foreground">Total Items</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.critical}</div>
          </div>
          <p className="text-xs text-muted-foreground">Critical Stock</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-yellow-500">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.low}</div>
          </div>
          <p className="text-xs text-muted-foreground">Low Stock</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.needReorder}</div>
          </div>
          <p className="text-xs text-muted-foreground">Need Reorder</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div className="text-lg font-bold">Rp {(stats.totalValue / 1000000).toFixed(1)}M</div>
          </div>
          <p className="text-xs text-muted-foreground">Inventory Value</p>
        </CardContent>
      </Card>
    </div>
  )
}
