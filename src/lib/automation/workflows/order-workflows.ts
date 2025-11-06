import { automationLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Row, Insert, Update, Database } from '@/types/database'
import type { WorkflowContext, WorkflowResult } from '@/types/features/automation'

/**
 * Order Workflow Handlers
 * Workflow automation handlers for order-related events
 */

import { triggerWorkflow } from './index'

type CustomerRow = Row<'customers'>
type OrderRow = Row<'orders'>
type OrderItemRow = Row<'order_items'>
type RecipeRow = Row<'recipes'>
type RecipeIngredientRow = Row<'recipe_ingredients'>
type IngredientRow = Row<'ingredients'>
type StockTransactionInsert = Insert<'stock_transactions'>
type FinancialRecordInsert = Insert<'financial_records'>
type _IngredientUpdate = Update<'ingredients'>
type CustomerUpdate = Update<'customers'>

type RecipeIngredientWithIngredient = RecipeIngredientRow & {
  ingredient: IngredientRow | null
}

type RecipeWithIngredients = RecipeRow & {
  recipe_ingredients: RecipeIngredientWithIngredient[] | null
}

type OrderItemWithRecipe = OrderItemRow & {
  recipe: RecipeWithIngredients | null
}

type OrderWithRelations = OrderRow & {
  order_items: OrderItemWithRecipe[] | null
  customer: CustomerRow | null
  financial_record_id: string | null
  production_batch_id: string | null
  user_id: string
}

export class OrderWorkflowHandlers {
  /**
   * Handle order completed event
   */
  static async handleOrderCompleted(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger, supabase } = context
    const orderId = event.entityId

    logger.info({ orderId }, 'Processing order completed workflow')

    try {
      if (!supabase) {
        throw new Error('Supabase client is not available in workflow context')
      }

      // Get order with items and recipes
      const { data, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            recipe:recipes (
              *,
              recipe_ingredients (
                *,
                ingredient:ingredients (*)
              )
            )
          ),
          customer:customers (*)
        `)
        .eq('id', orderId)
        .single()

      const order = data as OrderWithRelations | null

      if (orderError || !order) {
        throw new Error(`Order not found: ${orderError?.message}`)
      }

      // Update inventory stock
      await this.updateInventoryFromOrder(order, supabase)

      // Create financial record
      await this.createFinancialRecordFromOrder(order, supabase)

      // Update customer statistics
      if (order.customer) {
        await this.updateCustomerStats(order, supabase)
      }

      logger.info({ orderId, orderNo: order.order_no }, 'Order completed workflow finished')
      return {
        success: true,
        message: `Order ${order.order_no} completed processing`,
        data: { orderId, orderNo: order.order_no }
      }

    } catch (err: unknown) {
      logger.error({ orderId, error: getErrorMessage(err) }, 'Order completed workflow failed')
      return {
        success: false,
        message: 'Failed to process order completion',
        error: getErrorMessage(err)
      }
    }
  }

  /**
   * Handle order status changed event
   * ✅ NEW: Auto-create production batch when order is CONFIRMED
   */
  static async handleOrderStatusChanged(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger, supabase } = context

    const newStatus = typeof event.data === 'object' && event.data !== null && 'newStatus' in event.data 
      ? (event.data as { newStatus?: string }).newStatus 
      : undefined
    
    logger.info({ orderId: event.entityId, status: newStatus }, 'Processing order status change workflow')

    try {
      // Auto-create production batch when order is CONFIRMED
      if (newStatus === 'CONFIRMED' && supabase) {
        await this.createProductionBatchForOrder(event.entityId, supabase, logger)
      }

      return {
        success: true,
        message: `Status change processed for order ${event.entityId}`
      }
    } catch (err: unknown) {
      logger.error({ orderId: event.entityId, error: getErrorMessage(err) }, 'Order status change workflow failed')
      return {
        success: false,
        message: 'Failed to process order status change',
        error: getErrorMessage(err)
      }
    }
  }

  /**
   * Create production batch for confirmed order
   * ✅ NEW: Auto-creates production batch and reserves ingredients
   */
  private static async createProductionBatchForOrder(
    orderId: string, 
    supabase: SupabaseClient<Database>,
    _logger: unknown
  ): Promise<void> {
    const logger = automationLogger
    logger.info({ orderId }, 'Creating production batch for confirmed order')

    // Get order with items
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          recipe:recipes (*)
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !orderData) {
      logger.error({ orderId, error: orderError }, 'Failed to fetch order for production batch')
      return
    }

    const order = orderData as OrderWithRelations

    // Skip if already has production batch
    if (order.production_batch_id) {
      logger.info({ orderId, batchId: order.production_batch_id }, 'Order already has production batch')
      return
    }

    // Group items by recipe
    const recipeGroups = new Map<string, { recipe: RecipeRow; totalQuantity: number }>()
    
    for (const item of order.order_items ?? []) {
      if (!item.recipe) {continue}
      
      const existing = recipeGroups.get(item.recipe.id)
      if (existing) {
        existing.totalQuantity += Number(item.quantity ?? 0)
      } else {
        recipeGroups.set(item.recipe.id, {
          recipe: item.recipe,
          totalQuantity: Number(item.quantity ?? 0)
        })
      }
    }

    // Create production batch for each recipe
    for (const [recipeId, { recipe, totalQuantity }] of recipeGroups) {
      const batchNumber = `BATCH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${orderId.slice(0, 8)}`
      
      const productionBatch = {
        recipe_id: recipeId,
        quantity: totalQuantity,
        cost_per_unit: recipe.cost_per_unit ?? 0,
        total_cost: (recipe.cost_per_unit ?? 0) * totalQuantity,
        status: 'PLANNED' as const,
        notes: `Auto-created for order ${order.order_no}`,
        user_id: order.user_id,
        labor_cost: 0,
        batch_status: 'PLANNED' as const,
        total_orders: 1,
        planned_start_time: order.delivery_date ?? new Date().toISOString()
      }

      const { data: batchData, error: batchError } = await supabase
        .from('productions')
        .insert(productionBatch)
        .select()
        .single()

      if (batchError) {
        logger.error({ orderId, recipeId, error: batchError }, 'Failed to create production batch')
        continue
      }

      // Update order with production_batch_id (first batch only)
      if (batchData && !order.production_batch_id) {
        await supabase
          .from('orders')
          .update({ production_batch_id: batchData.id })
          .eq('id', orderId)
      }

      // Reserve ingredients for this batch
      await this.reserveIngredientsForBatch(recipeId, totalQuantity, orderId, order.user_id, supabase, automationLogger)

      logger.info({ 
        orderId, 
        batchId: batchData?.id,
        recipeId,
        quantity: totalQuantity,
        batchNumber
      }, 'Production batch created and ingredients reserved')
    }
  }

  /**
   * Reserve ingredients for production batch
   * ✅ NEW: Creates stock reservations for order
   */
  private static async reserveIngredientsForBatch(
    recipeId: string,
    quantity: number,
    orderId: string,
    userId: string,
    supabase: SupabaseClient<Database>,
    _logger: unknown
  ): Promise<void> {
    const logger = automationLogger
    // Get recipe ingredients
    const { data: recipeIngredients, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select('*, ingredient:ingredients(*)')
      .eq('recipe_id', recipeId)

    if (ingredientsError || !recipeIngredients) {
      logger.error({ recipeId, error: ingredientsError }, 'Failed to fetch recipe ingredients')
      return
    }

    // Create reservations for each ingredient
    for (const recipeIngredient of recipeIngredients) {
      if (!recipeIngredient.ingredient) {continue}

      const requiredQuantity = Number(recipeIngredient.quantity ?? 0) * quantity

      const reservation = {
        ingredient_id: recipeIngredient.ingredient.id,
        order_id: orderId,
        reserved_quantity: requiredQuantity,
        status: 'ACTIVE' as const,
        user_id: userId,
        notes: `Reserved for production batch - Recipe: ${recipeId}`
      }

      // Note: stock_reservations table exists in database but not in generated types yet
      // This will work at runtime
      type SupabaseWithReservations = typeof supabase & {
        from(table: 'stock_reservations'): {
          insert: (data: typeof reservation) => Promise<{ error: unknown }>
        }
      }
      const { error: reservationError } = await (supabase as SupabaseWithReservations)
        .from('stock_reservations')
        .insert(reservation)

      if (reservationError) {
        logger.error({ 
          ingredientId: recipeIngredient.ingredient.id,
          error: reservationError 
        }, 'Failed to create stock reservation')
      }
    }
  }

  /**
   * Handle order cancelled event
   */
  static async handleOrderCancelled(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger, supabase } = context

    logger.info({ orderId: event.entityId }, 'Processing order cancelled workflow')

    try {
      if (!supabase) {
        throw new Error('Supabase client is not available in workflow context')
      }

      const orderId = event.entityId

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            recipe:recipes (
              *,
              recipe_ingredients (
                *,
                ingredient:ingredients (*)
              )
            )
          )
        `)
        .eq('id', orderId)
        .single()

      if (orderError || !orderData) {
        throw new Error(`Order not found for cancellation: ${orderError?.message}`)
      }

      const order = orderData as OrderWithRelations

      await this.restoreInventoryFromCancelledOrder(order, supabase)

      if ('financial_record_id' in order && order.financial_record_id) {
        const { error: deleteError } = await supabase
          .from('financial_records')
          .delete()
          .eq('id', order.financial_record_id)

        if (deleteError) {
          logger.error({ orderId, financialRecordId: order.financial_record_id, error: getErrorMessage(deleteError) }, 'Failed to remove financial record for cancelled order')
        }
      }

      if (order.customer_id) {
        const customerUpdate: CustomerUpdate = {
          last_order_date: new Date().toISOString().split('T')[0]
        }

        const { error: customerUpdateError } = await supabase
          .from('customers')
          .update(customerUpdate)
          .eq('id', order.customer_id)

        if (customerUpdateError) {
          logger.warn({ customerId: order.customer_id, error: getErrorMessage(customerUpdateError) }, 'Failed to update customer stats for cancelled order')
        }
      }

      logger.info({ orderId: event.entityId }, 'Order cancelled workflow finished')
      return {
        success: true,
        message: `Order ${event.entityId} cancellation processed`,
        data: { orderId: event.entityId }
      }

    } catch (err: unknown) {
      logger.error({ orderId: event.entityId, error: getErrorMessage(err) }, 'Order cancelled workflow failed')
      return {
        success: false,
        message: 'Failed to process order cancellation',
        error: getErrorMessage(err)
      }
    }
  }

  /**
   * Update inventory stock from completed order
   * ✅ FIX: Only create stock transaction, let trigger handle stock update
   */
  private static async updateInventoryFromOrder(order: OrderWithRelations, supabase: SupabaseClient<Database>): Promise<void> {
    automationLogger.debug('Updating inventory from order items')
    const transactionUserId = order.user_id || 'automation-system'

    for (const orderItem of order.order_items ?? []) {
      const {recipe} = orderItem

      if (!recipe?.recipe_ingredients) {continue}

      for (const recipeIngredient of recipe.recipe_ingredients || []) {
        const {ingredient} = recipeIngredient

        if (!ingredient) {continue}

        const usedQuantity = Number(recipeIngredient.quantity || 0) * Number(orderItem.quantity || 0)

        // ✅ FIX: Only create stock transaction - trigger will auto-update current_stock
        const stockTransaction: StockTransactionInsert = {
          ingredient_id: ingredient.id,
          quantity: usedQuantity, // Positive value, trigger handles the deduction
          reference: `ORDER-${order.order_no}`,
          total_price: usedQuantity * Number(ingredient.price_per_unit || 0),
          type: 'USAGE',
          unit_price: ingredient.price_per_unit || null,
          user_id: transactionUserId,
          notes: `Used for order ${order.order_no} - ${ingredient.name}`
        }

        const { error: transactionError } = await supabase
          .from('stock_transactions')
          .insert(stockTransaction)

        if (transactionError) {
          automationLogger.error({ transactionError }, 'Failed to create stock transaction')
          continue
        }

        automationLogger.debug({ 
          ingredientId: ingredient.id, 
          usedQuantity 
        }, 'Stock transaction created, trigger will update stock')

        // Calculate new stock for alerts
        const currentStock = Number(ingredient.current_stock ?? 0)
        const newStock = currentStock - usedQuantity
        
        // Check for low stock alerts
        const minStock = Number(ingredient.min_stock ?? 0)
        if (newStock <= minStock && newStock > 0) {
          try {
            await triggerWorkflow('inventory.low_stock', ingredient.id, {
              ingredient: {
                id: ingredient.id,
                name: ingredient.name,
                unit: ingredient.unit || '',
                min_stock: minStock
              },
              currentStock: newStock,
              severity: newStock <= minStock * 0.5 ? 'critical' : 'warning'
            })
          } catch (error) {
            // Log but don't fail the main operation
            automationLogger.error({ error, ingredientId: ingredient.id }, 'Failed to trigger low stock workflow')
          }
        }

        if (newStock <= 0) {
          try {
            await triggerWorkflow('inventory.out_of_stock', ingredient.id, {
              ingredient: {
                id: ingredient.id,
                name: ingredient.name,
                unit: ingredient.unit || ''
              },
              previousStock: currentStock
            })
          } catch (error) {
            // Log but don't fail the main operation
            automationLogger.error({ error, ingredientId: ingredient.id }, 'Failed to trigger out of stock workflow')
          }
        }
      }
    }
  }

  /**
   * Restore inventory from cancelled order
   * ✅ FIX: Only create stock transaction, let trigger handle stock update
   */
  private static async restoreInventoryFromCancelledOrder(order: OrderWithRelations, supabase: SupabaseClient<Database>): Promise<void> {
    automationLogger.debug('Restoring inventory from cancelled order')
    const transactionUserId = order.user_id || 'automation-system'

    for (const orderItem of order.order_items ?? []) {
      const {recipe} = orderItem

      if (!recipe?.recipe_ingredients) {continue}

      for (const recipeIngredient of recipe.recipe_ingredients || []) {
        const {ingredient} = recipeIngredient
        if (!ingredient) {continue}

        const restoredQuantity = Number(recipeIngredient.quantity || 0) * Number(orderItem.quantity || 0)

        // ✅ FIX: Only create stock transaction - trigger will auto-update current_stock
        const stockTransaction: StockTransactionInsert = {
          ingredient_id: ingredient.id,
          quantity: restoredQuantity, // Positive ADJUSTMENT increases stock
          reference: `ORDER-CANCEL-${order.order_no}`,
          total_price: restoredQuantity * Number(ingredient.price_per_unit || 0),
          type: 'ADJUSTMENT',
          unit_price: ingredient.price_per_unit || null,
          user_id: transactionUserId,
          notes: `Restored from cancelled order ${order.order_no} - ${ingredient.name}`
        }

        const { error: transactionError } = await supabase
          .from('stock_transactions')
          .insert(stockTransaction)

        if (transactionError) {
          automationLogger.error({ transactionError }, 'Failed to create restoration transaction')
          continue
        }

        automationLogger.debug({ 
          ingredientId: ingredient.id, 
          restoredQuantity 
        }, 'Restoration transaction created, trigger will update stock')
      }
    }
  }

  /**
   * Create financial record for completed order
   * ✅ NEW: Creates both INCOME (revenue) and EXPENSE (COGS) records
   */
  private static async createFinancialRecordFromOrder(order: OrderWithRelations, supabase: SupabaseClient<Database>): Promise<void> {
    automationLogger.debug('Creating financial records for completed order')

    // 1. Create INCOME record (Revenue)
    const incomeRecord = {
      type: 'INCOME',
      category: 'Penjualan',
      amount: order.total_amount ?? 0,
      description: `Penjualan - Order ${order.order_no}`,
      reference: `ORDER-${order.order_no}`,
      date: new Date().toISOString(),
      user_id: order.user_id
    } as FinancialRecordInsert

    const { data: incomeData, error: incomeError } = await supabase
      .from('financial_records')
      .insert(incomeRecord)
      .select()
      .single()

    if (incomeError) {
      automationLogger.error({ incomeError }, 'Failed to create income record')
      throw new Error(`Income record creation failed: ${incomeError.message}`)
    }

    // Update order with financial_record_id
    if (incomeData) {
      await supabase
        .from('orders')
        .update({ financial_record_id: incomeData.id })
        .eq('id', order.id)
    }

    // 2. Calculate total COGS from order items
    let totalCogs = 0
    type OrderItemWithHpp = OrderItemWithRecipe & { hpp_at_order?: number }
    for (const item of (order.order_items ?? []) as OrderItemWithHpp[]) {
      // hpp_at_order exists in database but not in generated types yet
      const hppAtOrder = Number(item.hpp_at_order ?? 0)
      const quantity = Number(item.quantity ?? 0)
      totalCogs += hppAtOrder * quantity
    }

    // 3. Create COGS record (Expense)
    if (totalCogs > 0) {
      const cogsRecord = {
        type: 'EXPENSE',
        category: 'COGS',
        amount: totalCogs,
        description: `COGS - Order ${order.order_no}`,
        reference: `ORDER-COGS-${order.order_no}`,
        date: new Date().toISOString(),
        user_id: order.user_id
      } as FinancialRecordInsert

      const { error: cogsError } = await supabase
        .from('financial_records')
        .insert(cogsRecord)

      if (cogsError) {
        automationLogger.error({ cogsError }, 'Failed to create COGS record')
        // Don't throw - income already created
      } else {
        const profit = (order.total_amount ?? 0) - totalCogs
        const profitMargin = order.total_amount ? (profit / order.total_amount) * 100 : 0
        
        automationLogger.info({ 
          orderNo: order.order_no,
          revenue: order.total_amount,
          cogs: totalCogs,
          profit,
          profitMargin: `${profitMargin.toFixed(2)  }%`
        }, 'Financial records created with COGS tracking')
      }
    }
  }

  /**
   * Update customer statistics
   */
  private static async updateCustomerStats(order: OrderWithRelations, supabase: SupabaseClient<Database>): Promise<void> {
    if (!order.customer_id) {return}

    automationLogger.debug('Updating customer statistics')

    // Get current customer data
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', order.customer_id)
      .single()

    if (customer) {
      const newTotalOrders = (Number((customer).total_orders) || 0) + 1
      const newTotalSpent = (Number((customer).total_spent) || 0) + Number(order.total_amount)
      const newAverageOrderValue = newTotalSpent / newTotalOrders

      await supabase
        .from('customers')
        .update({
          total_orders: newTotalOrders,
          total_spent: newTotalSpent,
          average_order_value: newAverageOrderValue,
          last_order_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', order.customer_id)
    }
  }
}
