import { CapacityManager } from './capacity-manager'
import { ProductionPlanner } from './production-planner'
import { TimeCalculator } from './time-calculator'

import type {
  OrderForProduction,
  Equipment,
  Staffing,
  ProductionCapacity,
  WorkingHours,
  ScheduledProductionItem
} from './types'
import type { Row } from '@/types/database'
import type { AutomationConfig, ProductionPlan } from '@/types/features/automation'

type Recipe = Row<'recipes'>
type RecipeIngredient = Row<'recipe_ingredients'>
type Ingredient = Row<'ingredients'>

/**
 * Production Automation System Orchestrator
 * Main coordinator for production automation functionality
 */

export class ProductionAutomation {
  constructor(private readonly config: AutomationConfig) {}

  /**
   * 🏭 PRODUCTION AUTOMATION: Smart Production Planning
   */
  generateProductionPlan(
    orders: OrderForProduction[],
    recipes: Array<Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> }>,
    currentInventory: Ingredient[]
  ): ProductionPlan {
    return ProductionPlanner.generateProductionPlan(orders, recipes, currentInventory, this.config)
  }

  /**
   * Calculate production capacity and bottlenecks
   */
  calculateProductionCapacity(
    equipment: Equipment[],
    staffing: Staffing[]
  ): ProductionCapacity {
    return CapacityManager.calculateProductionCapacity(equipment, staffing)
  }

  /**
   * Schedule production orders with optimal timing
   */
  scheduleOptimalProduction(
    plan: Array<{ recipeId: string; quantity: number; priority: number; deliveryDate: Date; production: { estimatedDuration: number } }>,
    workingHours: WorkingHours
  ): ScheduledProductionItem[] {
    return TimeCalculator.scheduleOptimalProduction(plan, workingHours) as unknown as ScheduledProductionItem[]
  }
}
