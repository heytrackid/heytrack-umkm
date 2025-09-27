// Production-Orders Integration Service
// Automated production scheduling based on customer orders

import { 
  DEFAULT_PRODUCTION_CONFIG,
  calculateProductionTimeline,
  type ProductionModuleConfig 
} from '../config/production.config'
import { 
  DEFAULT_ORDERS_CONFIG,
  type OrdersModuleConfig 
} from '../../orders/config/orders.config'
import type { 
  ProductionBatch,
  CreateBatchData,
  BatchPriority,
  ProductionStatus,
  IngredientAllocation,
  AutoScheduleOptions,
  BatchSchedule 
} from '../types/production.types'
import type { 
  Order,
  OrderStatus,
  OrderPriority 
} from '../../orders/types/orders.types'

export interface ProductionOrdersIntegrationConfig {
  // Scheduling preferences
  auto_schedule_enabled: boolean
  schedule_buffer_hours: number
  max_batches_per_day: number
  preferred_start_time: string // "04:00"
  
  // Order-to-batch mapping
  batch_size_strategy: 'fixed' | 'optimal' | 'order_based'
  default_batch_size: number
  min_batch_efficiency: number // minimum 70%
  
  // Priority mapping
  priority_mapping: Record<OrderPriority, BatchPriority>
  rush_order_threshold_hours: number // if delivery < X hours, mark as rush
  
  // Inventory integration
  auto_allocate_ingredients: boolean
  check_ingredient_availability: boolean
  auto_create_purchase_orders: boolean
  
  // Quality and compliance
  require_quality_approval: boolean
  auto_assign_quality_inspector: boolean
  track_delivery_deadlines: boolean
  
  // Notifications
  notify_production_team: boolean
  notify_customer_updates: boolean
  alert_capacity_issues: boolean
}

export const DEFAULT_INTEGRATION_CONFIG: ProductionOrdersIntegrationConfig = {
  auto_schedule_enabled: true,
  schedule_buffer_hours: 4, // 4 hours buffer before delivery
  max_batches_per_day: 8,
  preferred_start_time: '04:00',
  
  batch_size_strategy: 'optimal',
  default_batch_size: 50,
  min_batch_efficiency: 70,
  
  priority_mapping: {
    'low': 'low',
    'normal': 'normal', 
    'high': 'high',
    'urgent': 'urgent',
    'rush': 'rush'
  },
  rush_order_threshold_hours: 12,
  
  auto_allocate_ingredients: true,
  check_ingredient_availability: true,
  auto_create_purchase_orders: false, // Manual approval required
  
  require_quality_approval: true,
  auto_assign_quality_inspector: true,
  track_delivery_deadlines: true,
  
  notify_production_team: true,
  notify_customer_updates: true,
  alert_capacity_issues: true
}

export interface SchedulingResult {
  success: boolean
  created_batches: ProductionBatch[]
  skipped_orders: Array<{
    order: Order
    reason: string
    suggested_action: string
  }>
  ingredient_issues: Array<{
    ingredient_id: string
    ingredient_name: string
    required: number
    available: number
    shortage: number
  }>
  capacity_warnings: string[]
  estimated_completion: Date
  total_cost: number
}

export interface IngredientAvailability {
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  allocated_stock: number
  available_stock: number
  unit: string
  reorder_point: number
  lead_time_days: number
}

export class ProductionOrdersIntegrationService {
  private productionConfig: ProductionModuleConfig
  private ordersConfig: OrdersModuleConfig
  private integrationConfig: ProductionOrdersIntegrationConfig

  constructor(
    productionConfig = DEFAULT_PRODUCTION_CONFIG,
    ordersConfig = DEFAULT_ORDERS_CONFIG,
    integrationConfig = DEFAULT_INTEGRATION_CONFIG
  ) {
    this.productionConfig = productionConfig
    this.ordersConfig = ordersConfig
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

  /**
   * Filter orders that need production scheduling
   */
  private filterOrdersForProduction(orders: Order[]): Order[] {
    return orders.filter(order => {
      // Only schedule orders that are confirmed but not yet in production
      const validStatuses: OrderStatus[] = ['confirmed', 'paid']
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

  /**
   * Group orders by recipe for batch optimization
   */
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

  /**
   * Analyze current production capacity
   */
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

  /**
   * Create optimized production batches for a recipe
   */
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
    const batches = this.calculateOptimalBatchSizes(totalQuantity, recipe)

    // Check ingredient availability for all batches
    const ingredientCheck = this.checkIngredientAvailability(
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

  /**
   * Calculate optimal batch sizes based on strategy
   */
  private calculateOptimalBatchSizes(totalQuantity: number, recipe: any): number[] {
    const strategy = this.integrationConfig.batch_size_strategy
    const defaultSize = this.integrationConfig.default_batch_size
    const maxSize = this.productionConfig.batch.max_batch_size
    const minSize = this.productionConfig.batch.min_batch_size

    switch (strategy) {
      case 'fixed':
        return this.calculateFixedBatches(totalQuantity, defaultSize)

      case 'optimal':
        return this.calculateOptimalBatches(totalQuantity, recipe, minSize, maxSize)

      case 'order_based':
        return this.calculateOrderBasedBatches(totalQuantity, defaultSize, maxSize)

      default:
        return [Math.min(totalQuantity, defaultSize)]
    }
  }

  private calculateFixedBatches(totalQuantity: number, batchSize: number): number[] {
    const batches: number[] = []
    let remaining = totalQuantity

    while (remaining > 0) {
      batches.push(Math.min(remaining, batchSize))
      remaining -= batchSize
    }

    return batches
  }

  private calculateOptimalBatches(
    totalQuantity: number, 
    recipe: any, 
    minSize: number, 
    maxSize: number
  ): number[] {
    // Find the batch size that minimizes waste and maximizes efficiency
    const optimalSize = this.findOptimalBatchSize(totalQuantity, recipe, minSize, maxSize)
    return this.calculateFixedBatches(totalQuantity, optimalSize)
  }

  private calculateOrderBasedBatches(
    totalQuantity: number, 
    preferredSize: number, 
    maxSize: number
  ): number[] {
    // Create batches that align with typical order sizes
    const batches: number[] = []
    let remaining = totalQuantity

    while (remaining > 0) {
      let batchSize = preferredSize

      // If remaining quantity is small, make a smaller batch
      if (remaining < preferredSize * 0.7) {
        batchSize = remaining
      }
      // If remaining is close to preferredSize, use it all
      else if (remaining < preferredSize * 1.3) {
        batchSize = remaining
      }
      // Otherwise use preferred size or max size
      else {
        batchSize = Math.min(preferredSize, maxSize)
      }

      batches.push(batchSize)
      remaining -= batchSize
    }

    return batches
  }

  private findOptimalBatchSize(
    totalQuantity: number, 
    recipe: any, 
    minSize: number, 
    maxSize: number
  ): number {
    // Simple heuristic: find size that minimizes waste
    let bestSize = minSize
    let minWaste = totalQuantity

    for (let size = minSize; size <= maxSize; size += 5) {
      const numBatches = Math.ceil(totalQuantity / size)
      const totalProduced = numBatches * size
      const waste = totalProduced - totalQuantity

      if (waste < minWaste) {
        minWaste = waste
        bestSize = size
      }
    }

    return bestSize
  }

  /**
   * Check ingredient availability for all batches
   */
  private checkIngredientAvailability(
    batchSizes: number[],
    recipe: any,
    ingredientInventory: IngredientAvailability[]
  ): {
    available: boolean
    shortages: Array<{
      ingredient_id: string
      ingredient_name: string
      required: number
      available: number
      shortage: number
    }>
  } {
    const shortages: Array<{
      ingredient_id: string
      ingredient_name: string
      required: number
      available: number
      shortage: number
    }> = []

    // Calculate total ingredients needed for all batches
    const totalIngredientNeeds: Record<string, number> = {}

    batchSizes.forEach(batchSize => {
      recipe.recipe_ingredients?.forEach((recipeIngredient: any) => {
        const needed = (recipeIngredient.quantity * batchSize) / recipe.servings
        totalIngredientNeeds[recipeIngredient.ingredient_id] = 
          (totalIngredientNeeds[recipeIngredient.ingredient_id] || 0) + needed
      })
    })

    // Check availability for each ingredient
    Object.entries(totalIngredientNeeds).forEach(([ingredientId, totalNeeded]) => {
      const inventory = ingredientInventory.find(inv => inv.ingredient_id === ingredientId)
      
      if (!inventory) {
        shortages.push({
          ingredient_id: ingredientId,
          ingredient_name: `Unknown ingredient ${ingredientId}`,
          required: totalNeeded,
          available: 0,
          shortage: totalNeeded
        })
        return
      }

      const available = inventory.available_stock
      if (available < totalNeeded) {
        shortages.push({
          ingredient_id: ingredientId,
          ingredient_name: inventory.ingredient_name,
          required: totalNeeded,
          available,
          shortage: totalNeeded - available
        })
      }
    })

    return {
      available: shortages.length === 0,
      shortages
    }
  }

  /**
   * Assign orders to a specific batch
   */
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

  private getOrderPriorityWeight(priority: OrderPriority): number {
    const weights: Record<OrderPriority, number> = {
      'rush': 1,
      'urgent': 2, 
      'high': 3,
      'normal': 4,
      'low': 5
    }
    return weights[priority] || 4
  }

  /**
   * Create a production batch from orders
   */
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
    const materialCost = this.calculateMaterialCost(recipe, batchSize)
    const laborCost = this.calculateLaborCost(timeline.total_time_minutes)
    const overheadCost = materialCost * 0.15 // 15% overhead
    const totalCost = materialCost + laborCost + overheadCost

    // Create ingredient allocations
    const ingredientAllocations = this.createIngredientAllocations(
      recipe,
      batchSize,
      batchNumber
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
      
      planned_cost: totalCost,
      labor_cost: laborCost,
      overhead_cost: overheadCost,
      cost_per_unit: totalCost / batchSize,
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

  private determineBatchPriority(orders: Order[]): BatchPriority {
    // Find highest priority order
    const priorities = orders.map(order => order.priority)
    
    if (priorities.includes('rush')) return 'rush'
    if (priorities.includes('urgent')) return 'urgent'
    if (priorities.includes('high')) return 'high'
    if (priorities.includes('normal')) return 'normal'
    return 'low'
  }

  private calculateMaterialCost(recipe: any, batchSize: number): number {
    if (!recipe.recipe_ingredients) return 0

    return recipe.recipe_ingredients.reduce((total: number, recipeIngredient: any) => {
      const neededQuantity = (recipeIngredient.quantity * batchSize) / recipe.servings
      const ingredientCost = recipeIngredient.ingredient?.price_per_unit || 0
      return total + (neededQuantity * ingredientCost)
    }, 0)
  }

  private calculateLaborCost(durationMinutes: number): number {
    const hourlyRate = 25000 // Rp 25,000/hour for Indonesian bakery
    const hours = durationMinutes / 60
    return hours * hourlyRate
  }

  private createIngredientAllocations(
    recipe: any,
    batchSize: number,
    batchId: string
  ): IngredientAllocation[] {
    if (!recipe.recipe_ingredients) return []

    return recipe.recipe_ingredients.map((recipeIngredient: any) => {
      const neededQuantity = (recipeIngredient.quantity * batchSize) / recipe.servings
      const ingredient = recipeIngredient.ingredient

      return {
        id: `alloc_${Date.now()}_${recipeIngredient.id}`,
        batch_id: batchId,
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        planned_quantity: neededQuantity,
        unit: recipeIngredient.unit,
        allocated_at: new Date().toISOString(),
        cost_per_unit: ingredient.price_per_unit || 0,
        total_cost: neededQuantity * (ingredient.price_per_unit || 0),
        currency: this.productionConfig.regional.currency
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

  /**
   * Calculate delivery timeline based on production schedule
   */
  calculateDeliveryTimeline(
    batches: ProductionBatch[],
    orders: Order[]
  ): Array<{
    order_id: string
    estimated_ready_date: Date
    estimated_delivery_date: Date
    production_batch_id: string
    on_time_probability: number
  }> {
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
}

export default ProductionOrdersIntegrationService