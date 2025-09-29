'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, CheckCircle } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface InventoryItem {
  ingredient: any
  reorderRecommendation: {
    shouldReorder: boolean
    quantity: number
    estimatedCost: number
    urgency: string
  }
}

interface ReorderTabProps {
  items: InventoryItem[]
  onReorderTriggered: (ingredient: any, quantity: number) => void
}

/**
 * Reorder tab component showing reorder recommendations
 */
export function ReorderTab({ items, onReorderTriggered }: ReorderTabProps) {
  const { formatCurrency } = useCurrency()
  const reorderItems = items.filter(item => item.reorderRecommendation.shouldReorder)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          Rekomendasi Reorder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reorderItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{item.ingredient.name}</div>
                <div className="text-sm text-muted-foreground">
                  Current: {item.ingredient.current_stock} {item.ingredient.unit} |
                  Min: {item.ingredient.min_stock} {item.ingredient.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  Supplier: {item.ingredient.supplier || 'Not specified'}
                </div>
              </div>
              <div className="text-center mx-4">
                <div className="text-lg font-bold">
                  {Math.ceil(item.reorderRecommendation.quantity)} {item.ingredient.unit}
                </div>
                <div className="text-xs text-muted-foreground">Recommended</div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatCurrency(item.reorderRecommendation.estimatedCost)}
                </div>
                <Button
                  size="sm"
                  variant={item.reorderRecommendation.urgency === 'urgent' ? 'destructive' : 'default'}
                  onClick={() => onReorderTriggered?.(item.ingredient, Math.ceil(item.reorderRecommendation.quantity))}
                >
                  Order Now
                </Button>
              </div>
            </div>
          ))}

          {reorderItems.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Tidak ada rekomendasi reorder saat ini. Semua stock dalam kondisi cukup.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
