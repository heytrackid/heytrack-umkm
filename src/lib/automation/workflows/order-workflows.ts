/**
 * Order Workflow Handlers
 * Workflow automation handlers for order-related events
 */

import { automationLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
// import { triggerWorkflow } from '@/lib/automation/workflows' TODO: benerin ini
import type { SupabaseClient } from '@supabase/supabase-js'

// Temporary stub for triggerWorkflow
const triggerWorkflow = async (_workflow: string, _context: unknown) => {
  automationLogger.warn('triggerWorkflow stub called')
}

import type { Database } from '@/types/supabase-generated'

// Workflow types
export interface WorkflowResult {
  success: boolean
  message: string
  data?: unknown
  error?: string
}

export interface WorkflowContext {
  event: {
    entityId: string
    data?: unknown
  }
  logger: typeof automationLogger
  supabase?: SupabaseClient<Database>
}

type CustomerRow = Database['public']['Tables']['customers']['Row']
type OrderRow = Database['public']['Tables']['orders']['Row']
type OrderItemRow = Database['public']['Tables']['order_items']['Row']
type RecipeRow = Database['public']['Tables']['recipes']['Row']
type RecipeIngredientRow = Database['public']['Tables']['recipe_ingredients']['Row']
type IngredientRow = Database['public']['Tables']['ingredients']['Row']
// StockTransactionInsert already imported from domain types
type FinancialRecordInsert = Database['public']['Tables']['financial_records']['Insert']
type IngredientUpdate = Database['public']['Tables']['ingredients']['Update']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

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
  user_id: string
}

export class OrderWorkflowHandlers {
  /**
   * Handle order completed event
   */
  static async handleOrderCompleted(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger } = context
    const {supabase} = context
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

  static async handleOrderStatusChanged(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger } = context

    logger.info({ orderId: event.entityId, status: (event.data as any)?.newStatus }, 'Processing order status change workflow')

    return {
      success: true,
      message: `Status change processed for order ${event.entityId}`
    }
  }

  /**
   * Handle order cancelled event
   */
  static async handleOrderCancelled(context: WorkflowContext): Promise<WorkflowResult> {
    const { event, logger } = context
    const {supabase} = context

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

        const { error: customerUpdateError } = await (supabase as any)
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
   */
  private static async updateInventoryFromOrder(order: OrderWithRelations, supabase: SupabaseClient<Database>): Promise<void> {
    automationLogger.debug('Updating inventory from order items')
    const transactionUserId = order.user_id ?? 'automation-system'

    for (const orderItem of order.order_items || []) {
      const {recipe} = orderItem

      if (!recipe || !recipe.recipe_ingredients) {continue}

      for (const recipeIngredient of recipe.recipe_ingredients || []) {
        const {ingredient} = recipeIngredient

        if (!ingredient) {continue}

        const usedQuantity = Number(recipeIngredient.quantity ?? 0) * Number(orderItem.quantity ?? 0)
        const currentStock = Number(ingredient.current_stock ?? 0)
        const newStock = Math.max(0, currentStock - usedQuantity)

        // Update ingredient stock
        const ingredientUpdate: IngredientUpdate = {
          current_stock: newStock,
          updated_at: new Date().toISOString()
        }

        const { error: updateError } = await (supabase as any)
          .from('ingredients')
          .update(ingredientUpdate)
          .eq('id', ingredient.id)

        if (updateError) {
          automationLogger.error({ updateError }, 'Failed to update inventory stock')
          continue
        }

        // Create stock transaction record
        const stockTransaction: StockTransactionInsert = {
          ingredient_id: ingredient.id,
          quantity: -usedQuantity,
          reference: `ORDER-${order.order_no}`,
          total_price: usedQuantity * Number(ingredient.price_per_unit ?? 0),
          type: 'USAGE',
          unit_price: ingredient.price_per_unit ?? null,
          user_id: transactionUserId,
          notes: `Used for order ${order.order_no} - ${ingredient.name}`
        }

        await (supabase as any).from('stock_transactions').insert(stockTransaction)

        // Check for low stock alerts
        const minStock = Number(ingredient.min_stock ?? 0)
        if (newStock <= minStock && newStock > 0) {
          await triggerWorkflow('inventory.low_stock', {
            ingredient: {
              id: ingredient.id,
              name: ingredient.name,
              unit: ingredient.unit ?? '',
              min_stock: minStock
            },
            currentStock: newStock,
            severity: newStock <= minStock * 0.5 ? 'critical' : 'warning'
          })
        }

        if (newStock <= 0) {
          await triggerWorkflow('inventory.out_of_stock', {
            ingredient: {
              id: ingredient.id,
              name: ingredient.name,
              unit: ingredient.unit ?? ''
            },
            previousStock: currentStock
          })
        }
      }
    }
  }

  private static async restoreInventoryFromCancelledOrder(order: OrderWithRelations, supabase: SupabaseClient<Database>): Promise<void> {
    automationLogger.debug('Restoring inventory from cancelled order')
    const transactionUserId = order.user_id ?? 'automation-system'

    for (const orderItem of order.order_items || []) {
      const {recipe} = orderItem

      if (!recipe || !recipe.recipe_ingredients) {continue}

      for (const recipeIngredient of recipe.recipe_ingredients || []) {
        const {ingredient} = recipeIngredient
        if (!ingredient) {continue}

        const restoredQuantity = Number(recipeIngredient.quantity ?? 0) * Number(orderItem.quantity ?? 0)
        const currentStock = Number(ingredient.current_stock ?? 0)
        const newStock = currentStock + restoredQuantity

        const ingredientUpdate: IngredientUpdate = {
          current_stock: newStock,
          updated_at: new Date().toISOString()
        }

        const { error: updateError } = await (supabase as any)
          .from('ingredients')
          .update(ingredientUpdate)
          .eq('id', ingredient.id)

        if (updateError) {
          automationLogger.error({ updateError }, 'Failed to restore inventory stock from cancelled order')
          continue
        }

        const stockTransaction: StockTransactionInsert = {
          ingredient_id: ingredient.id,
          quantity: restoredQuantity,
          reference: `ORDER-CANCEL-${order.order_no}`,
          total_price: restoredQuantity * Number(ingredient.price_per_unit ?? 0),
          type: 'ADJUSTMENT',
          unit_price: ingredient.price_per_unit ?? null,
          user_id: transactionUserId,
          notes: `Restored from cancelled order ${order.order_no} - ${ingredient.name}`
        }

        await (supabase as any).from('stock_transactions').insert(stockTransaction)
      }
    }
  }

  /**
   * Create financial record for completed order
   */
  private static async createFinancialRecordFromOrder(order: OrderWithRelations, supabase: SupabaseClient<Database>): Promise<void> {
    automationLogger.debug('Creating financial record for completed order')

    const financialRecord = {
      type: 'INCOME',
      category: 'Penjualan',
      amount: order.total_amount ?? 0,
      description: `Penjualan - Order ${order.order_no}`,
      reference: `ORDER-${order.order_no}`,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      created_by: null
    } as FinancialRecordInsert

    const { error: financialError } = await (supabase as any).from('financial_records').insert(financialRecord)

    if (financialError) {
      automationLogger.error({ financialError }, 'Failed to create financial record')
      throw new Error(`Financial record creation failed: ${financialError.message}`)
    }
  }

  /**
   * Update customer statistics
   */
  private static async updateCustomerStats(order: OrderWithRelations, supabase: SupabaseClient<Database>): Promise<void> {
    if (!order.customer_id) {return}

    automationLogger.debug('Updating customer statistics')

    // Get current customer data
    const { data: customer } = await (supabase as any)
      .from('customers')
      .select('*')
      .eq('id', order.customer_id)
      .single()

    if (customer) {
      const newTotalOrders = (Number((customer).total_orders) || 0) + 1
      const newTotalSpent = (Number((customer).total_spent) || 0) + Number(order.total_amount)
      const newAverageOrderValue = newTotalSpent / newTotalOrders

      await (supabase as any)
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
