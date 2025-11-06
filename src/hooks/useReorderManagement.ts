'use client'

import { useMemo } from 'react'
import { useIngredients } from '@/hooks'
import type { Row } from '@/types/database'



type Ingredient = Row<'ingredients'>

export interface ReorderSuggestion {
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  reorder_point: number
  suggested_quantity: number
  unit: string
  unit_cost: number
  total_cost: number
  priority: 'urgent' | 'high' | 'medium' | 'low'
  reason: string
  supplier?: string
  lead_time_days?: number
}

export interface ReorderSummary {
  total_suggestions: number
  urgent_count: number
  high_count: number
  medium_count: number
  low_count: number
  total_estimated_cost: number
  suggestions: ReorderSuggestion[]
}

/**
 * Hook for managing reorder suggestions and purchase planning
 */
export function useReorderManagement() {
  const { data: ingredients, loading } = useIngredients()

  const reorderData = useMemo((): ReorderSummary => {
    if (!ingredients || ingredients.length === 0) {
      return {
        total_suggestions: 0,
        urgent_count: 0,
        high_count: 0,
        medium_count: 0,
        low_count: 0,
        total_estimated_cost: 0,
        suggestions: []
      }
    }

    const suggestions: ReorderSuggestion[] = []
    let urgentCount = 0
    let highCount = 0
    let mediumCount = 0
    let lowCount = 0

    ingredients.forEach((ingredient: Ingredient) => {
      const currentStock = ingredient.current_stock ?? 0
      const minStock = ingredient.min_stock ?? 0
      const maxStock = ingredient.max_stock ?? 0
      const reorderPoint = ingredient.reorder_point ?? minStock
      const unitCost = ingredient.price_per_unit || 0

      // Only suggest reorder if stock is at or below reorder point
      if (currentStock <= reorderPoint) {
        // Calculate suggested quantity (aim for max stock level)
        const targetStock = maxStock || (reorderPoint * 2)
        const deficit = targetStock - currentStock
        const suggestedQuantity = Math.max(deficit, reorderPoint - currentStock + minStock)

        let priority: 'urgent' | 'high' | 'medium' | 'low' = 'low'
        let reason = ''

        if (currentStock === 0) {
          priority = 'urgent'
          reason = 'Stok habis - produksi terhenti'
          urgentCount++
        } else if (currentStock <= minStock) {
          priority = 'high'
          reason = 'Stok sangat rendah - risiko habis'
          highCount++
        } else if (currentStock <= reorderPoint) {
          priority = 'medium'
          reason = 'Stok di bawah titik reorder'
          mediumCount++
        } else {
          priority = 'low'
          reason = 'Stok cukup tapi perlu diisi'
          lowCount++
        }

        suggestions.push({
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          current_stock: currentStock,
          reorder_point: reorderPoint,
          suggested_quantity: Math.ceil(suggestedQuantity), // Round up to whole units
          unit: ingredient.unit,
          unit_cost: unitCost,
          total_cost: Math.ceil(suggestedQuantity) * unitCost,
          priority,
          reason,
          supplier: ingredient.supplier ?? undefined,
          lead_time_days: ingredient.lead_time ?? undefined
        })
      }
    })

    // Sort by priority and then by ingredient name
    suggestions.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return a.ingredient_name.localeCompare(b.ingredient_name)
    })

    const totalEstimatedCost = suggestions.reduce((sum, item) => sum + item.total_cost, 0)

    return {
      total_suggestions: suggestions.length,
      urgent_count: urgentCount,
      high_count: highCount,
      medium_count: mediumCount,
      low_count: lowCount,
      total_estimated_cost: totalEstimatedCost,
      suggestions
    }
  }, [ingredients])

  return {
    reorderData,
    loading,
    refetch: () => window.location.reload() // Simple refetch for now
  }
}

/**
 * Hook for generating purchase orders from reorder suggestions
 */
export function usePurchaseOrderGenerator() {

  const generatePurchaseOrder = (suggestions: ReorderSuggestion[]) => {
    // Group by supplier for efficient purchasing
    const bySupplier = suggestions.reduce((acc, item) => {
      const supplier = item.supplier ?? 'Unknown Supplier'
      if (!acc[supplier]) {
        acc[supplier] = []
      }
      acc[supplier].push(item)
      return acc
    }, {} as Record<string, ReorderSuggestion[]>)

    const purchaseOrders = Object.entries(bySupplier).map(([supplier, items]) => ({
      supplier,
      items,
      total_items: items.length,
      total_quantity: items.reduce((sum, item) => sum + item.suggested_quantity, 0),
      total_cost: items.reduce((sum, item) => sum + item.total_cost, 0),
      priority: Math.max(...items.map(item =>
        ({ urgent: 4, high: 3, medium: 2, low: 1 }[item.priority] || 1)
      )),
      urgent_items: items.filter(item => item.priority === 'urgent').length,
      created_at: new Date().toISOString()
    }))

    // Sort by priority and total cost
    purchaseOrders.sort((a, b) => {
      if (a.urgent_items !== b.urgent_items) {
        return b.urgent_items - a.urgent_items // More urgent items first
      }
      return b.total_cost - a.total_cost // Higher cost first
    })

    return purchaseOrders
  }

  return { generatePurchaseOrder }
}
