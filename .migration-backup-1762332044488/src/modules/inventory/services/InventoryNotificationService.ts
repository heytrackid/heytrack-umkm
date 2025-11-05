import type { SupabaseClient } from '@supabase/supabase-js'
import { apiLogger } from '@/lib/logger'
import { NotificationService } from '@/modules/notifications/services/NotificationService'
import type { Database } from '@/types/database'



export class InventoryNotificationService {
  /**
   * Check and create low stock alerts for all ingredients
   */
  static async checkLowStockAlerts(
    supabase: SupabaseClient<Database>,
    userId: string
  ): Promise<void> {
    try {
      // Get all ingredients with low stock
      const { data: ingredients, error } = await supabase
        .from('ingredients')
        .select('id, name, current_stock, min_stock, reorder_point')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        apiLogger.error({ error, userId }, 'Failed to check low stock alerts')
        return
      }

      if (!ingredients || ingredients.length === 0) {
        return
      }

      // Create notifications for each low stock ingredient
      for (const ingredient of ingredients) {
        const currentStock = ingredient.current_stock ?? 0
        const minStock = ingredient.min_stock ?? 0
        
        // Skip if stock is above minimum
        if (currentStock >= minStock) {
          continue
        }

        // Check if notification already exists (avoid spam)
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('entity_type', 'ingredient')
          .eq('entity_id', ingredient.id)
          .eq('is_read', false)
          .eq('is_dismissed', false)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
          .single()

        if (existingNotification) {
          continue // Skip if notification already exists
        }

        await NotificationService.createLowStockAlert(
          supabase,
          userId,
          ingredient.id,
          ingredient.name,
          currentStock,
          minStock
        )
      }

      apiLogger.info(
        { userId, count: ingredients.length },
        'Created low stock alerts'
      )
    } catch (error: unknown) {
      apiLogger.error({ error, userId }, 'Error checking low stock alerts')
    }
  }

  /**
   * Create out of stock alert
   */
  static async createOutOfStockAlert(
    supabase: SupabaseClient<Database>,
    userId: string,
    ingredientId: string,
    ingredientName: string
  ): Promise<void> {
    await NotificationService.createNotification(supabase, userId, {
      type: 'error',
      category: 'inventory',
      title: 'Stok Habis',
      message: `${ingredientName} sudah habis! Segera lakukan pembelian.`,
      priority: 'urgent',
      entity_type: 'ingredient',
      entity_id: ingredientId,
      action_url: `/ingredients?highlight=${ingredientId}`,
      metadata: {
        ingredient_name: ingredientName,
      },
    })
  }

  /**
   * Create reorder reminder notification
   */
  static async createReorderReminder(
    supabase: SupabaseClient<Database>,
    userId: string,
    ingredientId: string,
    ingredientName: string,
    currentStock: number,
    reorderPoint: number,
    reorderQuantity: number
  ): Promise<void> {
    await NotificationService.createNotification(supabase, userId, {
      type: 'warning',
      category: 'inventory',
      title: 'Saatnya Reorder',
      message: `${ingredientName} mencapai reorder point (${currentStock}/${reorderPoint}). Disarankan order ${reorderQuantity} unit.`,
      priority: 'high',
      entity_type: 'ingredient',
      entity_id: ingredientId,
      action_url: `/ingredients/purchases?ingredient=${ingredientId}`,
      metadata: {
        ingredient_name: ingredientName,
        current_stock: currentStock,
        reorder_point: reorderPoint,
        reorder_quantity: reorderQuantity,
      },
    })
  }

  /**
   * Create stock adjustment notification
   */
  static async createStockAdjustmentNotification(
    supabase: SupabaseClient<Database>,
    userId: string,
    ingredientId: string,
    ingredientName: string,
    oldStock: number,
    newStock: number,
    reason: string
  ): Promise<void> {
    const change = newStock - oldStock
    const changeText = change > 0 ? `+${change}` : change.toString()

    await NotificationService.createNotification(supabase, userId, {
      type: 'info',
      category: 'inventory',
      title: 'Stok Disesuaikan',
      message: `${ingredientName}: ${oldStock} → ${newStock} (${changeText}). Alasan: ${reason}`,
      priority: 'normal',
      entity_type: 'ingredient',
      entity_id: ingredientId,
      action_url: `/ingredients?highlight=${ingredientId}`,
      metadata: {
        ingredient_name: ingredientName,
        old_stock: oldStock,
        new_stock: newStock,
        change,
        reason,
      },
    })
  }
}
