import type { OrderForProduction } from './types'
import { AvailabilityChecker } from './availability-checker'
import { TimeCalculator } from './time-calculator'
import { ProductionRecommendations } from './recommendations'
import type {
  Recipe,
  RecipeIngredient,
  Ingredient,
  ProductionPlan,
  ProductionPlanItem,
  ProductionPlanSummary,
  AvailabilityCheck,
  AutomationConfig
} from '@/lib/automation/types'

/**
 * Production Planner Module
 * Core production planning logic
 */

export class ProductionPlanner {
  /**
   * Generate production plan
   */
  static generateProductionPlan(
    orders: OrderForProduction[],
    recipes: Array<Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> }>,
    currentInventory: Ingredient[],
    config: AutomationConfig
  ): ProductionPlan {
    const productionPlan = orders.map(order => {
      const recipe = recipes.find(r => r.id === order.recipe_id)!
      if (!recipe) {
        throw new Error(`Recipe not found for order: ${order.recipe_id}`)
      }

      // Check ingredient availability
      const availabilityCheck = AvailabilityChecker.checkIngredientAvailability(recipe, order.quantity, currentInventory)

      // Calculate production timeline
      const productionTime = TimeCalculator.calculateProductionTime(recipe, order.quantity)
      const startTime = TimeCalculator.calculateOptimalStartTime(order.delivery_date, productionTime, config)

      return {
        orderId: `${order.recipe_id  }-${  Date.now()}`,
        recipe,
        quantity: order.quantity,
        deliveryDate: new Date(order.delivery_date),
        production: {
          canProduce: availabilityCheck.canProduce,
          startTime,
          estimatedDuration: productionTime,
          batchCount: Math.ceil(order.quantity / (recipe.servings ?? 1)),
        },
        ingredients: availabilityCheck,
        recommendations: ProductionRecommendations.generateProductionRecommendations(availabilityCheck, productionTime)
      }
    })

    return {
      plan: productionPlan,
      summary: this.generateProductionSummary(productionPlan),
      optimizations: ProductionRecommendations.suggestProductionOptimizations(productionPlan)
    }
  }

  /**
   * Generate production plan summary
   */
  private static generateProductionSummary(plan: ProductionPlanItem[]): ProductionPlanSummary {
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
}
