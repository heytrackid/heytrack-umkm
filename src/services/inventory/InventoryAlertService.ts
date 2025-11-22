import 'server-only'

import { dbLogger } from '@/lib/logger'
import type { Database, Insert } from '@/types/database'
import type { Json } from '@/types/supabase-generated'
import { createClient } from '@/utils/supabase/server'


const normalizeError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error))

interface PendingInventoryAlert {
  ingredient_id: string
  alert_type: string
  severity: string
  message: string
  metadata: Insert<'inventory_alerts'>['metadata']
}

type IngredientRow = Database['public']['Tables']['ingredients']['Row']
type StockSnapshot = Pick<IngredientRow, 'id' | 'current_stock' | 'min_stock' | 'reorder_point'>
type ActiveInventoryAlert = Database['public']['Tables']['inventory_alerts']['Row'] & {
  ingredient: Pick<IngredientRow, 'name' | 'unit' | 'current_stock'>
}

interface StockMetrics {
  currentStock: number
  minStock: number
  reorderPoint: number
}

const getStockNumbers = (snapshot: StockSnapshot): StockMetrics => {
  const currentStock = snapshot.current_stock ?? 0
  const minStock = snapshot.min_stock ?? 0
  const reorderPoint = snapshot.reorder_point ?? minStock
  return { currentStock, minStock, reorderPoint }
}

const isStockHealthy = (snapshot: StockSnapshot): boolean => {
  const { currentStock, reorderPoint } = getStockNumbers(snapshot)
  return currentStock > reorderPoint
}

const buildAlertMetadata = (
  ingredient: IngredientRow,
  overrides: Record<string, unknown> = {}
): Insert<'inventory_alerts'>['metadata'] => {
  const { currentStock, minStock, reorderPoint } = getStockNumbers(ingredient)
  return {
    current_stock: currentStock,
    min_stock: minStock,
    reorder_point: reorderPoint,
    ingredient_name: ingredient.name,
    unit: ingredient.unit,
    ...overrides
  }
}

const buildAlertPayload = (ingredient: IngredientRow): PendingInventoryAlert | null => {
  const { currentStock, minStock, reorderPoint } = getStockNumbers(ingredient)

  if (currentStock <= 0) {
    return {
      ingredient_id: ingredient['id'],
      alert_type: 'OUT_OF_STOCK',
      severity: 'CRITICAL',
      message: `${ingredient.name} habis! Stok saat ini: 0 ${ingredient.unit}`,
      metadata: buildAlertMetadata(ingredient)
    }
  }

  if (currentStock <= reorderPoint && reorderPoint > 0) {
    return {
      ingredient_id: ingredient['id'],
      alert_type: 'REORDER_NEEDED',
      severity: 'HIGH',
      message: `${ingredient.name} perlu dipesan ulang. Stok: ${currentStock} ${ingredient.unit}, Reorder point: ${reorderPoint} ${ingredient.unit}`,
      metadata: buildAlertMetadata(ingredient, {
        supplier: ingredient['supplier'],
        lead_time: ingredient['lead_time']
      })
    }
  }

  if (currentStock <= minStock && minStock > 0) {
    return {
      ingredient_id: ingredient['id'],
      alert_type: 'LOW_STOCK',
      severity: 'MEDIUM',
      message: `${ingredient.name} stok rendah. Stok: ${currentStock} ${ingredient.unit}, Minimum: ${minStock} ${ingredient.unit}`,
      metadata: buildAlertMetadata(ingredient)
    }
  }

  return null
}

const isValidAlert = (
  alert: PendingInventoryAlert | null
): alert is PendingInventoryAlert => alert !== null

/**
 * Service for managing inventory alerts
 * SERVER-ONLY: Uses server client for database operations
 */
export class InventoryAlertService {
  private readonly logger = dbLogger

  /**
   * Check and create alerts for low stock ingredients
   */
  async checkLowStockAlerts(userId: string): Promise<void> {
    try {
      const supabase = await createClient()
      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select()
        .eq('user_id', userId)
        .eq('is_active', true) as { data: IngredientRow[] | null; error: Error | null }

      if (error) {
        throw new Error(`Failed to fetch ingredients: ${error.message}`)
      }

      if (!ingredients || ingredients.length === 0) {
        return
      }

      await this.deactivateResolvedAlerts(userId, ingredients)

      const alerts = ingredients
        .map((ingredient) => buildAlertPayload(ingredient))
        .filter(isValidAlert)

      if (alerts.length === 0) {
        return
      }

      await Promise.all(
        alerts.map(async (alert) => {
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
                is_active: true,
                ...(alert.metadata && { metadata: alert.metadata as Json })
              } as any)
          }
        })
      )

      this.logger.info(
        {
          userId,
          alertCount: alerts.length
        },
        'Inventory alerts created'
      )
    } catch (error) {
      const normalizedError = normalizeError(error)
      this.logger.error({ error: normalizedError, userId }, 'Failed to check low stock alerts')
      throw normalizedError
    }
  }

  /**
   * Deactivate alerts for ingredients that are now above threshold
   */
  private async deactivateResolvedAlerts(
    userId: string,
    ingredients: StockSnapshot[]
  ): Promise<void> {
    try {
      const supabase = await createClient()
      
      const updatePromises = ingredients
        .filter(isStockHealthy)
        .map(async (ingredient) => {
          await supabase
            .from('inventory_alerts')
            .update({
              is_active: false,
              resolved_at: new Date().toISOString()
            } as never)
            .eq('ingredient_id', ingredient['id'])
            .eq('user_id', userId)
            .eq('is_active', true)
        })

      await Promise.all(updatePromises)
    } catch (error) {
      this.logger.error({ error: normalizeError(error) }, 'Failed to deactivate resolved alerts')
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
        .select()
        .eq('id', ingredientId)
        .eq('user_id', userId)
        .single() as { data: IngredientRow | null; error: Error | null }

      if (error || !ingredient) {
        return
      }

      if (isStockHealthy(ingredient)) {
        await this.deactivateResolvedAlerts(userId, [ingredient])
        return
      }

      const alertPayload = buildAlertPayload(ingredient)

      if (!alertPayload) {
        return
      }

      const { data: existingAlert } = await supabase
        .from('inventory_alerts')
        .select('id')
        .eq('ingredient_id', ingredientId)
        .eq('alert_type', alertPayload.alert_type)
        .eq('is_active', true)
        .eq('user_id', userId)
        .single()

      if (!existingAlert) {
        await supabase
          .from('inventory_alerts')
          .insert({
            alert_type: alertPayload.alert_type,
            severity: alertPayload.severity,
            message: alertPayload.message,
            ingredient_id: alertPayload.ingredient_id,
            user_id: userId,
            is_active: true,
            ...(alertPayload.metadata && { metadata: alertPayload.metadata as Json })
          })

        this.logger.info({
          ingredientId,
          alertType: alertPayload.alert_type
        }, 'Inventory alert created')
      }

    } catch (error) {
      this.logger.error({ error: normalizeError(error), ingredientId }, 'Failed to check ingredient alert')
    }
  }

  /**
   * Get active alerts for user
   */
  async getActiveAlerts(userId: string): Promise<ActiveInventoryAlert[]> {
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
        .order('created_at', { ascending: false }) as { data: ActiveInventoryAlert[] | null; error: Error | null }

      if (error) {
        throw new Error(`Failed to fetch alerts: ${error.message}`)
      }

      return alerts ?? []

    } catch (error) {
      this.logger.error({ error: normalizeError(error), userId }, 'Failed to get active alerts')
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
        } as never)
        .eq('id', alertId)
        .eq('user_id', userId)

      this.logger.info({ alertId }, 'Alert acknowledged')

    } catch (error) {
      const normalizedError = normalizeError(error)
      this.logger.error({ error: normalizedError, alertId }, 'Failed to acknowledge alert')
      throw normalizedError
    }
  }
}
