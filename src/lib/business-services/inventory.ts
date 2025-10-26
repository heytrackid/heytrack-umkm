/**
 * Inventory Services
 * Service for inventory management operations
 */



import type { ReorderSummary } from './types'
import type { Database } from '@/types'
import { inventoryLogger } from '@/lib/logger'

type Ingredient = Database['public']['Tables']['ingredients']['Row']

export class InventoryServices {
  private static instance: InventoryServices

  private constructor() {}

  static getInstance(): InventoryServices {
    if (!InventoryServices.instance) {
      InventoryServices.instance = new InventoryServices()
    }
    return InventoryServices.instance
  }

  async checkReorderNeeds(): Promise<ReorderSummary> {
    try {
      // Import Supabase client dynamically to avoid circular dependencies
      const { createServerClient } = await import('@/utils/supabase/client-safe')
      const supabase = await createServerClient()

      // Get all ingredients with stock information
      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('is_active', true)

      if (error) {
        inventoryLogger.error({ error }, 'Error fetching ingredients for reorder check')
        return { items: [], totalItems: 0, criticalItems: 0 }
      }

      const reorderItems = (ingredients as Ingredient[])
        .filter(ingredient => {
          const currentStock = ingredient.current_stock || 0
          const minStock = ingredient.min_stock || 0
          const reorderPoint = ingredient.reorder_point || minStock

          return currentStock <= reorderPoint && reorderPoint > 0
        })
        .map(ingredient => {
          const currentStock = ingredient.current_stock || 0
          const minStock = ingredient.min_stock || 0
          const reorderPoint = ingredient.reorder_point || minStock

          // Calculate reorder quantity (suggest 150% of min stock or reorder point)
          const suggestedReorder = Math.max(minStock * 1.5, reorderPoint * 1.5, 10)

          // Determine urgency
          let urgency: 'low' | 'medium' | 'high' = 'low'
          if (currentStock <= 0) {
            urgency = 'high'
          } else if (currentStock <= reorderPoint * 0.5) {
            urgency = 'high'
          } else if (currentStock <= reorderPoint) {
            urgency = 'medium'
          }

          return {
            id: ingredient.id,
            name: ingredient.name,
            current_stock: currentStock,
            min_stock: minStock,
            reorder_quantity: Math.ceil(suggestedReorder),
            urgency
          }
        })
        .sort((a, b) => {
          // Sort by urgency: high -> medium -> low
          const urgencyOrder = { high: 3, medium: 2, low: 1 }
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
        })

      const criticalItems = reorderItems.filter(item => item.urgency === 'high').length

      return {
        items: reorderItems,
        totalItems: reorderItems.length,
        criticalItems
      }
    } catch (error) {
      inventoryLogger.error({ error }, 'Error in checkReorderNeeds')
      return { items: [], totalItems: 0, criticalItems: 0 }
    }
  }

  async getLowStockItems(): Promise<Ingredient[]> {
    try {
      const { createServerClient } = await import('@/utils/supabase/client-safe')
      const supabase = await createServerClient()

      const { data: allIngredients, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('is_active', true)
      
      if (error) {
        inventoryLogger.error({ error }, 'Error fetching ingredients for low stock check')
        return []
      }
      
      // Filter for low stock items (current_stock <= min_stock) in code
      const ingredients = (allIngredients as Ingredient[]).filter(ingredient => {
        const currentStock = ingredient.current_stock || 0
        const minStock = ingredient.min_stock || 0
        return currentStock <= minStock
      })
      
      // Sort by current stock (ascending - lowest first)
      ingredients.sort((a, b) => 
        (a.current_stock || 0) - (b.current_stock || 0)
      )

      if (error) {
        inventoryLogger.error({ error }, 'Error fetching low stock items')
        return []
      }

      return (ingredients as Ingredient[]) || []
    } catch (error) {
      inventoryLogger.error({ error }, 'Error in getLowStockItems')
      return []
    }
  }

  async updateStockLevels(updates: Array<{ id: string; quantity: number }>): Promise<void> {
    try {
      const { createServerClient } = await import('@/utils/supabase/client-safe')
      const supabase = await createServerClient()

      // Update each ingredient's stock level
      for (const update of updates) {
        const { error } = await supabase
          .from('ingredients')
          .update({
            current_stock: update.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id)

        if (error) {
          inventoryLogger.error({ error, ingredientId: update.id }, 'Error updating stock level')
          throw error
        }
      }

      inventoryLogger.info({ updatesCount: updates.length }, 'Successfully updated stock levels')
    } catch (error) {
      inventoryLogger.error({ error }, 'Error in updateStockLevels')
      throw error
    }
  }

  async getStockAlerts(): Promise<Array<{
    ingredient_id: string
    ingredient_name: string
    current_stock: number
    min_stock: number
    alert_type: 'out_of_stock' | 'low_stock' | 'critical'
    message: string
  }>> {
    try {
      const { createServerClient } = await import('@/utils/supabase/client-safe')
      const supabase = await createServerClient()

      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('is_active', true)

      if (error) {
        inventoryLogger.error({ error }, 'Error fetching ingredients for alerts')
        return []
      }

      const alerts: Array<{
        ingredient_id: string
        ingredient_name: string
        current_stock: number
        min_stock: number
        alert_type: 'out_of_stock' | 'low_stock' | 'critical'
        message: string
      }> = []

      for (const ingredient of ingredients as Ingredient[]) {
        const currentStock = ingredient.current_stock || 0
        const minStock = ingredient.min_stock || 0

        if (currentStock <= 0) {
          alerts.push({
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            current_stock: currentStock,
            min_stock: minStock,
            alert_type: 'out_of_stock',
            message: `Stok habis - perlu segera diisi`
          })
        } else if (currentStock <= minStock * 0.5) {
          alerts.push({
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            current_stock: currentStock,
            min_stock: minStock,
            alert_type: 'critical',
            message: `Stok kritis - di bawah 50% dari minimum`
          })
        } else if (currentStock <= minStock) {
          alerts.push({
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            current_stock: currentStock,
            min_stock: minStock,
            alert_type: 'low_stock',
            message: `Stok rendah - perlu diisi`
          })
        }
      }

      return alerts.sort((a, b) => {
        const priorityOrder = { out_of_stock: 3, critical: 2, low_stock: 1 }
        return priorityOrder[b.alert_type] - priorityOrder[a.alert_type]
      })
    } catch (error) {
      inventoryLogger.error({ error }, 'Error in getStockAlerts')
      return []
    }
  }
}
