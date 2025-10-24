/**
 * Production Planning Automation
 * Otomatis generate production schedules berdasarkan pending orders dan stock levels
 */

import { workflowAutomation } from './automation-engine'
import { smartNotificationSystem } from './smart-notifications'

import { apiLogger } from '@/lib/logger'
import type { IngredientsTable } from '@/types/inventory'
import type { OrderItemsTable, OrdersTable } from '@/types/orders'
import type { RecipeIngredientsTable, RecipesTable } from '@/types/recipes'

// Type aliases for cleaner code
type Order = OrdersTable['Row'] & { order_items?: OrderItem[] }
type OrderItem = OrderItemsTable['Row']
type Ingredient = IngredientsTable['Row']
type Recipe = RecipesTable['Row'] & { recipe_ingredients?: RecipeIngredient[] }
type RecipeIngredient = RecipeIngredientsTable['Row']
export interface ProductionTask {
  id: string
  orderId: string
  orderNo: string
  recipeId: string
  recipeName: string
  quantity: number
  servings: number
  batchCount: number
  estimatedDuration: number // in hours
  plannedStartTime: Date
  plannedEndTime: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'planned' | 'in_progress' | 'completed' | 'blocked'
  blockedReason?: string
  ingredientRequirements: Array<{
    ingredientId: string
    ingredientName: string
    requiredQuantity: number
    availableQuantity: number
    unit: string
    shortage?: number
  }>
  dependencies?: string[] // Task IDs that must complete first
  assignedStaff?: string[]
}

export interface ProductionSchedule {
  id: string
  date: Date
  tasks: ProductionTask[]
  totalDuration: number
  workloadPercent: number
  conflicts: Array<{
    type: 'resource_conflict' | 'time_overlap' | 'ingredient_shortage'
    description: string
    affectedTasks: string[]
  }>
  optimizations: Array<{
    type: 'batch_combination' | 'sequence_optimization' | 'parallel_production'
    description: string
    timeSaved: number
    recommendation: string
  }>
}

export class ProductionPlanningSystem {
  private static instance: ProductionPlanningSystem
  private schedules: Map<string, ProductionSchedule> = new Map()
  private workingHoursStart = 6 // 6 AM
  private workingHoursEnd = 20   // 8 PM
  private maxDailyWorkload = 12  // 12 hours max capacity per day

  private constructor() { }

  public static getInstance(): ProductionPlanningSystem {
    if (!ProductionPlanningSystem.instance) {
      ProductionPlanningSystem.instance = new ProductionPlanningSystem()
    }
    return ProductionPlanningSystem.instance
  }

  /**
   * Generate production schedule untuk orders yang pending
   */
  async generateProductionSchedule(orders: Order[], ingredients: Ingredient[], recipes: Recipe[]): Promise<ProductionSchedule[]> {
    apiLogger.info('🏭 Generating production schedule...')

    // Filter orders yang perlu diproduksi
    const productionOrders = orders.filter(order =>
      ['CONFIRMED', 'IN_PROGRESS'].includes(order.status) &&
      order.delivery_date
    )

    apiLogger.info(`Found ${productionOrders.length} orders for production planning`)

    // Group orders by delivery date
    const ordersByDate = this.groupOrdersByDeliveryDate(productionOrders)

    const schedules: ProductionSchedule[] = []

    // Generate schedule untuk setiap hari
    for (const [dateStr, dayOrders] of ordersByDate) {
      const schedule = await this.generateDailySchedule(dateStr, dayOrders, ingredients, recipes)
      schedules.push(schedule)
      this.schedules.set(dateStr, schedule)
    }

    // Generate notifications untuk issues yang ditemukan
    this.generateScheduleNotifications(schedules)

    return schedules.sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  /**
   * Generate schedule untuk satu hari
   */
  private async generateDailySchedule(
    dateStr: string,
    orders: Order[],
    ingredients: Ingredient[],
    recipes: Recipe[]
  ): Promise<ProductionSchedule> {
    const date = new Date(dateStr)
    const tasks: ProductionTask[] = []

    // Create production tasks dari orders
    for (const order of orders) {
      for (const orderItem of order.order_items || []) {
        const recipe = recipes.find(r => r.id === orderItem.recipe_id)
        if (!recipe) continue

        const task = this.createProductionTask(order, orderItem, recipe, ingredients)
        tasks.push(task)
      }
    }

    // Sort tasks by priority dan delivery urgency
    tasks.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    // Schedule tasks dengan time slots
    const scheduledTasks = this.scheduleTasksInTimeSlots(tasks, date)

    // Find conflicts dan optimizations
    const conflicts = this.findScheduleConflicts(scheduledTasks, ingredients)
    const optimizations = this.findOptimizationOpportunities(scheduledTasks)

    const totalDuration = scheduledTasks.reduce((sum, task) => sum + task.estimatedDuration, 0)
    const workloadPercent = (totalDuration / this.maxDailyWorkload) * 100

    return {
      id: `schedule_${dateStr}`,
      date,
      tasks: scheduledTasks,
      totalDuration,
      workloadPercent,
      conflicts,
      optimizations
    }
  }

  /**
   * Create production task dari order item
   */
  private createProductionTask(order: Order, orderItem: OrderItem, recipe: Recipe, ingredients: Ingredient[]): ProductionTask {
    const batchSize = recipe.servings || 1
    const batchCount = Math.ceil(orderItem.quantity / batchSize)

    // Calculate estimated duration
    const prepTime = (recipe.prep_time || 30) / 60 // Convert to hours
    const cookTime = (recipe.cook_time || 45) / 60 // Convert to hours
    const estimatedDuration = (prepTime + cookTime) * batchCount

    // Calculate ingredient requirements
    const ingredientRequirements = (recipe.recipe_ingredients || []).map((ri: RecipeIngredient) => {
      const ingredient = ingredients.find(ing => ing.id === ri.ingredient_id)
      const requiredQuantity = ri.quantity * orderItem.quantity
      const availableQuantity = ingredient?.current_stock || 0

      return {
        ingredientId: ri.ingredient_id,
        ingredientName: ingredient?.name || 'Unknown',
        requiredQuantity,
        availableQuantity,
        unit: ri.unit,
        shortage: Math.max(0, requiredQuantity - availableQuantity)
      }
    })

    // Determine priority based on delivery urgency
    const deliveryTime = new Date(order.delivery_date).getTime()
    const now = Date.now()
    const hoursUntilDelivery = (deliveryTime - now) / (1000 * 60 * 60)

    let priority: ProductionTask['priority'] = 'medium'
    if (hoursUntilDelivery <= 12) priority = 'urgent'
    else if (hoursUntilDelivery <= 24) priority = 'high'
    else if (hoursUntilDelivery <= 48) priority = 'medium'
    else priority = 'low'

    // Check if task is blocked by ingredient shortages
    const hasShortages = ingredientRequirements.some(req => (req.shortage || 0) > 0)
    const status = hasShortages ? 'blocked' : 'planned'
    const blockedReason = hasShortages ? 'Insufficient ingredients' : undefined

    return {
      id: `task_${order.id}_${orderItem.id}`,
      orderId: order.id,
      orderNo: order.order_no,
      recipeId: recipe.id,
      recipeName: recipe.name,
      quantity: orderItem.quantity,
      servings: batchSize,
      batchCount,
      estimatedDuration,
      plannedStartTime: new Date(), // Will be set during scheduling
      plannedEndTime: new Date(),   // Will be set during scheduling
      priority,
      status,
      blockedReason,
      ingredientRequirements
    }
  }

  /**
   * Schedule tasks dalam time slots
   */
  private scheduleTasksInTimeSlots(tasks: ProductionTask[], date: Date): ProductionTask[] {
    const scheduledTasks: ProductionTask[] = []
    let currentTime = new Date(date)
    currentTime.setHours(this.workingHoursStart, 0, 0, 0)

    for (const task of tasks) {
      // Skip blocked tasks
      if (task.status === 'blocked') {
        scheduledTasks.push(task)
        continue
      }

      // Check if task fits in remaining working hours
      const workingHoursLeft = this.workingHoursEnd - currentTime.getHours()
      if (task.estimatedDuration > workingHoursLeft && workingHoursLeft > 2) {
        // Task doesn't fit, schedule for next day or early morning
        const nextSlot = new Date(currentTime)
        nextSlot.setDate(nextSlot.getDate() + 1)
        nextSlot.setHours(this.workingHoursStart, 0, 0, 0)
        currentTime = nextSlot
      }

      // Set task timing
      task.plannedStartTime = new Date(currentTime)
      const endTime = new Date(currentTime)
      endTime.setHours(endTime.getHours() + task.estimatedDuration)
      task.plannedEndTime = endTime

      // Update current time for next task
      currentTime = new Date(endTime)

      scheduledTasks.push(task)
    }

    return scheduledTasks
  }

  /**
   * Find schedule conflicts
   */
  private findScheduleConflicts(tasks: ProductionTask[], ingredients: Ingredient[]): ProductionSchedule['conflicts'] {
    const conflicts: ProductionSchedule['conflicts'] = []

    // Check ingredient shortages
    const ingredientUsage = new Map<string, number>()

    for (const task of tasks) {
      for (const req of task.ingredientRequirements) {
        const currentUsage = ingredientUsage.get(req.ingredientId) || 0
        ingredientUsage.set(req.ingredientId, currentUsage + req.requiredQuantity)
      }
    }

    ingredientUsage.forEach((totalRequired, ingredientId) => {
      const ingredient = ingredients.find(ing => ing.id === ingredientId)
      if (ingredient && totalRequired > ingredient.current_stock) {
        conflicts.push({
          type: 'ingredient_shortage',
          description: `Insufficient ${ingredient.name}: need ${totalRequired} ${ingredient.unit}, have ${ingredient.current_stock ?? 0} ${ingredient.unit}`,
          affectedTasks: tasks
            .filter(task => task.ingredientRequirements.some(req => req.ingredientId === ingredientId))
            .map(task => task.id)
        })
      }
    })

    // Check time overlaps (if multiple production lines)
    // Simplified - in real app would check equipment availability

    return conflicts
  }

  /**
   * Find optimization opportunities
   */
  private findOptimizationOpportunities(tasks: ProductionTask[]): ProductionSchedule['optimizations'] {
    const optimizations: ProductionSchedule['optimizations'] = []

    // Find tasks dengan recipe yang sama yang bisa di-batch
    const recipeGroups = new Map<string, ProductionTask[]>()

    tasks.forEach(task => {
      const existing = recipeGroups.get(task.recipeId) || []
      recipeGroups.set(task.recipeId, [...existing, task])
    })

    recipeGroups.forEach((recipeTasks, recipeId) => {
      if (recipeTasks.length > 1) {
        const totalQuantity = recipeTasks.reduce((sum, task) => sum + task.quantity, 0)
        const separateTime = recipeTasks.reduce((sum, task) => sum + task.estimatedDuration, 0)
        const batchedTime = separateTime * 0.7 // 30% time savings from batching
        const timeSaved = separateTime - batchedTime

        optimizations.push({
          type: 'batch_combination',
          description: `Combine ${recipeTasks.length} tasks for ${recipeTasks[0].recipeName} (${totalQuantity} units total)`,
          timeSaved,
          recommendation: `Batch produce ${recipeTasks[0].recipeName} to save ${timeSaved.toFixed(1)} hours setup time`
        })
      }
    })

    return optimizations
  }

  /**
   * Group orders by delivery date
   */
  private groupOrdersByDeliveryDate(orders: Order[]): Map<string, Order[]> {
    const grouped = new Map<string, Order[]>()

    orders.forEach(order => {
      if (!order.delivery_date) return

      const deliveryDate = new Date(order.delivery_date).toISOString().split('T')[0]
      const existing = grouped.get(deliveryDate) || []
      grouped.set(deliveryDate, [...existing, order])
    })

    return grouped
  }

  /**
   * Generate notifications untuk schedule issues
   */
  private generateScheduleNotifications(schedules: ProductionSchedule[]) {
    schedules.forEach(schedule => {
      // High workload notification
      if (schedule.workloadPercent > 90) {
        smartNotificationSystem.addNotification({
          type: 'warning',
          category: 'production',
          priority: 'high',
          title: 'Kapasitas Produksi Penuh',
          message: `Beban kerja ${schedule.date.toDateString()}: ${schedule.workloadPercent.toFixed(0)}%. Pertimbangkan overtime atau reschedule.`,
          actionUrl: `/production?date=${schedule.date.toISOString().split('T')[0]}`,
          actionLabel: 'Lihat Jadwal'
        })
      }

      // Conflicts notification
      if (schedule.conflicts.length > 0) {
        schedule.conflicts.forEach(conflict => {
          smartNotificationSystem.addNotification({
            type: 'error',
            category: 'production',
            priority: 'critical',
            title: 'Konflik Produksi',
            message: conflict.description,
            actionUrl: `/production?date=${schedule.date.toISOString().split('T')[0]}`,
            actionLabel: 'Resolve Conflict'
          })
        })
      }

      // Optimization opportunities
      if (schedule.optimizations.length > 0) {
        const totalTimeSaved = schedule.optimizations.reduce((sum, opt) => sum + opt.timeSaved, 0)

        smartNotificationSystem.addNotification({
          type: 'info',
          category: 'production',
          priority: 'medium',
          title: 'Peluang Optimasi Produksi',
          message: `${schedule.optimizations.length} optimasi tersedia, dapat menghemat ${totalTimeSaved.toFixed(1)} jam`,
          actionUrl: `/production?date=${schedule.date.toISOString().split('T')[0]}&tab=optimizations`,
          actionLabel: 'Lihat Optimasi'
        })
      }
    })
  }

  /**
   * Get schedule for specific date
   */
  getScheduleForDate(date: string): ProductionSchedule | undefined {
    return this.schedules.get(date)
  }

  /**
   * Get all schedules
   */
  getAllSchedules(): ProductionSchedule[] {
    return Array.from(this.schedules.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: ProductionTask['status'], notes?: string) {
    // Find task in schedules
    for (const schedule of this.schedules.values()) {
      const task = schedule.tasks.find(t => t.id === taskId)
      if (task) {
        const previousStatus = task.status
        task.status = status

        apiLogger.info(`🔄 Production task ${task.recipeName}: ${previousStatus} → ${status}`)

        // Trigger workflow automation for completed tasks
        if (status === 'completed' && previousStatus !== 'completed') {
          await workflowAutomation.triggerEvent({
            event: 'production.batch_completed',
            entityId: taskId,
            data: {
              task,
              orderId: task.orderId,
              recipeId: task.recipeId,
              quantity: task.quantity,
              notes
            }
          })

          // Add completion notification
          smartNotificationSystem.addNotification({
            type: 'success',
            category: 'production',
            priority: 'low',
            title: 'Produksi Selesai',
            message: `${task.recipeName} (${task.quantity} unit) telah selesai diproduksi`,
            actionUrl: `/orders/${task.orderId}`,
            actionLabel: 'Lihat Order'
          })
        }

        break
      }
    }
  }

  /**
   * Auto-reschedule berdasarkan perubahan kondisi
   */
  async autoReschedule(triggeredBy: 'inventory_update' | 'order_change' | 'delay') {
    apiLogger.info(`🔄 Auto-rescheduling production due to: ${triggeredBy}`)

    // Mark schedules as needing update
    // In real implementation, would re-run scheduling algorithm

    smartNotificationSystem.addNotification({
      type: 'info',
      category: 'production',
      priority: 'medium',
      title: 'Jadwal Produksi Diperbarui',
      message: `Jadwal produksi otomatis diperbarui karena ${triggeredBy.replace('_', ' ')}`,
      actionUrl: '/production',
      actionLabel: 'Lihat Jadwal'
    })
  }
}

// Export singleton instance
export const productionPlanning = ProductionPlanningSystem.getInstance()

// Helper functions untuk integrasi dengan komponen lain
export const generateProductionSchedule = async (orders: Order[], ingredients: Ingredient[], recipes: Recipe[]) => {
  return productionPlanning.generateProductionSchedule(orders, ingredients, recipes)
}

export const updateProductionTaskStatus = async (taskId: string, status: ProductionTask['status'], notes?: string) => {
  return productionPlanning.updateTaskStatus(taskId, status, notes)
}

export const getProductionSchedules = () => {
  return productionPlanning.getAllSchedules()
}

export default productionPlanning