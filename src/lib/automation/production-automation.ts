import {
  AutomationConfig,
  Recipe,
  RecipeIngredient,
  Ingredient,
  OrderForProduction,
  ProductionPlan,
  ProductionPlanItem,
  AvailabilityCheck,
  IngredientRequirement
} from './types'

export class ProductionAutomation {
  constructor(private config: AutomationConfig) {}

  /**
   * 🏭 PRODUCTION AUTOMATION: Smart Production Planning
   */
  generateProductionPlan(
    orders: OrderForProduction[],
    recipes: Array<Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> }>,
    currentInventory: Ingredient[]
  ): ProductionPlan {
    const productionPlan = orders.map(order => {
      const recipe = recipes.find(r => r.id === order.recipe_id)!
      
      if (!recipe) {
        throw new Error(`Recipe not found for order: ${order.recipe_id}`)
      }

      // Check ingredient availability
      const availabilityCheck = this.checkIngredientAvailability(recipe, order.quantity, currentInventory)
      
      // Calculate production timeline
      const productionTime = this.calculateProductionTime(recipe, order.quantity)
      const startTime = this.calculateOptimalStartTime(order.delivery_date, productionTime)

      return {
        orderId: order.recipe_id + '-' + Date.now(),
        recipe,
        quantity: order.quantity,
        deliveryDate: new Date(order.delivery_date),
        production: {
          canProduce: availabilityCheck.canProduce,
          startTime,
          estimatedDuration: productionTime,
          batchCount: Math.ceil(order.quantity / (recipe.servings || 1)),
        },
        ingredients: availabilityCheck,
        recommendations: this.generateProductionRecommendations(availabilityCheck, productionTime)
      }
    })

    return {
      plan: productionPlan,
      summary: this.generateProductionSummary(productionPlan),
      optimizations: this.suggestProductionOptimizations(productionPlan)
    }
  }

  /**
   * Check if ingredients are available for production
   */
  private checkIngredientAvailability(
    recipe: Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> },
    quantity: number,
    inventory: Ingredient[]
  ): AvailabilityCheck {
    const requirements: IngredientRequirement[] = recipe.recipe_ingredients.map(ri => {
      const needed = ri.quantity * quantity
      const inventoryItem = inventory.find(inv => inv.id === ri.ingredient_id)
      const available = inventoryItem?.current_stock || 0
      
      return {
        ingredient: ri.ingredient,
        needed,
        available,
        sufficient: available >= needed,
        shortage: Math.max(0, needed - available)
      }
    })

    return {
      canProduce: requirements.every(r => r.sufficient),
      requirements,
      totalShortage: requirements.reduce((sum, r) => sum + r.shortage, 0)
    }
  }

  /**
   * Calculate production time based on recipe and quantity
   */
  private calculateProductionTime(recipe: Recipe, quantity: number): number {
    // Base time + time per batch + prep time
    const batchSize = recipe.servings || 1
    const batches = Math.ceil(quantity / batchSize)
    const prepTime = recipe.prep_time || 30 // minutes
    const cookTime = recipe.cook_time || 45 // minutes
    
    // Sequential batches with some parallelization efficiency
    const baseTime = prepTime + cookTime
    const additionalBatchTime = cookTime * 0.8 // 20% efficiency gain for additional batches
    
    const totalMinutes = baseTime + (additionalBatchTime * (batches - 1))
    return totalMinutes / 60 // Convert to hours
  }

  /**
   * Calculate optimal start time for production
   */
  private calculateOptimalStartTime(deliveryDate: string, productionTime: number): Date {
    const delivery = new Date(deliveryDate)
    const bufferTime = this.config.productionLeadTime || 2 // Default 2 hours buffer
    const startTime = new Date(delivery.getTime() - (productionTime + bufferTime) * 60 * 60 * 1000)
    
    // Ensure start time is during working hours (6 AM - 10 PM)
    const workStartHour = 6
    const workEndHour = 22
    
    if (startTime.getHours() < workStartHour) {
      startTime.setHours(workStartHour, 0, 0, 0)
    } else if (startTime.getHours() > workEndHour) {
      // Move to next day
      startTime.setDate(startTime.getDate() + 1)
      startTime.setHours(workStartHour, 0, 0, 0)
    }
    
    return startTime
  }

  /**
   * Generate production recommendations
   */
  private generateProductionRecommendations(
    availability: AvailabilityCheck,
    productionTime: number
  ): string[] {
    const recommendations: string[] = []
    
    if (!availability.canProduce) {
      recommendations.push('🛑 Cannot produce - insufficient ingredients')
      
      const criticalShortages = availability.requirements
        .filter(req => !req.sufficient)
        .sort((a, b) => b.shortage - a.shortage)
        .slice(0, 3)
      
      criticalShortages.forEach(shortage => {
        recommendations.push(
          `📦 Need ${shortage.shortage} ${shortage.ingredient.unit} more of ${shortage.ingredient.name}`
        )
      })
    } else {
      recommendations.push('✅ All ingredients available for production')
    }
    
    if (productionTime > 8) {
      recommendations.push('⏰ Long production time (8+ hours), consider staging production')
      recommendations.push('👥 May require additional staff or shift planning')
    } else if (productionTime > 4) {
      recommendations.push('⚠️ Extended production time, ensure adequate staffing')
    }
    
    if (productionTime < 1) {
      recommendations.push('⚡ Quick production - good for rush orders')
    }
    
    return recommendations
  }

  /**
   * Generate production plan summary
   */
  private generateProductionSummary(plan: ProductionPlanItem[]) {
    const totalOrders = plan.length
    const canProduceCount = plan.filter(p => p.production.canProduce).length
    const totalBatches = plan.reduce((sum, p) => sum + p.production.batchCount, 0)
    const estimatedHours = plan.reduce((sum, p) => sum + p.production.estimatedDuration, 0)

    return {
      totalOrders,
      canProduceCount,
      totalBatches,
      estimatedHours: Math.round(estimatedHours * 100) / 100
    }
  }

  /**
   * Suggest production optimizations
   */
  private suggestProductionOptimizations(plan: ProductionPlanItem[]): string[] {
    const optimizations: string[] = []
    
    // Batch optimization
    const recipeGroups = plan.reduce((groups, item) => {
      const recipeId = item.recipe.id
      if (!groups[recipeId]) {
        groups[recipeId] = []
      }
      groups[recipeId].push(item)
      return groups
    }, {} as Record<string, ProductionPlanItem[]>)

    Object.entries(recipeGroups).forEach(([recipeId, items]) => {
      if (items.length > 1) {
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
        optimizations.push(
          `🔄 Batch ${items.length} orders of ${items[0].recipe.name} (${totalQuantity} total units) for efficiency`
        )
      }
    })

    // Timeline optimization
    const timelineConflicts = this.detectTimelineConflicts(plan)
    if (timelineConflicts.length > 0) {
      optimizations.push('⚠️ Timeline conflicts detected - consider rescheduling some orders')
      timelineConflicts.forEach(conflict => {
        optimizations.push(`  • ${conflict.recipe1} overlaps with ${conflict.recipe2}`)
      })
    }

    // Resource optimization
    const totalHours = plan.reduce((sum, p) => sum + p.production.estimatedDuration, 0)
    if (totalHours > 16) {
      optimizations.push('👥 Consider multiple shifts or additional staff for peak production')
    }

    // Ingredient optimization
    const commonIngredients = this.findCommonIngredients(plan)
    if (commonIngredients.length > 0) {
      optimizations.push('📦 Consider bulk preparation of common ingredients:')
      commonIngredients.forEach(ingredient => {
        optimizations.push(`  • ${ingredient.name} used in ${ingredient.recipeCount} recipes`)
      })
    }

    return optimizations
  }

  /**
   * Detect timeline conflicts between production items
   */
  private detectTimelineConflicts(plan: ProductionPlanItem[]) {
    const conflicts: Array<{ recipe1: string; recipe2: string; overlap: number }> = []
    
    for (let i = 0; i < plan.length; i++) {
      for (let j = i + 1; j < plan.length; j++) {
        const item1 = plan[i]
        const item2 = plan[j]
        
        const start1 = item1.production.startTime
        const end1 = new Date(start1.getTime() + item1.production.estimatedDuration * 60 * 60 * 1000)
        
        const start2 = item2.production.startTime
        const end2 = new Date(start2.getTime() + item2.production.estimatedDuration * 60 * 60 * 1000)
        
        // Check for overlap
        if (start1 < end2 && start2 < end1) {
          const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()))
          const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()))
          const overlapHours = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60)
          
          conflicts.push({
            recipe1: item1.recipe.name,
            recipe2: item2.recipe.name,
            overlap: overlapHours
          })
        }
      }
    }
    
    return conflicts
  }

  /**
   * Find common ingredients across recipes
   */
  private findCommonIngredients(plan: ProductionPlanItem[]) {
    const ingredientUsage: Record<string, { name: string; recipeCount: number; totalQuantity: number }> = {}
    
    plan.forEach(item => {
      item.recipe.recipe_ingredients.forEach(ri => {
        const ingredientId = ri.ingredient.id
        if (!ingredientUsage[ingredientId]) {
          ingredientUsage[ingredientId] = {
            name: ri.ingredient.name,
            recipeCount: 0,
            totalQuantity: 0
          }
        }
        ingredientUsage[ingredientId].recipeCount++
        ingredientUsage[ingredientId].totalQuantity += ri.quantity * item.quantity
      })
    })
    
    return Object.values(ingredientUsage)
      .filter(ingredient => ingredient.recipeCount > 1)
      .sort((a, b) => b.recipeCount - a.recipeCount)
  }

  /**
   * Calculate production capacity and bottlenecks
   */
  calculateProductionCapacity(
    equipment: Array<{ name: string; capacity: number; availability: number }>,
    staffing: Array<{ role: string; count: number; productivity: number }>
  ) {
    const equipmentCapacity = equipment.reduce((total, eq) => {
      return total + (eq.capacity * eq.availability / 100)
    }, 0)
    
    const staffCapacity = staffing.reduce((total, staff) => {
      return total + (staff.count * staff.productivity)
    }, 0)
    
    const bottleneck = equipmentCapacity < staffCapacity ? 'equipment' : 'staffing'
    const maxCapacity = Math.min(equipmentCapacity, staffCapacity)
    
    return {
      maxCapacity,
      bottleneck,
      equipmentCapacity,
      staffCapacity,
      utilizationRate: 85, // Assume 85% practical utilization
      recommendations: this.generateCapacityRecommendations(bottleneck, equipmentCapacity, staffCapacity)
    }
  }

  /**
   * Generate capacity optimization recommendations
   */
  private generateCapacityRecommendations(
    bottleneck: string,
    equipmentCapacity: number,
    staffCapacity: number
  ): string[] {
    const recommendations: string[] = []
    
    if (bottleneck === 'equipment') {
      recommendations.push('🏭 Equipment is the bottleneck - consider:')
      recommendations.push('  • Equipment upgrade or additional units')
      recommendations.push('  • Better maintenance scheduling')
      recommendations.push('  • Process optimization to reduce equipment dependency')
    } else {
      recommendations.push('👥 Staffing is the bottleneck - consider:')
      recommendations.push('  • Additional staff during peak hours')
      recommendations.push('  • Cross-training for flexibility')
      recommendations.push('  • Process automation where possible')
    }
    
    const utilizationGap = Math.abs(equipmentCapacity - staffCapacity) / Math.max(equipmentCapacity, staffCapacity)
    if (utilizationGap > 0.2) {
      recommendations.push(`⚖️ Large capacity imbalance (${(utilizationGap*100).toFixed(0)}%) - balance resources for optimal efficiency`)
    }
    
    return recommendations
  }

  /**
   * Schedule production orders with optimal timing
   */
  scheduleOptimalProduction(plan: ProductionPlanItem[], workingHours: { start: number; end: number }) {
    // Sort by delivery date priority
    const sortedPlan = [...plan].sort((a, b) => a.deliveryDate.getTime() - b.deliveryDate.getTime())
    
    let currentTime = new Date()
    currentTime.setHours(workingHours.start, 0, 0, 0)
    
    return sortedPlan.map(item => {
      const scheduledStart = new Date(currentTime)
      const scheduledEnd = new Date(scheduledStart.getTime() + item.production.estimatedDuration * 60 * 60 * 1000)
      
      // Adjust for working hours
      if (scheduledEnd.getHours() > workingHours.end) {
        // Move to next day
        currentTime.setDate(currentTime.getDate() + 1)
        currentTime.setHours(workingHours.start, 0, 0, 0)
        const newStart = new Date(currentTime)
        const newEnd = new Date(newStart.getTime() + item.production.estimatedDuration * 60 * 60 * 1000)
        
        currentTime = newEnd
        
        return {
          ...item,
          scheduledStart: newStart,
          scheduledEnd: newEnd,
          isOnTime: newEnd <= item.deliveryDate
        }
      } else {
        currentTime = scheduledEnd
        
        return {
          ...item,
          scheduledStart,
          scheduledEnd,
          isOnTime: scheduledEnd <= item.deliveryDate
        }
      }
    })
  }
}