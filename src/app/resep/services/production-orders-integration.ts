// Production-Orders Integration Service
// Main orchestrator using lazy-loaded specialized services

import {
  DEFAULT_INTEGRATION_CONFIG,
  type ProductionOrdersIntegrationConfig,
  type SchedulingResult,
  type IngredientAvailability,
  type DeliveryTimeline
} from './production-orders-integration-types'
import {
  calculateProductionTimeline,
  DEFAULT_PRODUCTION_CONFIG,
  type ProductionModuleConfig
} from '../config/production.config'
import type { Order, OrderPriority } from '../../orders/types/orders.types'
import type { ProductionBatch, BatchPriority } from '../types/production.types'

export class ProductionOrdersIntegrationService {
  private productionConfig: ProductionModuleConfig
  private integrationConfig: ProductionOrdersIntegrationConfig

  constructor(
    productionConfig = DEFAULT_PRODUCTION_CONFIG,
    integrationConfig = DEFAULT_INTEGRATION_CONFIG
  ) {
    this.productionConfig = productionConfig
    this.integrationConfig = integrationConfig
  }

  /**
   * Main method: Schedule production batches from pending orders
   */
  async scheduleProductionFromOrders(
    orders: Order[],
    currentBatches: ProductionBatch[],
    ingredientInventory: IngredientAvailability[],
    recipes: any[]
  ): Promise<SchedulingResult> {
    if (!this.integrationConfig.auto_schedule_enabled) {
      return {
        success: false,
        created_batches: [],
        skipped_orders: orders.map(order => ({
          order,
          reason: 'Auto-scheduling disabled',
          suggested_action: 'Enable auto-scheduling or create batches manually'
        })),
        ingredient_issues: [],
        capacity_warnings: [],
        estimated_completion: new Date(),
        total_cost: 0
      }
    }

    // Lazy load scheduling logic
    const { OrderSchedulingService } = await import('./order-scheduling')
    const scheduler = new OrderSchedulingService(this.productionConfig, this.integrationConfig)

    return scheduler.scheduleProductionFromOrders(orders, currentBatches, ingredientInventory, recipes)
  }

  /**
   * Calculate delivery timeline based on production schedule
   */
  calculateDeliveryTimeline(
    batches: ProductionBatch[],
    orders: Order[]
  ): DeliveryTimeline[] {
    return orders.map(order => {
      const batch = batches.find(b => b.order_ids?.includes(order.id))

      if (!batch) {
        return {
          order_id: order.id,
          estimated_ready_date: new Date(),
          estimated_delivery_date: new Date(order.delivery_date || '2099-12-31'),
          production_batch_id: '',
          on_time_probability: 0
        }
      }

      const completionDate = new Date(batch.scheduled_completion)
      const deliveryDate = new Date(order.delivery_date || '2099-12-31')
      const onTimeProbability = completionDate < deliveryDate ? 0.9 : 0.3

      return {
        order_id: order.id,
        estimated_ready_date: completionDate,
        estimated_delivery_date: deliveryDate,
        production_batch_id: batch.id,
        on_time_probability: onTimeProbability
      }
    })
  }

  /**
   * Update order status after batch creation
   */
  async updateOrdersAfterScheduling(
    scheduledOrders: Order[],
    batchId: string
  ): Promise<void> {
    // This would typically update orders in the database
    // to link them with the production batch and update status

    for (const order of scheduledOrders) {
      // Update order status to 'in_production'
      // Link order to batch_id
      // Add production timeline to order
    }
  }
}

export default ProductionOrdersIntegrationService