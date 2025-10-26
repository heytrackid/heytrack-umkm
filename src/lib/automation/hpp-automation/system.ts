/**
 * HPP Automation System Orchestrator
 * Main coordinator for all HPP automation functionality
 * NOTE: This system contains server-side operations and should only be used in server contexts
 */



import { automationLogger } from '@/lib/logger'
import { HPPCalculator } from './calculator'
import { IngredientMonitor } from './ingredient-monitor'
import { CostManager } from './cost-manager'
import { RecipeService } from './recipe-service'
import { CacheManager } from './cache-manager'
import { HPPNotificationService } from './notification-service'
import { HPPMonitor } from './monitor'
import type {
  RecipeHPP,
  HPPRecalculationResult,
  OperationalCost,
  PriceMonitoringResult,
  RecipeBasicInfo
} from './types'

export class HPPAutomationSystem {
  private static instance: HPPAutomationSystem

  private calculator: HPPCalculator
  private ingredientMonitor: IngredientMonitor
  private costManager: CostManager
  private recipeService: RecipeService
  private cacheManager: CacheManager
  private notificationService: HPPNotificationService
  private monitor: HPPMonitor

  private constructor() {
    this.calculator = new HPPCalculator()
    this.ingredientMonitor = new IngredientMonitor()
    this.costManager = new CostManager()
    this.recipeService = new RecipeService()
    this.cacheManager = new CacheManager()
    this.notificationService = new HPPNotificationService()
    this.monitor = new HPPMonitor()
  }

  public static getInstance(): HPPAutomationSystem {
    if (!HPPAutomationSystem.instance) {
      HPPAutomationSystem.instance = new HPPAutomationSystem()
    }
    return HPPAutomationSystem.instance
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Calculate smart HPP for a recipe
   */
  async calculateSmartHPP(recipeId: string): Promise<RecipeHPP> {
    automationLogger.info({ recipeId }, 'Calculating smart HPP for recipe')

    // Get recipe data
    const recipeData = await this.recipeService.getRecipeData(recipeId)
    if (!recipeData) {
      throw new Error(`Recipe not found: ${recipeId}`)
    }

    // Calculate HPP
    const operationalCosts = this.costManager.getOperationalCosts()
    const hpp = HPPCalculator.calculateRecipeHPP(recipeData, operationalCosts)

    // Cache the result
    this.cacheManager.setRecipeHPP(recipeId, hpp)

    automationLogger.info({
      recipeId,
      totalHPP: hpp.totalHPP,
      hppPerServing: hpp.hppPerServing
    }, 'HPP calculated successfully')

    return hpp
  }

  /**
   * Handle ingredient price changes
   */
  async onIngredientPriceChange(ingredientId: string, oldPrice: number, newPrice: number): Promise<void> {
    automationLogger.info({ ingredientId, oldPrice, newPrice }, 'Ingredient price changed')

    // Update price tracking
    this.ingredientMonitor.trackPriceHistory(ingredientId, newPrice)

    // Find affected recipes
    const affectedRecipes = await this.recipeService.findRecipesUsingIngredient(ingredientId)
    if (affectedRecipes.length === 0) {
      automationLogger.info('No recipes affected by price change')
      return
    }

    automationLogger.info({ count: affectedRecipes.length }, 'Found recipes affected by price change')

    // Recalculate HPP for affected recipes
    const recalculationResults: HPPRecalculationResult[] = []
    for (const recipe of affectedRecipes) {
      try {
        const result = await this.recalculateRecipeHPP(recipe.id)
        recalculationResults.push(result)
      } catch (error) {
        automationLogger.error({
          error: error instanceof Error ? error.message : String(error),
          recipeId: recipe.id
        }, 'Error recalculating HPP for recipe')
      }
    }

    // Generate notifications
    this.notificationService.generatePriceChangeNotifications(
      ingredientId,
      oldPrice,
      newPrice,
      recalculationResults
    )
  }

  /**
   * Handle operational cost changes
   */
  async onOperationalCostChange(costId: string, oldAmount: number, newAmount: number): Promise<void> {
    automationLogger.info({ costId, oldAmount, newAmount }, 'Operational cost changed')

    // Update cost
    const updatedCost = this.costManager.updateOperationalCost(costId, newAmount)
    if (!updatedCost) {
      automationLogger.error({ costId }, 'Operational cost item not found')
      return
    }

    // Check if auto-allocate is enabled
    if (updatedCost.autoAllocate) {
      automationLogger.info({ costName: updatedCost.name }, 'Auto-allocating cost change to all recipes')
      await this.recalculateAllRecipes('operational_cost_change')
    }

    // Generate notification
    this.notificationService.generateOperationalCostNotification(
      costId,
      updatedCost.name,
      oldAmount,
      newAmount,
      updatedCost.autoAllocate
    )
  }

  /**
   * Get cached HPP for a recipe
   */
  getRecipeHPP(recipeId: string): RecipeHPP | undefined {
    return this.cacheManager.getRecipeHPP(recipeId)
  }

  /**
   * Get all operational costs
   */
  getOperationalCosts(): OperationalCost[] {
    return this.costManager.getOperationalCosts()
  }

  /**
   * Update operational cost
   */
  updateOperationalCost(costId: string, newAmount: number): void {
    const oldAmount = this.costManager.getOperationalCost(costId)?.amount || 0
    this.onOperationalCostChange(costId, oldAmount, newAmount)
  }

  /**
   * Monitor ingredient prices
   */
  async monitorIngredientPrices(ingredients: Array<{ id: string; name: string; price_per_unit: number }>): Promise<PriceMonitoringResult> {
    return this.ingredientMonitor.monitorIngredientPrices(ingredients)
  }

  /**
   * Start monitoring
   */
  startMonitoring(): void {
    this.monitor.startMonitoring()
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.monitor.stopMonitoring()
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Recalculate HPP for a single recipe
   */
  private async recalculateRecipeHPP(recipeId: string): Promise<HPPRecalculationResult> {
    const oldHPP = this.cacheManager.getRecipeHPP(recipeId)
    const newHPP = await this.calculateSmartHPP(recipeId)

    const result: HPPRecalculationResult = {
      recipeId,
      recipeName: newHPP.recipeName,
      oldHPP: oldHPP?.hppPerServing || 0,
      newHPP: newHPP.hppPerServing,
      change: newHPP.hppPerServing - (oldHPP?.hppPerServing || 0),
      changePercentage: oldHPP ? ((newHPP.hppPerServing - oldHPP.hppPerServing) / oldHPP.hppPerServing) * 100 : 0,
      impactLevel: this.getImpactLevel(newHPP.hppPerServing - (oldHPP?.hppPerServing || 0))
    }

    automationLogger.info({
      recipeName: newHPP.recipeName,
      oldHPP: result.oldHPP,
      newHPP: result.newHPP
    }, 'HPP recalculated for recipe')

    return result
  }

  /**
   * Recalculate HPP for all recipes
   */
  private async recalculateAllRecipes(reason: string): Promise<HPPRecalculationResult[]> {
    automationLogger.info({ reason }, 'Recalculating all recipes')

    const allRecipeIds = await this.recipeService.getAllRecipeIds()
    const results: HPPRecalculationResult[] = []

    for (const recipeId of allRecipeIds) {
      try {
        const result = await this.recalculateRecipeHPP(recipeId)
        results.push(result)
      } catch (error) {
        automationLogger.error({
          error: error instanceof Error ? error.message : String(error),
          recipeId
        }, 'Error recalculating recipe')
      }
    }

    // Generate batch update notification
    this.notificationService.generateBatchRecalculationNotification(
      reason,
      results.length,
      allRecipeIds.length
    )

    return results
  }

  /**
   * Get impact level based on HPP change
   */
  private getImpactLevel(change: number): 'low' | 'medium' | 'high' {
    const absChange = Math.abs(change)
    if (absChange > 1000) return 'high'
    if (absChange > 500) return 'medium'
    return 'low'
  }
}
