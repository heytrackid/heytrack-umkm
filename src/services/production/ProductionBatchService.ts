import 'server-only'
import { dbLogger } from '@/lib/logger'
import type { Insert, Update, Row, WithNestedRelation, Json } from '@/types/database'
import { isRecord, hasKey, getErrorMessage, typed, safeGet } from '@/types/type-utilities'
import { createClient } from '@/utils/supabase/server'



type JsonValue = Json



/**
 * Production Batch Service
 * Manages production batch creation and order linking
 * SERVER-ONLY: Uses server client for database operations
 */


/* -------------------------------------------------------------------------- */
/*  DOMAIN TYPES                                                              */
/* -------------------------------------------------------------------------- */

type Recipe = Row<'recipes'>
type Order = Row<'orders'>
type OrderItem = Row<'order_items'>

type OrderItemWithRecipe = WithNestedRelation<OrderItem, 'recipe', 'recipes'>
type OrderItemWithBoth = OrderItem & {
  recipe: Recipe | null
  order: Order | null
}

/* -------------------------------------------------------------------------- */
/*  TYPE GUARDS                                                               */
/* -------------------------------------------------------------------------- */


function isOrderItemWithRecipe(item: JsonValue): item is OrderItemWithRecipe {
  return isRecord(item) && hasKey(item, 'recipe_id') && hasKey(item, 'recipe')
}

function isOrderItemWithBoth(item: JsonValue): item is OrderItemWithBoth {
  return isRecord(item) && hasKey(item, 'recipe') && hasKey(item, 'order')
}

export class ProductionBatchService {
  /**
   * Create production batch from confirmed orders
   * Groups orders by recipe for efficient batch production
   */
  static async createBatchFromOrders(
    orderIds: string[],
    userId: string,
    _plannedDate?: string
  ): Promise<{
    success: boolean
    batch_id?: string
    message: string
  }> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      // Get all order items from the specified orders
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          recipe_id,
          quantity,
          order_id,
          recipe:recipes (
            id,
            name,
            cost_per_unit
          )
        `)
        .in('order_id', orderIds)

      if (itemsError || !orderItems || orderItems.length === 0) {
        return {
          success: false,
          message: 'No order items found for the specified orders'
        }
      }

      // Group by recipe and sum quantities
      const recipeGroups = new Map<string, {
        recipe_id: string
        recipe_name: string
        total_quantity: number
        cost_per_unit: number
        order_count: number
      }>()

      // Filter and validate items
      const validItems = orderItems.filter(isOrderItemWithRecipe)

      for (const item of validItems) {
        const {recipe} = item
        if (!recipe) {continue}

        const existing = recipeGroups.get(item.recipe_id)
        if (existing) {
          existing.total_quantity += item.quantity
          existing.order_count += 1
        } else {
          recipeGroups.set(item.recipe_id, {
            recipe_id: item.recipe_id,
            recipe_name: recipe.name,
            total_quantity: item.quantity,
            cost_per_unit: safeGet(recipe, 'cost_per_unit') ?? 0,
            order_count: 1
          })
        }
      }

      // Create production batch for the most needed recipe
      // In a real system, you might create multiple batches
      const batches = Array.from(recipeGroups.values())
      const primaryBatch = batches.sort((a, b) => b.total_quantity - a.total_quantity)[0]

      if (!primaryBatch) {
        return {
          success: false,
          message: 'No valid recipes found for batch creation'
        }
      }

      // Create production batch
      const productionData: Insert<'productions'> = {
        recipe_id: primaryBatch.recipe_id,
        quantity: primaryBatch.total_quantity,
        cost_per_unit: primaryBatch.cost_per_unit,
        total_cost: primaryBatch.cost_per_unit * primaryBatch.total_quantity,
        labor_cost: 0, // To be filled during production
        status: 'PLANNED',
        user_id: userId,
        notes: `Auto-created from ${orderIds.length} order(s)`
      }

      const { data: production, error: prodError } = await supabase
        .from('productions')
        .insert(productionData)
        .select('id')
        .single()

      if (prodError || !production) {
        dbLogger.error({ error: prodError }, 'Failed to create production batch')
        return {
          success: false,
          message: 'Failed to create production batch'
        }
      }

      // Note: production_batch_id doesn't exist in orders table
      // Orders are linked to batches through order_items -> recipes -> productions relationship

      dbLogger.info({
        batchId: production['id'],
        recipeId: primaryBatch.recipe_id,
        quantity: primaryBatch.total_quantity,
        orderCount: orderIds.length
      }, 'Production batch created from orders')

      return {
        success: true,
        batch_id: production['id'],
        message: `Production batch created for ${primaryBatch['recipe_name']} (${primaryBatch.total_quantity} units from ${orderIds.length} orders)`
      }

    } catch (error) {
      dbLogger.error({ error }, 'Failed to create batch from orders')
      return {
        success: false,
        message: getErrorMessage(error)
      }
    }
  }

  /**
   * Get suggested batches based on pending/confirmed orders
   */
  static async getSuggestedBatches(userId: string): Promise<Array<{
    recipe_id: string
    recipe_name: string
    total_quantity: number
    order_count: number
    estimated_cost: number
    priority: 'HIGH' | 'LOW' | 'MEDIUM'
  }>> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      // Get all pending/confirmed orders without production batch
      const { data: orderItems, error } = await supabase
        .from('order_items')
          .select(`
          recipe_id,
          quantity,
          order:orders!inner (
            id,
            status,
            delivery_date
          ),
          recipe:recipes (
            id,
            name,
            cost_per_unit
          )
        `)
        .eq('order.user_id', userId)
        .in('order.status', ['PENDING', 'CONFIRMED', 'IN_PROGRESS'])

      if (error || !orderItems || orderItems.length === 0) {
        return []
      }

      // Group by recipe
      const recipeGroups = new Map<string, {
        recipe_id: string
        recipe_name: string
        total_quantity: number
        order_count: number
        estimated_cost: number
        urgent_count: number
        earliest_delivery: string | null
      }>()

      // Filter and validate items
      const validItems = orderItems.filter(isOrderItemWithBoth)

      for (const item of validItems) {
        const {recipe} = item
        const {order} = item
        if (!recipe || !order) {continue}

        const existing = recipeGroups.get(item.recipe_id)
        // production_priority doesn't exist in orders table, skip this check
        const isUrgent = false

        if (existing) {
          existing.total_quantity += item.quantity
          existing.order_count += 1
          existing.estimated_cost += (safeGet(recipe, 'cost_per_unit') ?? 0) * item.quantity
          if (isUrgent) {existing.urgent_count += 1}
          const deliveryDate = safeGet(order, 'delivery_date')
          if (deliveryDate && typeof deliveryDate === 'string' && (!existing.earliest_delivery || deliveryDate < existing.earliest_delivery)) {
            existing.earliest_delivery = deliveryDate
          }
        } else {
          const deliveryDate = safeGet(order, 'delivery_date')
          recipeGroups.set(item.recipe_id, {
            recipe_id: item.recipe_id,
            recipe_name: recipe.name,
            total_quantity: item.quantity,
            order_count: 1,
            estimated_cost: (recipe.cost_per_unit ?? 0) * item.quantity,
            urgent_count: isUrgent ? 1 : 0,
            earliest_delivery: typeof deliveryDate === 'string' ? deliveryDate : null
          })
        }
      }

      // Convert to array and determine priority
      const suggestions = Array.from(recipeGroups.values()).map(group => {
        let priority: 'HIGH' | 'LOW' | 'MEDIUM' = 'LOW'
        
        if (group.urgent_count > 0 || group.order_count >= 3) {
          priority = 'HIGH'
        } else if (group.order_count >= 2) {
          priority = 'MEDIUM'
        }

        return {
          recipe_id: group.recipe_id,
          recipe_name: group['recipe_name'],
          total_quantity: group.total_quantity,
          order_count: group.order_count,
          estimated_cost: group.estimated_cost,
          priority
        }
      })

      // Sort by priority and quantity
      return suggestions.sort((a, b) => {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) {return priorityDiff}
        return b.total_quantity - a.total_quantity
      })

    } catch (error) {
      dbLogger.error({ error }, 'Failed to get suggested batches')
      return []
    }
  }

  /**
   * Complete production batch and update actual costs
   */
  static async completeBatch(
    batchId: string,
    userId: string,
    actualCosts: {
      material_cost?: number
      labor_cost?: number
      overhead_cost?: number
    }
  ): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      const updateData: Update<'productions'> = {
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        labor_cost: actualCosts.labor_cost ?? 0,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('productions')
        .update(updateData)
        .eq('id', batchId)
        .eq('user_id', userId)

      if (error) {
        dbLogger.error({ error }, 'Failed to complete batch')
        return {
          success: false,
          message: 'Failed to complete production batch'
        }
      }

      dbLogger.info({ batchId }, 'Production batch completed')

      return {
        success: true,
        message: 'Production batch completed successfully'
      }

    } catch (error) {
      dbLogger.error({ error }, 'Failed to complete batch')
      return {
        success: false,
        message: 'Unexpected error completing batch'
      }
    }
  }
}
