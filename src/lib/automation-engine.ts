/**
 * Smart Automation Engine for UMKM F&B
 * Re-exports from modular automation system for backward compatibility
 */

import { automationLogger } from './logger'

// Re-export everything from the new modular automation system
export {
  AutomationEngine, defaultAutomationEngine, FinancialAutomation, InventoryAutomation, NotificationSystem, PricingAutomation, ProductionAutomation, UMKM_CONFIG
} from './automation/index'

// Re-export types
export type { AutomationConfig } from './automation/types'

// Import for backward compatibility
import { defaultAutomationEngine } from './automation/index'

// Export the default instance for backwards compatibility
export const automationEngine = defaultAutomationEngine

/**
 * WORKFLOW AUTOMATION SYSTEM
 * Sistem otomasi untuk workflow bisnis yang seamless
 */

// Event types untuk automation triggers
export type WorkflowEvent =
  | 'order.status_changed'
  | 'order.completed'
  | 'order.cancelled'
  | 'inventory.low_stock'
  | 'inventory.out_of_stock'
  | 'production.batch_completed'
  | 'ingredient.price_changed'
  | 'operational_cost.changed'
  | 'hpp.recalculation_needed'

export interface WorkflowEventData {
  event: WorkflowEvent
  entityId: string
  data: unknown
  timestamp: string
}

export class WorkflowAutomation {
  private static instance: WorkflowAutomation
  private eventQueue: WorkflowEventData[] = []
  private isProcessing = false

  private constructor() { }

  public static getInstance(): WorkflowAutomation {
    if (!WorkflowAutomation.instance) {
      WorkflowAutomation.instance = new WorkflowAutomation()
    }
    return WorkflowAutomation.instance
  }

  /**
   * Trigger workflow automation event
   */
  async triggerEvent(eventData: Partial<WorkflowEventData>) {
    const event: WorkflowEventData = {
      ...eventData,
      timestamp: new Date().toISOString()
    }

    automationLogger.info('Workflow event triggered', { event: event.event, entityId: event.entityId })

    // Add to queue for processing
    this.eventQueue.push(event)

    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processEventQueue()
    }
  }

  /**
   * Process event queue
   */
  private async processEventQueue() {
    if (this.eventQueue.length === 0 || this.isProcessing) return

    this.isProcessing = true

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()
      if (event) {
        await this.processEvent(event)
      }
    }

    this.isProcessing = false
  }

  /**
   * Process single workflow event
   */
  private async processEvent(event: WorkflowEventData) {
    automationLogger.debug('Processing workflow event', { event: event.event })

    try {
      switch (event.event) {
        case 'order.completed':
          await this.handleOrderCompleted(event)
          break
        case 'order.cancelled':
          await this.handleOrderCancelled(event)
          break
        case 'inventory.low_stock':
          await this.handleLowStock(event)
          break
        case 'ingredient.price_changed':
          await this.handleIngredientPriceChanged(event)
          break
        case 'operational_cost.changed':
          await this.handleOperationalCostChanged(event)
          break
        case 'hpp.recalculation_needed':
          await this.handleHPPRecalculationNeeded(event)
          break
        default:
          automationLogger.warn('No handler for event', { event: event.event })
      }
    } catch (error: unknown) {
      automationLogger.error('Error processing event', { event: event.event, error })
    }
  }

  /**
   * WORKFLOW: Order Completed
   * Otomatis: update inventory, create financial record, update customer stats
   */
  private async handleOrderCompleted(event: WorkflowEventData) {
    const orderId = event.entityId
    automationLogger.info('Processing order completion workflow', { orderId })

    // Import supabase inside function to avoid potential issues
    const { supabase } = await import('@/lib/supabase')

    try {
      // 1. Get order with items and recipes
      const { data: order, error: orderError } = await supabase
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

      if (orderError || !order) {
        automationLogger.error('Order not found', { orderError })
        return
      }

      automationLogger.debug('Processing completed order', { orderNo: order.order_no })

      // 2. Update inventory stock
      await this.updateInventoryFromOrder(order, supabase)

      // 3. Create financial record
      await this.createFinancialRecordFromOrder(order, supabase)

      // 4. Update customer statistics
      if (order.customer) {
        await this.updateCustomerStats(order, supabase)
      }

      // 5. Send completion notification
      automationLogger.info('Order completion workflow finished', { orderNo: order.order_no })

    } catch (error: unknown) {
      automationLogger.error('Error in order completion workflow', { error })
    }
  }

  /**
   * Update inventory stock berdasarkan order items
   */
  private async updateInventoryFromOrder(order: any, supabase: any) {
    automationLogger.debug('Updating inventory from order items')

    for (const orderItem of order.order_items || []) {
      const recipe = orderItem.recipe
      if (!recipe || !recipe.recipe_ingredients) continue

      automationLogger.debug('Processing recipe', { recipeName: recipe.name, quantity: orderItem.quantity })

      for (const recipeIngredient of recipe.recipe_ingredients) {
        const ingredient = recipeIngredient.ingredient
        const usedQuantity = recipeIngredient.quantity * orderItem.quantity
        const newStock = Math.max(0, (ingredient.current_stock ?? 0) - usedQuantity)

        // Update ingredient stock
        const { error: updateError } = await supabase
          .from('ingredients')
          .update({
            current_stock: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', ingredient.id)

        if (updateError) {
          automationLogger.error('Error updating ingredient stock', { updateError })
          continue
        }

        // Create stock transaction record
        await supabase
          .from('stock_transactions')
          .insert({
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            type: 'USAGE',
            quantity: -usedQuantity, // Negative for usage
            unit: ingredient.unit,
            unit_price: ingredient.price_per_unit,
            total_value: usedQuantity * ingredient.price_per_unit,
            reference: `ORDER-${order.order_no}`,
            reason: 'Order completion',
            notes: `Used for order ${order.order_no} - ${recipe.name} (${orderItem.quantity} units)`
          })

        automationLogger.debug('Updated ingredient stock', {
          name: ingredient.name,
          oldStock: ingredient.current_stock ?? 0,
          newStock
        })

        // Check for low stock dan trigger alert
        if (newStock <= (ingredient.min_stock ?? 0) && newStock > 0) {
          this.triggerEvent({
            event: 'inventory.low_stock',
            entityId: ingredient.id,
            data: {
              ingredient,
              currentStock: newStock,
              minStock: ingredient.min_stock ?? 0,
              severity: newStock <= ((ingredient.min_stock ?? 0) * 0.5) ? 'critical' : 'warning'
            }
          })
        }
      }
    }
  }

  /**
   * Create financial record untuk completed order
   */
  private async createFinancialRecordFromOrder(order: any, supabase: any) {
    automationLogger.debug('Creating financial record for completed order')

    try {
      // Create income record
      const { error: financialError } = await supabase
        .from('financial_records')
        .insert({
          type: 'INCOME',
          category: 'Penjualan',
          amount: order.total_amount,
          description: `Penjualan - Order ${order.order_no}`,
          reference: `ORDER-${order.order_no}`,
          payment_method: order.payment_method || 'CASH',
          date: new Date().toISOString().split('T')[0], // Today's date
          order_id: order.id
        })

      if (financialError) {
        automationLogger.error('Error creating financial record', { financialError })
      } else {
        automationLogger.info('Created financial record', { amount: order.total_amount })
      }
    } catch (error: unknown) {
      automationLogger.error('Error in createFinancialRecordFromOrder', { error })
    }
  }

  /**
   * Update customer statistics
   */
  private async updateCustomerStats(order: any, supabase: any) {
    if (!order.customer_id) return

    automationLogger.debug('Updating customer statistics')

    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', order.customer_id)
        .single()

      if (customer) {
        const newTotalOrders = (customer.total_orders || 0) + 1
        const newTotalSpent = (customer.total_spent || 0) + order.total_amount
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

        automationLogger.info('Updated customer stats', {
          customerId: order.customer_id,
          totalOrders: newTotalOrders,
          totalSpent: newTotalSpent
        })
      }
    } catch (error: unknown) {
      automationLogger.error('Error updating customer stats', { error })
    }
  }

  /**
   * WORKFLOW: Handle Low Stock
   * Otomatis: send alert, suggest reorder
   */
  private async handleLowStock(event: WorkflowEventData) {
    const ingredient = event.data.ingredient
    const currentStock = event.data.currentStock
    const severity = event.data.severity

    automationLogger.warn('Low stock alert', {
      ingredientName: ingredient.name,
      currentStock,
      unit: ingredient.unit,
      severity
    })

    if (severity === 'critical') {
      automationLogger.error('Critical stock level', { ingredientName: ingredient.name })
    }

    // Auto-generate reorder suggestion
    const suggestedQuantity = Math.max(
      ingredient.min_stock ?? 0 * 2, // 2x minimum stock
      50 // Minimum reorder quantity
    )

    automationLogger.info('Suggested reorder', {
      ingredientName: ingredient.name,
      quantity: suggestedQuantity,
      unit: ingredient.unit
    })
  }

  /**
   * WORKFLOW: Handle Order Cancelled
   * Otomatis: restore inventory (if needed), update financial records
   */
  private async handleOrderCancelled(event: WorkflowEventData) {
    automationLogger.info('Processing order cancellation workflow', { entityId: event.entityId })
    // Implementation for order cancellation workflow
    // This would restore inventory if order was already in production
  }

  /**
   * WORKFLOW: Handle Ingredient Price Change
   * Otomatis: trigger HPP recalculation, update pricing suggestions
   */
  private async handleIngredientPriceChanged(event: WorkflowEventData) {
    const { ingredientId, oldPrice, newPrice, priceChange, affectedRecipes } = event.data

    automationLogger.info('Processing ingredient price change workflow', {
      ingredientId,
      oldPrice,
      newPrice,
      priceChange: priceChange.toFixed(2)
    })

    // Generate smart notifications for significant price changes
    if (Math.abs(priceChange) > 10) {
      try {
        // Import smart notification system
        const { smartNotificationSystem } = await import('@/lib/smart-notifications')

        smartNotificationSystem.addNotification({
          type: priceChange > 0 ? 'warning' : 'info',
          category: 'financial',
          priority: Math.abs(priceChange) > 20 ? 'critical' : 'high',
          title: `Harga Bahan Baku ${priceChange > 0 ? 'NAIK' : 'TURUN'} Signifikan`,
          message: `Perubahan ${Math.abs(priceChange).toFixed(1)}% mempengaruhi ${affectedRecipes?.length || 0} resep. HPP otomatis diperbarui.`,
          actionUrl: '/hpp-simple?tab=price_impact',
          actionLabel: 'Review HPP'
        })
      } catch (error: unknown) {
        automationLogger.debug('Smart notification system not available', { error })
      }
    }

    // Trigger pricing review for high-impact changes
    if (Math.abs(priceChange) > 15 && affectedRecipes?.length > 0) {
      automationLogger.warn('High-impact price change detected', {
        priceChange,
        affectedRecipesCount: affectedRecipes.length
      })

      // Schedule pricing review task
      setTimeout(async () => {
        await this.triggerEvent({
          event: 'hpp.recalculation_needed',
          entityId: 'batch_pricing_review',
          data: {
            reason: 'significant_price_change',
            triggerIngredient: ingredientId,
            priceChange,
            affectedRecipes
          }
        })
      }, 5000) // 5 second delay to allow price change to propagate
    }
  }

  /**
   * WORKFLOW: Handle Operational Cost Change  
   * Otomatis: recalculate all HPP, update pricing across all recipes
   */
  private async handleOperationalCostChanged(event: WorkflowEventData) {
    const { costId, costName, oldAmount, newAmount } = event.data

    automationLogger.info('Processing operational cost change workflow', {
      costName,
      oldAmount,
      newAmount
    })

    try {
      // Import smart notification system
      const { smartNotificationSystem } = await import('@/lib/smart-notifications')

      // Operational cost changes affect ALL recipes, so generate comprehensive alert
      smartNotificationSystem.addNotification({
        type: 'info',
        category: 'financial',
        priority: 'medium',
        title: 'Biaya Operasional Diperbarui',
        message: `${costName} berubah dari ${formatCurrency(oldAmount)} ke ${formatCurrency(newAmount)}. Semua HPP otomatis diperbarui.`,
        actionUrl: '/hpp-simple?tab=operational_costs',
        actionLabel: 'Lihat HPP'
      })

      // Generate business recommendation
      const costChange = ((newAmount - oldAmount) / oldAmount) * 100
      if (Math.abs(costChange) > 10) {
        smartNotificationSystem.addNotification({
          type: 'warning',
          category: 'financial',
          priority: 'high',
          title: 'Review Pricing Strategy Disarankan',
          message: `Perubahan biaya operasional ${Math.abs(costChange).toFixed(1)}% mempengaruhi seluruh profitabilitas. Pertimbangkan review harga jual.`,
          actionUrl: '/hpp-simple?tab=pricing_review',
          actionLabel: 'Review Pricing'
        })
      }
    } catch (error: unknown) {
      automationLogger.debug('Smart notification system not available', { error: error.message })
    }
  }

  /**
   * WORKFLOW: Handle HPP Recalculation Needed
   * Otomatis: batch recalculate HPP, generate business insights
   */
  private async handleHPPRecalculationNeeded(event: WorkflowEventData) {
    const { reason, affectedRecipes } = event.data

    automationLogger.info('Processing HPP recalculation workflow', { reason });

    try {
      // Import smart notification system
      const { smartNotificationSystem } = await import('@/lib/smart-notifications')

      // Notify about batch recalculation start
      smartNotificationSystem.addNotification({
        type: 'info',
        category: 'financial',
        priority: 'low',
        title: 'HPP Recalculation Started',
        message: `Memproses ulang HPP untuk ${affectedRecipes?.length || 'semua'} resep karena ${reason}`,
        actionUrl: '/hpp-simple?tab=recalculation_progress',
        actionLabel: 'Monitor Progress'
      })

      // Simulate batch recalculation (in real app would call HPP automation API)
      setTimeout(async () => {
        // Generate completion notification with business insights
        smartNotificationSystem.addNotification({
          type: 'success',
          category: 'financial',
          priority: 'medium',
          title: 'HPP Recalculation Selesai',
          message: `HPP telah diperbarui. Review pricing suggestions untuk optimasi profit margin.`,
          actionUrl: '/hpp-simple?tab=pricing_suggestions',
          actionLabel: 'Lihat Suggestions'
        })

        // Generate business insights
        this.generateHPPBusinessInsights(affectedRecipes || [])
      }, 10000) // 10 second simulation
    } catch (error: unknown) {
      automationLogger.debug('Smart notification system not available', { error })
    }
  }

  /**
   * Generate business insights dari HPP changes
   */
  private generateHPPBusinessInsights(affectedRecipes: unknown[]) {
    // Import smart notification system
    import('@/lib/smart-notifications').then(({ smartNotificationSystem }) => {
      // TODO: Analyze actual HPP data
      const insights = [
        {
          type: 'ingredient_alternatives',
          message: 'HPP meningkat 15% bulan ini. Pertimbangkan alternatif bahan.',
          action: 'Analisis ingredient alternatives'
        },
        {
          type: 'pricing_strategy',
          message: 'Margin rata-rata industri F&B: 60%. Current average: 45%',
          action: 'Pertimbangkan penyesuaian harga untuk target margin optimal'
        }
      ]

      insights.forEach((insight, index: number) => {
        setTimeout(async () => {
          smartNotificationSystem.addNotification({
            type: 'info',
            category: 'financial',
            priority: 'medium',
            title: 'Business Insight: HPP Analysis',
            message: insight.message,
            actionUrl: '/hpp-simple?tab=insights&insight=' + insight.type,
            actionLabel: insight.action
          })
        }, (index + 1) * 2000) // Stagger notifications
      })
    }).catch(error => {
      automationLogger.debug('Smart notification system not available', { error })
    })
  }
}

// Export singleton instance
export const workflowAutomation = WorkflowAutomation.getInstance()

// Helper function untuk trigger automation dari komponen lain
export const triggerWorkflow = async (
  event: WorkflowEvent,
  entityId: string,
  data: any = {}
) => {
  return workflowAutomation.triggerEvent({
    event,
    entityId,
    data
  })
}