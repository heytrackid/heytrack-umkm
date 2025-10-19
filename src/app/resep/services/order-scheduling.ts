// Order Scheduling Service
// Handles the complex order scheduling logic
import type { ProductionOrdersIntegrationConfig, SchedulingResult, IngredientAvailability } from './production-orders-integration-types'
import { calculateProductionTimeline, type ProductionModuleConfig } from '../config/production.config'
import type { Order } from '../../orders/types/orders.types'
import type { ProductionBatch } from '../types/production.types'
import { batchOptimizationService } from './batch-optimization'
import { ingredientManagementService } from './ingredient-management'
import { costCalculationService } from './cost-calculation'

export class OrderSchedulingService {
  private productionConfig: ProductionModuleConfig
  private integrationConfig: ProductionOrdersIntegrationConfig

  constructor(
    productionConfig: ProductionModuleConfig,
    integrationConfig: ProductionOrdersIntegrationConfig
  ) {
    this.productionConfig = productionConfig
    this.integrationConfig = integrationConfig
  }

  async scheduleProductionFromOrders(
    orders: Order[],
    currentBatches: ProductionBatch[],
    ingredientInventory: IngredientAvailability[],
    recipes: any[]
  ): Promise<SchedulingResult> {
    // Filter orders that need production
    const pendingOrders = this.filterOrdersForProduction(orders)

    // Group orders by recipe for batch optimization
    const orderGroups = this.groupOrdersByRecipe(pendingOrders)

    // Calculate capacity constraints
    const capacityAnalysis = this.analyzeProductionCapacity(currentBatches)

    // Schedule batches for each recipe group
    const schedulingResults: SchedulingResult = {
      success: true,
      created_batches: [],
      skipped_orders: [],
      ingredient_issues: [],
      capacity_warnings: capacityAnalysis.warnings,
      estimated_completion: new Date(),
      total_cost: 0
    }

    for (const [recipeId, recipeOrders] of Object.entries(orderGroups)) {
      const recipe = recipes.find(r => r.id === recipeId)
      if (!recipe) {
        schedulingResults.skipped_orders.push(...recipeOrders.map(order => ({
          order,
          reason: `Recipe ${recipeId} not found`,
          suggested_action: 'Check recipe availability'
        })))
        continue
      }

      const batchResult = await this.createOptimizedBatches(
        recipeOrders,
        recipe,
        ingredientInventory,
        capacityAnalysis
      )

      schedulingResults.created_batches.push(...batchResult.batches)
      schedulingResults.skipped_orders.push(...batchResult.skipped_orders)
      schedulingResults.ingredient_issues.push(...batchResult.ingredient_issues)
      schedulingResults.total_cost += batchResult.total_cost
    }

    // Calculate overall completion time
    if (schedulingResults.created_batches.length > 0) {
      const latestCompletion = schedulingResults.created_batches
        .map(batch => new Date(batch.scheduled_completion))
        .sort((a, b) => b.getTime() - a.getTime())[0]

      schedulingResults.estimated_completion = latestCompletion
    }

    return schedulingResults
  }

  private filterOrdersForProduction(orders: Order[]): Order[] {
    return orders.filter(order => {
      // Only schedule orders that are confirmed but not yet in production
      const validStatuses: string[] = ['confirmed', 'paid']
      if (!validStatuses.includes(order.status)) return false

      // Check if delivery date allows for production
      if (order.delivery_date) {
        const deliveryDate = new Date(order.delivery_date)
        const now = new Date()
        const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursUntilDelivery < this.integrationConfig.schedule_buffer_hours) {
          return false // Too late to schedule
        }
      }

      return true
    })
  }

  private groupOrdersByRecipe(orders: Order[]): Record<string, Order[]> {
    const groups: Record<string, Order[]> = {}

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!groups[item.recipe_id]) {
          groups[item.recipe_id] = []
        }

        // Create separate order entry for each item
        const orderForItem: Order = {
          ...order,
          items: [item] // Single item per order for batch calculation
        }

        groups[item.recipe_id].push(orderForItem)
      })
    })

    return groups
  }

  private analyzeProductionCapacity(currentBatches: ProductionBatch[]): {
    available_capacity: number
    warnings: string[]
    daily_batches: Record<string, number>
  } {
    const activeBatches = currentBatches.filter(batch =>
      ['planned', 'ingredients_ready', 'in_progress'].includes(batch.status)
    )

    const warnings: string[] = []
    const daily_batches: Record<string, number> = {}

    // Analyze daily batch distribution
    activeBatches.forEach(batch => {
      const date = batch.scheduled_start.split('T')[0]
      daily_batches[date] = (daily_batches[date] || 0) + 1
    })

    // Check capacity warnings
    const today = new Date().toISOString().split('T')[0]
    const todayBatches = daily_batches[today] || 0

    if (todayBatches >= this.integrationConfig.max_batches_per_day * 0.8) {
      warnings.push(`High capacity usage: ${todayBatches}/${this.integrationConfig.max_batches_per_day} batches today`)
    }

    if (activeBatches.length >= this.productionConfig.scheduling.max_concurrent_batches) {
      warnings.push(`Maximum concurrent batches reached: ${activeBatches.length}`)
    }

    return {
      available_capacity: Math.max(0, this.integrationConfig.max_batches_per_day - todayBatches),
      warnings,
      daily_batches
    }
  }

  private async createOptimizedBatches(
    orders: Order[],
    recipe: any,
    ingredientInventory: IngredientAvailability[],
    capacityAnalysis: any
  ): Promise<{
    batches: ProductionBatch[]
    skipped_orders: Array<{ order: Order; reason: string; suggested_action: string }>
    ingredient_issues: Array<{ ingredient_id: string; ingredient_name: string; required: number; available: number; shortage: number }>
    total_cost: number
  }> {
    const result = {
      batches: [] as ProductionBatch[],
      skipped_orders: [] as Array<{ order: Order; reason: string; suggested_action: string }>,
      ingredient_issues: [] as Array<{ ingredient_id: string; ingredient_name: string; required: number; available: number; shortage: number }>,
      total_cost: 0
    }

    // Calculate total quantity needed
    const totalQuantity = orders.reduce((sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )

    // Determine optimal batch sizes
    const batches = batchOptimizationService.calculateOptimalBatchSizes(
      totalQuantity,
      recipe,
      {
        batch_size_strategy: this.integrationConfig.batch_size_strategy,
        default_batch_size: this.integrationConfig.default_batch_size,
        min_batch_efficiency: this.integrationConfig.min_batch_efficiency
      },
      {
        max_batch_size: this.productionConfig.batch.max_batch_size,
        min_batch_size: this.productionConfig.batch.min_batch_size
      }
    )

    // Check ingredient availability for all batches
    const ingredientCheck = ingredientManagementService.checkIngredientAvailability(
      batches,
      recipe,
      ingredientInventory
    )

    if (ingredientCheck.shortages.length > 0) {
      result.ingredient_issues = ingredientCheck.shortages

      // Skip orders if critical ingredients are missing
      const criticalShortages = ingredientCheck.shortages.filter(shortage =>
        shortage.shortage > shortage.available * 0.1 // More than 10% shortage
      )

      if (criticalShortages.length > 0) {
        result.skipped_orders = orders.map(order => ({
          order,
          reason: `Ingredient shortage: ${criticalShortages.map(s => s.ingredient_name).join(', ')}`,
          suggested_action: 'Restock ingredients or reduce batch size'
        }))
        return result
      }
    }

    // Create batches with scheduling
    for (let i = 0; i < batches.length; i++) {
      const batchSize = batches[i]
      const batchOrders = this.assignOrdersToBatch(orders, batchSize)

      if (capacityAnalysis.available_capacity <= 0) {
        result.skipped_orders.push(...batchOrders.map(order => ({
          order,
          reason: 'Production capacity exceeded',
          suggested_action: 'Schedule for next available slot or increase capacity'
        })))
        break
      }

      const batch = await this.createProductionBatch(
        recipe,
        batchSize,
        batchOrders,
        i // batch sequence number
      )

      result.batches.push(batch)
      result.total_cost += batch.planned_cost
      capacityAnalysis.available_capacity -= 1

      // Remove assigned orders from pending list
      batchOrders.forEach(assignedOrder => {
        const index = orders.findIndex(o => o.id === assignedOrder.id)
        if (index >= 0) orders.splice(index, 1)
      })
    }

    // Any remaining orders are skipped
    result.skipped_orders.push(...orders.map(order => ({
      order,
      reason: 'Could not fit in available batches',
      suggested_action: 'Schedule for next production cycle'
    })))

    return result
  }

  private assignOrdersToBatch(orders: Order[], batchSize: number): Order[] {
    const assignedOrders: Order[] = []
    let remainingCapacity = batchSize

    // Sort orders by priority and delivery date
    const sortedOrders = [...orders].sort((a, b) => {
      const priorityWeight = this.getOrderPriorityWeight(a.priority) - this.getOrderPriorityWeight(b.priority)
      if (priorityWeight !== 0) return priorityWeight

      // Then by delivery date (earlier first)
      const deliveryA = new Date(a.delivery_date || '2099-12-31').getTime()
      const deliveryB = new Date(b.delivery_date || '2099-12-31').getTime()
      return deliveryA - deliveryB
    })

    for (const order of sortedOrders) {
      const orderQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)

      if (orderQuantity <= remainingCapacity) {
        assignedOrders.push(order)
        remainingCapacity -= orderQuantity
      }

      if (remainingCapacity <= 0) break
    }

    return assignedOrders
  }

  private getOrderPriorityWeight(priority: string): number {
    const weights: Record<string, number> = {
      'urgent': 2,
      'high': 3,
      'normal': 4,
      'low': 5
    }
    return weights[priority] || 4
  }

  private async createProductionBatch(
    recipe: any,
    batchSize: number,
    orders: Order[],
    sequenceNumber: number
  ): Promise<ProductionBatch> {
    // Generate batch number
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
    const batchNumber = `BATCH-${dateStr}-${String(sequenceNumber + 1).padStart(3, '0')}`

    // Determine batch priority based on orders
    const batchPriority = this.determineBatchPriority(orders)

    // Calculate timing
    const timeline = calculateProductionTimeline(
      recipe.id,
      batchSize,
      this.productionConfig,
      {
        priority: batchPriority,
        rush_order: batchPriority === 'rush'
      }
    )

    // Calculate costs
    const costBreakdown = costCalculationService.calculateTotalCost(
      recipe,
      batchSize,
      timeline.total_time_minutes,
      0.15 // 15% overhead
    )

    // Create ingredient allocations
    const ingredientAllocations = ingredientManagementService.createIngredientAllocations(
      recipe,
      batchSize,
      batchNumber,
      this.productionConfig.regional.currency
    )

    const batch: ProductionBatch = {
      id: `batch_${Date.now()}_${sequenceNumber}`,
      batch_number: batchNumber,
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      status: 'planned',
      priority: batchPriority,

      planned_quantity: batchSize,
      batch_size: batchSize,

      scheduled_start: timeline.estimated_start.toISOString(),
      scheduled_completion: timeline.estimated_completion.toISOString(),
      estimated_duration_minutes: timeline.total_time_minutes,

      planned_cost: costBreakdown.totalCost,
      labor_cost: costBreakdown.laborCost,
      overhead_cost: costBreakdown.overheadCost,
      cost_per_unit: costBreakdown.costPerUnit,
      currency: this.productionConfig.regional.currency,

      quality_checks: [],
      quality_status: 'pending',

      order_ids: orders.map(order => order.id),
      ingredient_allocations: ingredientAllocations,

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return batch
  }

  private determineBatchPriority(orders: Order[]): any {
    // Find highest priority order
    const priorities = orders.map(order => order.priority)

    if (priorities.includes('urgent')) return 'urgent'
    if (priorities.includes('high')) return 'high'
    if (priorities.includes('normal')) return 'normal'
    return 'low'
  }
}
