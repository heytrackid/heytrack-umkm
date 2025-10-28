'use client'

import { useMemo } from 'react'
import { useIngredients } from '@/hooks'
import type { Database } from '@/types/supabase-generated'
import { Badge } from '@/components/ui/badge'

type Ingredient = Database['public']['Tables']['ingredients']['Row']

export interface InventoryAlert {
  id: string
  ingredient_id: string
  ingredient_name: string
  alert_type: 'low_stock' | 'out_of_stock' | 'over_stock' | 'expiring_soon' | 'reorder_needed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  current_stock: number
  reorder_point: number
  min_stock: number
  max_stock?: number
  unit: string
  created_at: string
}

export interface InventoryStatus {
  total_ingredients: number
  low_stock_count: number
  out_of_stock_count: number
  over_stock_count: number
  healthy_stock_count: number
  total_value: number
  alerts: InventoryAlert[]
}

/**
 * Hook for inventory alerts and status monitoring
 */
export function useInventoryAlerts() {
  const { data: ingredients, loading } = useIngredients()

  const inventoryStatus = useMemo((): InventoryStatus => {
    if (!ingredients || ingredients.length === 0) {
      return {
        total_ingredients: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        over_stock_count: 0,
        healthy_stock_count: 0,
        total_value: 0,
        alerts: []
      }
    }

    const alerts: InventoryAlert[] = []
    let lowStockCount = 0
    let outOfStockCount = 0
    let overStockCount = 0
    let healthyStockCount = 0
    let totalValue = 0

    ingredients.forEach((ingredient: Ingredient) => {
      const currentStock = ingredient.current_stock || 0
      const minStock = ingredient.min_stock || 0
      const maxStock = ingredient.max_stock
      const reorderPoint = ingredient.reorder_point || minStock
      const pricePerUnit = ingredient.price_per_unit || 0

      // Calculate total value
      totalValue += currentStock * pricePerUnit

      // Check stock levels and create alerts
      if (currentStock === 0) {
        outOfStockCount++
        alerts.push({
          id: `out_of_stock_${ingredient.id}`,
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          alert_type: 'out_of_stock',
          severity: 'critical',
          message: `${ingredient.name} habis stok! Perlu segera diisi ulang.`,
          current_stock: currentStock,
          reorder_point: reorderPoint,
          min_stock: minStock,
          max_stock: maxStock || undefined,
          unit: ingredient.unit,
          created_at: new Date().toISOString()
        })
      } else if (currentStock <= reorderPoint) {
        lowStockCount++
        alerts.push({
          id: `reorder_needed_${ingredient.id}`,
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          alert_type: 'reorder_needed',
          severity: currentStock <= minStock ? 'high' : 'medium',
          message: `${ingredient.name} stok rendah. Saat ini ${currentStock} ${ingredient.unit}, titik reorder ${reorderPoint} ${ingredient.unit}.`,
          current_stock: currentStock,
          reorder_point: reorderPoint,
          min_stock: minStock,
          max_stock: maxStock || undefined,
          unit: ingredient.unit,
          created_at: new Date().toISOString()
        })
      } else if (maxStock && currentStock > maxStock) {
        overStockCount++
        alerts.push({
          id: `over_stock_${ingredient.id}`,
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          alert_type: 'over_stock',
          severity: 'low',
          message: `${ingredient.name} stok berlebih. Saat ini ${currentStock} ${ingredient.unit}, maksimal ${maxStock} ${ingredient.unit}.`,
          current_stock: currentStock,
          reorder_point: reorderPoint,
          min_stock: minStock,
          max_stock: maxStock,
          unit: ingredient.unit,
          created_at: new Date().toISOString()
        })
      } else {
        healthyStockCount++
      }
    })

    // Sort alerts by severity
    alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })

    return {
      total_ingredients: ingredients.length,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      over_stock_count: overStockCount,
      healthy_stock_count: healthyStockCount,
      total_value: totalValue,
      alerts
    }
  }, [ingredients])

  return {
    inventoryStatus,
    loading,
    refetch: () => window.location.reload() // Simple refetch for now
  }
}

/**
 * Hook for individual ingredient stock status
 */
export function useIngredientStockStatus(ingredientId: string) {
  const { data: ingredients } = useIngredients()

  const stockStatus = useMemo(() => {
    if (!ingredients || ingredients.length === 0) {return null}

    const ingredient = ingredients.find((ing: Ingredient) => ing.id === ingredientId)
    if (!ingredient) {return null}

    const currentStock = ingredient.current_stock || 0
    const minStock = ingredient.min_stock || 0
    const maxStock = ingredient.max_stock
    const reorderPoint = ingredient.reorder_point || minStock

    let status: 'out_of_stock' | 'low_stock' | 'reorder_needed' | 'healthy' | 'over_stock' = 'healthy'
    let statusColor: 'destructive' | 'orange' | 'yellow' | 'green' | 'blue' = 'green'
    let statusText = 'Stok Sehat'

    if (currentStock === 0) {
      status = 'out_of_stock'
      statusColor = 'destructive'
      statusText = 'Habis Stok'
    } else if (currentStock <= reorderPoint) {
      status = 'reorder_needed'
      statusColor = currentStock <= minStock ? 'orange' : 'yellow'
      statusText = currentStock <= minStock ? 'Stok Rendah' : 'Perlu Reorder'
    } else if (maxStock && currentStock > maxStock) {
      status = 'over_stock'
      statusColor = 'blue'
      statusText = 'Stok Berlebih'
    }

    return {
      ingredient,
      currentStock,
      minStock,
      maxStock,
      reorderPoint,
      status,
      statusColor,
      statusText,
      percentage: maxStock ? Math.min((currentStock / maxStock) * 100, 100) : 100,
      needsReorder: currentStock <= reorderPoint,
      isOutOfStock: currentStock === 0,
      isOverStock: maxStock ? currentStock > maxStock : false
    }
  }, [ingredients, ingredientId])

  return stockStatus
}

/**
 * Component for displaying inventory alerts
 */
export const InventoryAlertsList = ({ alerts, maxItems = 5 }: { alerts: InventoryAlert[], maxItems?: number }) => {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>✅ Semua stok dalam kondisi baik</p>
      </div>
    )
  }

  const displayAlerts = alerts.slice(0, maxItems)

  return (
    <div className="space-y-3">
      {displayAlerts.map((alert) => (
        <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
          <Badge
            variant={alert.severity === 'critical' ? 'destructive' :
                    alert.severity === 'high' ? 'destructive' :
                    alert.severity === 'medium' ? 'secondary' : 'outline'}
            className="shrink-0"
          >
            {alert.severity.toUpperCase()}
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{alert.ingredient_name}</p>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Stok: {alert.current_stock} {alert.unit}
              {alert.reorder_point > 0 && ` • Reorder: ${alert.reorder_point} ${alert.unit}`}
            </p>
          </div>
        </div>
      ))}
      {alerts.length > maxItems && (
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">
            +{alerts.length - maxItems} alert lainnya
          </p>
        </div>
      )}
    </div>
  )
}
