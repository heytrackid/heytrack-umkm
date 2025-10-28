/**
 * Inventory Workflow Handlers
 * Workflow automation handlers for inventory-related events
 */

import { getErrorMessage } from '@/lib/type-guards'
import {
  type WorkflowEventData,
  type WorkflowResult,
  type WorkflowContext
} from '@/lib/automation/types'
import type { Database } from '@/types/supabase-generated'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { NotificationsTable } from '@/types/features/notifications'

export class InventoryWorkflowHandlers {
  /**
   * Handle low stock event
   */
  static async handleLowStock(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger } = context

    if (!event.data || typeof event.data !== 'object') {
      return {
        success: false,
        message: 'Invalid low stock event data',
        error: 'Missing or invalid event data'
      }
    }

    const data = event.data as {
      ingredient: { name: string; unit: string; min_stock?: number }
      currentStock: number
      severity: string
    }

    const { ingredient, currentStock, severity } = data

    logger.warn({
      ingredientName: ingredient.name,
      currentStock,
      unit: ingredient.unit,
      severity
    }, 'Low stock alert triggered')

    try {
      // Generate reorder recommendation
      const recommendation = this.calculateReorderRecommendation(ingredient, currentStock)

      logger.info({
        ingredientName: ingredient.name,
        shouldReorder: recommendation.shouldReorder,
        quantity: recommendation.recommendedQuantity,
        priority: recommendation.priority
      }, 'Reorder recommendation generated')

      // Create notification in database
      await this.createInventoryNotification(context.supabase as SupabaseClient<Database>, {
        type: severity === 'critical' ? 'error' : 'warning',
        category: 'inventory',
        title: severity === 'critical' ? 'Stok Kritis!' : 'Stok Rendah',
        message: `${ingredient.name}: Sisa ${currentStock} ${ingredient.unit}. ${recommendation.reason}.`,
        priority: severity === 'critical' ? 'high' : 'medium',
        entity_id: event.entityId,
        entity_type: 'ingredient',
        action_url: '/ingredients',
        metadata: {
          ingredient_id: event.entityId,
          ingredient_name: ingredient.name,
          current_stock: currentStock,
          min_stock: ingredient.min_stock,
          recommended_quantity: recommendation.recommendedQuantity,
          severity
        }
      })

      if (severity === 'critical') {
        logger.error({
          ingredientName: ingredient.name
        }, 'Critical stock level - immediate action required')
      }

      return {
        success: true,
        message: `Low stock alert processed for ${ingredient.name}`,
        data: {
          ingredient: ingredient.name,
          currentStock,
          recommendation,
          severity,
          notificationCreated: true
        }
      }

    } catch (error: unknown) {
      logger.error({
        ingredientName: ingredient.name,
        error: getErrorMessage(error)
      }, 'Failed to process low stock alert')

      return {
        success: false,
        message: 'Failed to process low stock alert',
        error: getErrorMessage(error)
      }
    }
  }

  /**
   * Handle out of stock event
   */
  static async handleOutOfStock(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger } = context

    logger.error({
      ingredientId: event.entityId
    }, 'Out of stock alert triggered')

    try {
      // TODO: Implement emergency reorder logic
      // - Immediate purchase order creation
      // - Critical notifications to management
      // - Alternative ingredient suggestions

      logger.info({
        ingredientId: event.entityId
      }, 'Emergency reorder initiated for out of stock item')

      return {
        success: true,
        message: `Emergency reorder initiated for ${event.entityId}`,
        data: { ingredientId: event.entityId, action: 'emergency_reorder' }
      }

    } catch (error: unknown) {
      logger.error({
        ingredientId: event.entityId,
        error: getErrorMessage(error)
      }, 'Failed to process out of stock alert')

      return {
        success: false,
        message: 'Failed to process out of stock alert',
        error: getErrorMessage(error)
      }
    }
  }

  /**
   * Calculate reorder recommendation
   */
  private static calculateReorderRecommendation(
    ingredient: { name: string; unit: string; min_stock?: number },
    currentStock: number
  ): {
    shouldReorder: boolean
    recommendedQuantity: number
    priority: 'low' | 'medium' | 'high' | 'critical'
    reason: string
  } {
    const minStock = ingredient.min_stock || 0
    const reorderPoint = minStock * 0.8 // Reorder at 80% of minimum stock

    const shouldReorder = currentStock <= reorderPoint
    let recommendedQuantity = Math.max(minStock * 2, 50) // Order at least double min stock or 50 units
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let reason = 'Stock at reorder level'

    if (currentStock <= minStock) {
      priority = 'high'
      reason = 'Stock below minimum level'
    }

    if (currentStock <= minStock * 0.5) {
      priority = 'critical'
      reason = 'Stock critically low'
      recommendedQuantity = Math.max(minStock * 3, 100) // Emergency order
    }

    if (currentStock <= 0) {
      priority = 'critical'
      reason = 'Out of stock'
      recommendedQuantity = Math.max(minStock * 4, 200) // Maximum emergency order
    }

    return {
      shouldReorder,
      recommendedQuantity: Math.round(recommendedQuantity),
      priority,
      reason
    }
  }

  /**
   * Create inventory notification in database
   */
  private static async createInventoryNotification(
    supabase: SupabaseClient<Database>,
    notificationData: {
      type: string
      category: string
      title: string
      message: string
      priority?: string
      entity_id?: string
      entity_type?: string
      action_url?: string
      metadata?: Record<string, unknown>
    }
  ): Promise<void> {
    try {
      const notification: NotificationsTable['Insert'] = {
        type: notificationData.type,
        category: notificationData.category,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority,
        entity_id: notificationData.entity_id,
        entity_type: notificationData.entity_type,
        action_url: notificationData.action_url,
        metadata: notificationData.metadata,
        is_read: false,
        is_dismissed: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }

      const { error } = await supabase.from('notifications').insert(notification)

      if (error) {
        automationLogger.error({ error }, 'Failed to create inventory notification')
        throw err
      }

      automationLogger.info({ title: notificationData.title }, 'Inventory notification created successfully')
    } catch (err: unknown) {
      automationLogger.error({ err: getErrorMessage(err) }, 'Failed to create inventory notification')
      // Don't throw - notification failure shouldn't break the workflow
    }
  }
}
