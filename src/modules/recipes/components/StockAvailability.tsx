'use client'

import { Card } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, Package } from 'lucide-react'

interface Availability {
  can_produce: boolean
  production_capacity: number
  limiting_ingredients: string[]
  stock_warnings: string[]
}

/**
 * Stock availability component for production status and alerts
 */
export function StockAvailability({ availability }: { availability: Availability }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Production Capacity */}
      <Card className="p-4">
        <h4 className="flex items-center gap-2 font-medium mb-3">
          <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          Production Status
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {availability.can_produce ? (
              <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
            <span className="font-medium">
              {availability.can_produce ? 'Can Produce' : 'Cannot Produce'}
            </span>
          </div>

          <div className="text-sm">
            <span className="text-muted-foreground">Max Batches: </span>
            <span className="font-mono font-medium">{availability.production_capacity}</span>
          </div>

          {!availability.can_produce && (
            <div className="p-3 bg-gray-100 dark:bg-gray-800 border border-red-200 rounded">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Production Blocked</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Insufficient ingredients to produce this recipe
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Stock Issues */}
      <Card className="p-4">
        <h4 className="flex items-center gap-2 font-medium mb-3">
          <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          Stock Alerts
        </h4>
        <div className="space-y-2">
          {availability.limiting_ingredients.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Insufficient Stock:</p>
              <ul className="text-sm space-y-1">
                {availability.limiting_ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-gray-100 dark:bg-gray-8000 rounded-full"></span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {availability.stock_warnings.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Stock Warnings:</p>
              <ul className="text-sm space-y-1">
                {availability.stock_warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-gray-100 dark:bg-gray-8000 rounded-full"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {availability.limiting_ingredients.length === 0 &&
           availability.stock_warnings.length === 0 && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">All ingredients available</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
