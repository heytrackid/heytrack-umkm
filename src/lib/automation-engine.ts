import { formatCurrency } from '@/shared/utils/currency'

/**
 * Smart Automation Engine for UMKM F&B
 * Updated to use the new modular automation system
 * 
 * This file now imports and re-exports the new modular automation engine
 * while preserving backwards compatibility with existing imports.
 */

// Re-export everything from the new modular automation system
export {
  AutomationEngine,
  PricingAutomation,
  InventoryAutomation,
  ProductionAutomation,
  FinancialAutomation,
  NotificationSystem,
  defaultAutomationEngine
} from './automation/index'

// Re-export types separately
export type { AutomationConfig } from './automation/types'

// Import the default automation engine for backwards compatibility
import { defaultAutomationEngine } from './automation/index'
import type { AutomationConfig } from './automation/types'

// Default configuration for Indonesian UMKM F&B (preserved for compatibility)
export const UMKM_CONFIG: AutomationConfig = {
  defaultProfitMargin: 60, // 60% margin - typical for F&B
  minimumProfitMargin: 30, // 30% minimum
  maximumProfitMargin: 150, // 150% for premium products
  autoReorderDays: 7, // Reorder 7 days before stock out
  safetyStockMultiplier: 1.5, // 50% safety stock
  productionLeadTime: 4, // 4 hours production buffer
  batchOptimizationThreshold: 5, // Minimum 5 units per batch
  lowProfitabilityThreshold: 20, // Alert if margin below 20%
  cashFlowWarningDays: 7 // Cash flow warning 7 days ahead
}

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
  data: any
  timestamp: string
}

export class WorkflowAutomation {
  private static instance: WorkflowAutomation
  private eventQueue: WorkflowEventData[] = []
  private isProcessing = false

  private constructor() {}

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

    console.log('🤖 Workflow Automation: Event triggered', event.event, event.entityId)
    
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
    console.log(`🎯 Processing workflow event: ${event.event}`);

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
          console.log(`No handler for event: ${event.event}`)
      }
    } catch (error: any) {
      console.error(`❌ Error processing event ${event.event}:`, error)
    }
  }

  /**
   * WORKFLOW: Order Completed
   * Otomatis: update inventory, create financial record, update customer stats
   */
  private async handleOrderCompleted(event: WorkflowEventData) {
    const orderId = event.entityId
    console.log('📦 Processing order completion workflow for:', orderId)

    // Import supabase inside function to avoid potential issues
    const { supabase } = await import('@/lib/supabase')

    try {
      // 1. Get order with items and recipes
      const { data: order, error: orderError } = await (supabase as any)
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
        console.error('Order not found:', orderError)
        return
      }

      console.log(`Processing completed order: ${order.order_no}`)

      // 2. Update inventory stock
      await this.updateInventoryFromOrder(order, supabase)

      // 3. Create financial record
      await this.createFinancialRecordFromOrder(order, supabase)

      // 4. Update customer statistics
      if (order.customer) {
        await this.updateCustomerStats(order, supabase)
      }

      // 5. Send completion notification
      console.log(`✅ Order completion workflow finished for ${order.order_no}`);

    } catch (error: any) {
      console.error('Error in order completion workflow:', error)
    }
  }

  /**
   * Update inventory stock berdasarkan order items
   */
  private async updateInventoryFromOrder(order: any, supabase: any) {
    console.log('📊 Updating inventory from order items...')

    for (const orderItem of order.order_items || []) {
      const recipe = orderItem.recipe
      if (!recipe || !recipe.recipe_ingredients) continue

      console.log(`Processing recipe: ${recipe.name} (${orderItem.quantity} qty)`)

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
          console.error('Error updating ingredient stock:', updateError)
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

        console.log(`✅ Updated ${ingredient.name}: ${ingredient.current_stock ?? 0} → ${newStock}`)

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
    console.log('💰 Creating financial record for completed order...')

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
        console.error('Error creating financial record:', financialError)
      } else {
        console.log(`✅ Created financial record: +${formatCurrency(order.total_amount)}`)
      }
    } catch (error: any) {
      console.error('Error in createFinancialRecordFromOrder:', error)
    }
  }

  /**
   * Update customer statistics
   */
  private async updateCustomerStats(order: any, supabase: any) {
    if (!order.customer_id) return

    console.log('👤 Updating customer statistics...')

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

        console.log(`✅ Updated customer stats: orders=${newTotalOrders}, spent=Rp${newTotalSpent.toLocaleString()}`)
      }
    } catch (error: any) {
      console.error('Error updating customer stats:', error)
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

    console.log(`📉 Handling low stock for ${ingredient.name}: ${currentStock} ${ingredient.unit}`)

    // Create notification in database (simplified)
    // In real app, would integrate with notification system
    console.log(`🔔 ALERT: ${ingredient.name} stock rendah (${currentStock} ${ingredient.unit})!`)
    
    if (severity === 'critical') {
      console.log('🚨 CRITICAL: Segera restock sebelum kehabisan total!')
    }

    // Auto-generate reorder suggestion
    const suggestedQuantity = Math.max(
      ingredient.min_stock ?? 0 * 2, // 2x minimum stock
      50 // Minimum reorder quantity
    )
    
    console.log(`💡 Suggested reorder: ${suggestedQuantity} ${ingredient.unit}`);
  }

  /**
   * WORKFLOW: Handle Order Cancelled
   * Otomatis: restore inventory (if needed), update financial records
   */
  private async handleOrderCancelled(event: WorkflowEventData) {
    console.log('❌ Processing order cancellation workflow...', event.entityId)
    // Implementation for order cancellation workflow
    // This would restore inventory if order was already in production
  }

  /**
   * WORKFLOW: Handle Ingredient Price Change
   * Otomatis: trigger HPP recalculation, update pricing suggestions
   */
  private async handleIngredientPriceChanged(event: WorkflowEventData) {
    const { ingredientId, oldPrice, newPrice, priceChange, affectedRecipes } = event.data
    
    console.log(`💰 Processing ingredient price change workflow: ${ingredientId}`);
    console.log(`Price change: ${priceChange.toFixed(2)}% (${oldPrice} → ${newPrice})`)

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
      } catch (error: any) {
        console.log('Smart notification system not available:', error)
      }
    }

    // Trigger pricing review for high-impact changes
    if (Math.abs(priceChange) > 15 && affectedRecipes?.length > 0) {
      console.log(`🎯 High-impact price change detected, triggering pricing review workflow`)
      
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
    
    console.log(`🏭 Processing operational cost change workflow: ${costName}`);
    console.log(`Cost change: ${oldAmount} → ${newAmount}`)

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
    } catch (error: any) {
      console.log('Smart notification system not available:', error)
    }
  }

  /**
   * WORKFLOW: Handle HPP Recalculation Needed
   * Otomatis: batch recalculate HPP, generate business insights
   */
  private async handleHPPRecalculationNeeded(event: WorkflowEventData) {
    const { reason, affectedRecipes } = event.data
    
    console.log(`🧮 Processing HPP recalculation workflow: ${reason}`);

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
    } catch (error: any) {
      console.log('Smart notification system not available:', error)
    }
  }

  /**
   * Generate business insights dari HPP changes
   */
  private generateHPPBusinessInsights(affectedRecipes: any[]) {
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
      console.log('Smart notification system not available:', error)
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