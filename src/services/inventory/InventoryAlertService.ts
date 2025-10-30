import 'server-only'
import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { Database, Json } from '@/types/supabase-generated'

/**
 * Service for managing inventory alerts
 * SERVER-ONLY: Uses server client for database operations
 */
export class InventoryAlertService {
  private logger = dbLogger

  /**
   * Check and create alerts for low stock ingredients
   */
  async checkLowStockAlerts(userId: string): Promise<void> {
    try {
      const supabase = await createClient()
      
      // Get all ingredients with stock below reorder point
      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        throw new Error(`Failed to fetch ingredients: ${error.message}`)
      }

      if (!ingredients || ingredients.length === 0) {
        return
      }

      type InventoryAlertInsert = Database['public']['Tables']['inventory_alerts']['Insert']
      interface PendingInventoryAlert {
        ingredient_id: string
        alert_type: InventoryAlertInsert['alert_type']
        severity: InventoryAlertInsert['severity']
        message: InventoryAlertInsert['message']
        metadata: InventoryAlertInsert['metadata']
      }

      const alerts: PendingInventoryAlert[] = []

      for (const ingredient of ingredients) {
        const currentStock = ingredient.current_stock || 0
        const minStock = ingredient.min_stock || 0
        const reorderPoint = ingredient.reorder_point || minStock

        // Out of stock
        if (currentStock <= 0) {
          alerts.push({
            ingredient_id: ingredient.id,
            alert_type: 'OUT_OF_STOCK',
            severity: 'CRITICAL',
            message: `${ingredient.name} habis! Stok saat ini: 0 ${ingredient.unit}`,
            metadata: {
              current_stock: currentStock,
              min_stock: minStock,
              ingredient_name: ingredient.name,
              unit: ingredient.unit
            } as Json
          })
        }
        // Low stock (below reorder point)
        else if (currentStock <= reorderPoint && reorderPoint > 0) {
          alerts.push({
            ingredient_id: ingredient.id,
            alert_type: 'REORDER_NEEDED',
            severity: 'HIGH',
            message: `${ingredient.name} perlu dipesan ulang. Stok: ${currentStock} ${ingredient.unit}, Reorder point: ${reorderPoint} ${ingredient.unit}`,
            metadata: {
              current_stock: currentStock,
              reorder_point: reorderPoint,
              min_stock: minStock,
              ingredient_name: ingredient.name,
              unit: ingredient.unit,
              supplier: ingredient.supplier,
              lead_time: ingredient.lead_time
            } as Json
          })
        }
        // Below minimum stock
        else if (currentStock <= minStock && minStock > 0) {
          alerts.push({
            ingredient_id: ingredient.id,
            alert_type: 'LOW_STOCK',
            severity: 'MEDIUM',
            message: `${ingredient.name} stok rendah. Stok: ${currentStock} ${ingredient.unit}, Minimum: ${minStock} ${ingredient.unit}`,
            metadata: {
              current_stock: currentStock,
              min_stock: minStock,
              ingredient_name: ingredient.name,
              unit: ingredient.unit
            } as Json
          })
        }
      }

      // Deactivate old alerts for ingredients that are now OK
      await this.deactivateResolvedAlerts(userId, ingredients)

      // Insert new alerts (only if they don't exist)
      if (alerts.length > 0) {
        for (const alert of alerts) {
          // Check if similar alert already exists and is active
          const { data: existingAlert } = await supabase
            .from('inventory_alerts')
            .select('id')
            .eq('ingredient_id', alert.ingredient_id)
            .eq('alert_type', alert.alert_type)
            .eq('is_active', true)
            .eq('user_id', userId)
            .single()

          if (!existingAlert) {
            await supabase
              .from('inventory_alerts')
              .insert({
                ...alert,
                user_id: userId,
                is_active: true
              })
          }
        }

        this.logger.info({ 
          userId, 
          alertCount: alerts.length 
        }, 'Inventory alerts created')
      }

    } catch (err: unknown) {
      this.logger.error({ error: err, userId }, 'Failed to check low stock alerts')
      throw err
    }
  }

  /**
   * Deactivate alerts for ingredients that are now above threshold
   */
  private async deactivateResolvedAlerts(
    userId: string,
    ingredients: Array<{ id: string; current_stock: number | null; min_stock: number | null; reorder_point: number | null }>
  ): Promise<void> {
    try {
      const supabase = await createClient()
      
      for (const ingredient of ingredients) {
        const currentStock = ingredient.current_stock || 0
        const minStock = ingredient.min_stock || 0
        const reorderPoint = ingredient.reorder_point || minStock

        // If stock is now above reorder point, deactivate alerts
        if (currentStock > reorderPoint) {
          await supabase
            .from('inventory_alerts')
            .update({
              is_active: false,
              resolved_at: new Date().toISOString()
            })
            .eq('ingredient_id', ingredient.id)
            .eq('user_id', userId)
            .eq('is_active', true)
        }
      }
    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to deactivate resolved alerts')
    }
  }

  /**
   * Check single ingredient and create alert if needed
   */
  async checkIngredientAlert(ingredientId: string, userId: string): Promise<void> {
    try {
      const supabase = await createClient()
      
      const { data: ingredient, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('id', ingredientId)
        .eq('user_id', userId)
        .single()

      if (error || !ingredient) {
        return
      }

      const currentStock = ingredient.current_stock || 0
      const minStock = ingredient.min_stock || 0
      const reorderPoint = ingredient.reorder_point || minStock

      // Deactivate old alerts if stock is now OK
      if (currentStock > reorderPoint) {
        await supabase
          .from('inventory_alerts')
          .update({
            is_active: false,
            resolved_at: new Date().toISOString()
          })
          .eq('ingredient_id', ingredientId)
          .eq('user_id', userId)
          .eq('is_active', true)
        
        return
      }

      // Create alert if needed
      let alertType = ''
      let severity = ''
      let message = ''

      if (currentStock <= 0) {
        alertType = 'OUT_OF_STOCK'
        severity = 'CRITICAL'
        message = `${ingredient.name} habis! Stok saat ini: 0 ${ingredient.unit}`
      } else if (currentStock <= reorderPoint && reorderPoint > 0) {
        alertType = 'REORDER_NEEDED'
        severity = 'HIGH'
        message = `${ingredient.name} perlu dipesan ulang. Stok: ${currentStock} ${ingredient.unit}`
      } else if (currentStock <= minStock && minStock > 0) {
        alertType = 'LOW_STOCK'
        severity = 'MEDIUM'
        message = `${ingredient.name} stok rendah. Stok: ${currentStock} ${ingredient.unit}`
      }

      if (alertType) {
        // Check if alert already exists
        const { data: existingAlert } = await supabase
          .from('inventory_alerts')
          .select('id')
          .eq('ingredient_id', ingredientId)
          .eq('alert_type', alertType)
          .eq('is_active', true)
          .eq('user_id', userId)
          .single()

        if (!existingAlert) {
          await supabase
            .from('inventory_alerts')
            .insert({
              ingredient_id: ingredientId,
              alert_type: alertType,
              severity,
              message,
              user_id: userId,
              is_active: true,
              metadata: {
                current_stock: currentStock,
                min_stock: minStock,
                reorder_point: reorderPoint,
                ingredient_name: ingredient.name,
                unit: ingredient.unit
              }
            })

          this.logger.info({ 
            ingredientId, 
            alertType 
          }, 'Inventory alert created')
        }
      }

    } catch (err: unknown) {
      this.logger.error({ error: err, ingredientId }, 'Failed to check ingredient alert')
    }
  }

  /**
   * Get active alerts for user
   */
  async getActiveAlerts(userId: string): Promise<unknown[]> {
    try {
      const supabase = await createClient()
      
      const { data: alerts, error } = await supabase
        .from('inventory_alerts')
        .select(`
          *,
          ingredient:ingredients(name, unit, current_stock)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch alerts: ${error.message}`)
      }

      return alerts || []

    } catch (err: unknown) {
      this.logger.error({ error: err, userId }, 'Failed to get active alerts')
      return []
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      const supabase = await createClient()
      
      await supabase
        .from('inventory_alerts')
        .update({
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .eq('user_id', userId)

      this.logger.info({ alertId }, 'Alert acknowledged')

    } catch (err: unknown) {
      this.logger.error({ error: err, alertId }, 'Failed to acknowledge alert')
      throw err
    }
  }
}
