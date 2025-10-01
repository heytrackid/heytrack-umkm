'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Package,
  Clock,
  ShoppingCart
} from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'

interface InventoryItem {
  ingredient: any
  status: string
  daysRemaining: number
  reorderRecommendation: {
    shouldReorder: boolean
    quantity: number
    estimatedCost: number
    urgency: string
  }
  insights: string[]
}

interface InventoryGridProps {
  items: InventoryItem[]
  onReorderTriggered: (ingredient: any, quantity: number) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
  getUrgencyColor: (urgency: string) => string
}

/**
 * Inventory grid component displaying inventory items as cards
 */
export function InventoryGrid({
  items,
  onReorderTriggered,
  getStatusColor,
  getStatusIcon,
  getUrgencyColor
}: InventoryGridProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Tidak ada item dalam kategori ini
          </h3>
          <p className="text-muted-foreground">
            Pilih filter lain atau tambah ingredient baru
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index: number) => (
        <Card key={index} className={`relative ${
          item.status === 'critical' ? 'border-red-200 bg-gray-100 dark:bg-gray-800' :
          item.status === 'warning' ? 'border-yellow-200 bg-gray-100 dark:bg-gray-800' : ''
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{item.ingredient.name}</CardTitle>
              <Badge variant={getStatusColor(item.status)}>
                {getStatusIcon(item.status)}
                <span className="ml-1 capitalize">{item.status}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stock Level */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Stok Saat Ini</span>
                <span className="font-medium">
                  {item.ingredient.current_stock ?? 0} {item.ingredient.unit}
                </span>
              </div>
              <Progress
                value={Math.min((item.ingredient.current_stock ?? 0 / (item.ingredient.min_stock ?? 0 * 2)) * 100, 100)}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Min: {item.ingredient.min_stock ?? 0}</span>
                <span>Optimal: {item.ingredient.min_stock ?? 0 * 2}</span>
              </div>
            </div>

            {/* Days Remaining */}
            {item.daysRemaining !== Infinity && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tersisa
                </span>
                <span className={`font-medium ${
                  item.daysRemaining <= 3 ? 'text-gray-600 dark:text-gray-400' :
                  item.daysRemaining <= 7 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {item.daysRemaining} hari
                </span>
              </div>
            )}

            {/* Value */}
            <div className="flex justify-between text-sm">
              <span>Nilai Stok</span>
              <span className="font-medium">
                {formatCurrency(item.ingredient.current_stock ?? 0 * item.ingredient.price_per_unit)}
              </span>
            </div>

            {/* Reorder Recommendation */}
            {item.reorderRecommendation.shouldReorder && (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
                  <ShoppingCart className="h-3 w-3" />
                  Rekomendasi Order
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-medium">{Math.ceil(item.reorderRecommendation.quantity)} {item.ingredient.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimasi:</span>
                    <span className="font-medium">{formatCurrency(item.reorderRecommendation.estimatedCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urgency:</span>
                    <span className={`inline-block w-2 h-2 rounded-full ${getUrgencyColor(item.reorderRecommendation.urgency)} mr-1`}></span>
                    <span className="capitalize font-medium">{item.reorderRecommendation.urgency}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => onReorderTriggered?.(item.ingredient, Math.ceil(item.reorderRecommendation.quantity))}
                >
                  Order Sekarang
                </Button>
              </div>
            )}

            {/* Insights */}
            {item.insights.length > 0 && (
              <div className="space-y-1">
                {item.insights.map((insight: string, idx: number) => (
                  <div key={idx} className="text-xs text-muted-foreground">
                    {insight}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
