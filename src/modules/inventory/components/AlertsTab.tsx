'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Bell, CheckCircle } from 'lucide-react'

interface InventoryItem {
  ingredient: any
  status: string
  daysRemaining: number
  reorderRecommendation: {
    shouldReorder: boolean
    quantity: number
  }
}

interface AlertsTabProps {
  items: InventoryItem[]
  onReorderTriggered: (ingredient: any, quantity: number) => void
}

/**
 * Alerts tab component showing critical and warning inventory alerts
 */
export function AlertsTab({ items, onReorderTriggered }: AlertsTabProps) {
  const alertItems = items.filter(item => item.status === 'critical' || item.status === 'warning')

  if (alertItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-green-700">
            Semua Stock Aman! 🎉
          </h3>
          <p className="text-muted-foreground">
            Tidak ada alert inventory saat ini. Semua bahan dalam kondisi stock yang cukup.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {alertItems.map((item, index) => (
        <Alert key={index} className={item.status === 'critical' ? 'border-red-200 bg-gray-100 dark:bg-gray-800' : 'border-yellow-200 bg-gray-100 dark:bg-gray-800'}>
          {item.status === 'critical' ? (
            <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
          <AlertDescription>
            <div className="flex justify-between items-start">
              <div>
                <strong>{item.ingredient.name}</strong> - Status: {item.status}
                <br />
                <span className="text-sm">
                  Stok: {item.ingredient.current_stock} {item.ingredient.unit}
                  {item.daysRemaining !== Infinity && ` (${item.daysRemaining} hari lagi)`}
                </span>
              </div>
              {item.reorderRecommendation.shouldReorder && (
                <Button
                  size="sm"
                  variant={item.status === 'critical' ? 'destructive' : 'secondary'}
                  onClick={() => onReorderTriggered?.(item.ingredient, Math.ceil(item.reorderRecommendation.quantity))}
                >
                  Order {Math.ceil(item.reorderRecommendation.quantity)} {item.ingredient.unit}
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
