/**
 * Production Automation System Orchestrator
 * Main coordinator for production automation functionality
 */

import type {
  Recipe,
  RecipeIngredient,
  Ingredient,
  ProductionPlan,
  AutomationConfig
} from '../types'
import type {
  OrderForProduction,
  Equipment,
  Staffing,
  ProductionCapacity,
  WorkingHours,
  ScheduledProductionItem
} from './types'
import { ProductionPlanner } from './production-planner'
import { CapacityManager } from './capacity-manager'
import { TimeCalculator } from './time-calculator'

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
    plan: any[], // ProductionPlanItem[]
    workingHours: WorkingHours
  ): ScheduledProductionItem[] {
    return TimeCalculator.scheduleOptimalProduction(plan, workingHours)
  }
}
