import { automationLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'

import type { Insert, Database, Json } from '@/types/database'
import type {WorkflowResult,
   WorkflowContext
} from '@/types/features/automation'

import type { SupabaseClient } from '@supabase/supabase-js'

type StockTransactionInsert = Insert<'stock_transactions'>
type IngredientPurchaseRow = {
  id: string
  ingredient_id: string
  quantity: number
  cost_per_unit: number | null
  user_id: string
  ingredient: {
    id: string
    name: string
    unit: string
  } | null
}

/**
 * Inventory Workflow Handlers
 * Workflow automation handlers for inventory-related events
 */

export class InventoryWorkflowHandlers {
  /**
    * Handle out of stock event
    */
  static async handleOutOfStock(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger } = context

    if (!event['data'] || typeof event['data'] !== 'object') {
      return {
        success: false,
        message: 'Invalid out of stock event data',
        error: 'Missing or invalid event data'
      }
    }

    const data = event.data as {
      ingredient: { name: string; unit: string; min_stock?: number }
      previousStock: number
      currentStock: number
      severity: string
    }

    const { ingredient, currentStock, severity } = data

    logger.error({
      ingredientName: ingredient.name,
      currentStock,
      unit: ingredient.unit,
      severity
    }, 'Out of stock alert triggered - CRITICAL')

    try {
      // Generate reorder recommendation
      const recommendation = this.calculateReorderRecommendation(ingredient, currentStock)

      logger.info({
        ingredientName: ingredient.name,
        shouldReorder: recommendation.shouldReorder,
        quantity: recommendation.recommendedQuantity,
        priority: recommendation.priority
      }, 'Urgent reorder recommendation generated')

      // Create critical notification in database
      await this.createInventoryNotification(context.supabase as SupabaseClient<Database>, {
        type: 'error',
        category: 'inventory',
        title: 'STOK HABIS - TINDAKAN DARURAT!',
        message: `${ingredient.name}: STOK HABIS (${currentStock} ${ingredient.unit}). ${recommendation.reason}. SEGERA LAKUKAN PEMESANAN!`,
        priority: 'urgent',
        entity_id: event.entityId,
        entity_type: 'ingredient',
        action_url: '/ingredients',
        metadata: {
          ingredient_id: event.entityId,
          ingredient_name: ingredient.name,
          current_stock: currentStock,
          min_stock: ingredient.min_stock,
          recommended_quantity: recommendation.recommendedQuantity,
          severity: 'critical',
          out_of_stock: true
        }
      })

      logger.error({
        ingredientName: ingredient.name,
        recommendedQuantity: recommendation.recommendedQuantity
      }, 'CRITICAL: Out of stock - immediate reorder required')

      return {
        success: true,
        message: `CRITICAL: Out of stock alert processed for ${ingredient.name}`,
        data: {
          ingredient: ingredient.name,
          currentStock,
          recommendation,
          severity: 'critical',
          notificationCreated: true,
          outOfStock: true
        }
      }

    } catch (error: unknown) {
      logger.error({
        ingredientName: ingredient.name,
        error: getErrorMessage(error)
      }, 'CRITICAL: Failed to process out of stock alert')

      return {
        success: false,
        message: 'Failed to process out of stock alert',
        error: getErrorMessage(error)
      }
    }
  }

  /**
    * Handle low stock event
    */
  static async handleLowStock(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger } = context

    if (!event['data'] || typeof event['data'] !== 'object') {
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
   * Calculate reorder recommendation
   */
  private static calculateReorderRecommendation(
    ingredient: { name: string; unit: string; min_stock?: number },
    currentStock: number
  ): {
    shouldReorder: boolean
    recommendedQuantity: number
    priority: 'critical' | 'high' | 'low' | 'medium'
    reason: string
  } {
    const minStock = ingredient.min_stock ?? 0
    const reorderPoint = minStock * 0.8 // Reorder at 80% of minimum stock

    const shouldReorder = currentStock <= reorderPoint
    let recommendedQuantity = Math.max(minStock * 2, 50) // Order at least double min stock or 50 units
    let priority: 'critical' | 'high' | 'low' | 'medium' = 'low'
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
   * Handle purchase completed event
   * ✅ NEW: Auto-increase inventory when purchase is completed/received
   */
  static async handlePurchaseCompleted(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger, supabase } = context
    const purchaseId = event.entityId

    logger.info({ purchaseId }, 'Processing purchase completed workflow')

    try {
      if (!supabase) {
        throw new Error('Supabase client is not available in workflow context')
      }

      // Get purchase with ingredient details
      const { data: purchase, error: purchaseError } = await supabase
        .from('ingredient_purchases')
        .select(`
          *,
          ingredient:ingredients (*)
        `)
        .eq('id', purchaseId)
        .single()

      if (purchaseError || !purchase) {
        throw new Error(`Purchase not found: ${purchaseError?.message}`)
      }

      const purchaseData = purchase as IngredientPurchaseRow

      // Auto-increase inventory for completed purchase
      await this.increaseInventoryFromPurchase(purchaseData, supabase)

      logger.info({
        purchaseId,
        ingredientId: purchaseData.ingredient_id,
        quantity: purchaseData.quantity
      }, 'Purchase completed workflow finished - inventory increased')

      return {
        success: true,
        message: `Purchase ${purchaseId} completed - inventory updated`,
        data: {
          purchaseId,
          ingredientId: purchaseData.ingredient_id,
          quantityReceived: purchaseData.quantity
        }
      }

    } catch (error) {
      logger.error({ purchaseId, error: getErrorMessage(error) }, 'Purchase completed workflow failed')
      return {
        success: false,
        message: 'Failed to process purchase completion',
        error: getErrorMessage(error)
      }
    }
  }

  /**
   * Increase inventory when purchase is completed
   * ✅ NEW: Creates stock transaction to increase inventory
   */
  private static async increaseInventoryFromPurchase(
    purchase: IngredientPurchaseRow,
    supabase: SupabaseClient<Database>
  ): Promise<void> {
    automationLogger.debug('Increasing inventory from completed purchase')

    if (!purchase.ingredient) {
      automationLogger.warn({ purchaseId: purchase.id }, 'No ingredient found for purchase')
      return
    }

    const ingredient = purchase.ingredient
    const quantityReceived = purchase.quantity ?? 0
    const unitPrice = purchase.cost_per_unit ?? 0
    const totalCost = quantityReceived * unitPrice

    // Create stock transaction to increase inventory
    const stockTransaction: StockTransactionInsert = {
      ingredient_id: ingredient.id,
      quantity: quantityReceived, // Positive quantity = increase stock
      reference: `PURCHASE-${purchase.id}`,
      total_price: totalCost,
      type: 'PURCHASE',
      unit_price: unitPrice,
      user_id: purchase.user_id || 'automation-system',
      notes: `Purchase received - ${ingredient.name} (${quantityReceived} ${ingredient.unit || 'units'})`
    }

    const { error: transactionError } = await supabase
      .from('stock_transactions')
      .insert(stockTransaction)

    if (transactionError) {
      automationLogger.error({ transactionError }, 'Failed to create purchase completion stock transaction')
      throw new Error(`Stock transaction creation failed: ${transactionError.message}`)
    }

    automationLogger.info({
      purchaseId: purchase.id,
      ingredientName: ingredient.name,
      quantityReceived,
      totalCost
    }, 'Purchase completion inventory increase recorded')
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
      const metadata = notificationData.metadata
        ? JSON.parse(JSON.stringify(notificationData.metadata)) as Json
        : undefined

      const notification: Insert<'notifications'> = {
        type: notificationData.type,
        category: notificationData.category,
        title: notificationData.title,
        message: notificationData.message,
        priority: notificationData.priority,
        entity_id: notificationData.entity_id,
        entity_type: notificationData.entity_type,
        action_url: notificationData.action_url,
        metadata,
        is_read: false,
        is_dismissed: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }

      const { error } = await supabase.from('notifications').insert(notification)

      if (error) {
        automationLogger.error({ error }, 'Failed to create inventory notification')
        throw error
      }

      automationLogger.info({ title: notificationData.title }, 'Inventory notification created successfully')
    } catch (error: unknown) {
      automationLogger.error({ error: getErrorMessage(error) }, 'Failed to create inventory notification')
      // Don't throw - notification failure shouldn't break the workflow
    }
  }
}
