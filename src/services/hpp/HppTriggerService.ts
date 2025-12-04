/**
 * HPP Trigger Service
 * Handles automatic HPP recalculation when upstream data changes
 * 
 * ✅ STANDARDIZED: Extends BaseService, uses ServiceContext
 */

import { dbLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'
import { HppCalculatorService } from './HppCalculatorService'

export interface HppTriggerResult {
  triggered: boolean
  recipeIds: string[]
  results: Array<{
    recipeId: string
    success: boolean
    newCostPerUnit?: number
    error?: string
  }>
}

export class HppTriggerService extends BaseService {
  private readonly logger = dbLogger

  constructor(context: ServiceContext) {
    super(context)
  }

  /**
   * Recalculate HPP for all recipes using a specific ingredient
   * Called when ingredient price changes
   */
  async onIngredientPriceChange(ingredientId: string): Promise<HppTriggerResult> {
    this.logger.info({ ingredientId }, 'Triggering HPP recalculation for ingredient price change')

    // Find all recipes using this ingredient
    const { data: recipeIngredients, error } = await this.context.supabase
      .from('recipe_ingredients')
      .select('recipe_id')
      .eq('ingredient_id', ingredientId)
      .eq('user_id', this.context.userId)

    if (error || !recipeIngredients) {
      this.logger.error({ error, ingredientId }, 'Failed to find recipes for ingredient')
      return { triggered: false, recipeIds: [], results: [] }
    }

    const recipeIds = [...new Set(recipeIngredients.map(ri => ri.recipe_id))]
    
    if (recipeIds.length === 0) {
      return { triggered: false, recipeIds: [], results: [] }
    }

    return this.recalculateMultipleRecipes(recipeIds)
  }

  /**
   * Recalculate HPP for a specific recipe
   * Called when recipe ingredients change
   */
  async onRecipeIngredientsChange(recipeId: string): Promise<HppTriggerResult> {
    this.logger.info({ recipeId }, 'Triggering HPP recalculation for recipe ingredients change')
    return this.recalculateMultipleRecipes([recipeId])
  }

  /**
   * Recalculate HPP for all active recipes
   * Called when operational costs change
   */
  async onOperationalCostsChange(): Promise<HppTriggerResult> {
    this.logger.info({}, 'Triggering HPP recalculation for operational costs change')

    // Get all active recipes
    const { data: recipes, error } = await this.context.supabase
      .from('recipes')
      .select('id')
      .eq('user_id', this.context.userId)
      .eq('is_active', true)

    if (error || !recipes) {
      this.logger.error({ error }, 'Failed to fetch active recipes')
      return { triggered: false, recipeIds: [], results: [] }
    }

    const recipeIds = recipes.map(r => r.id)
    
    if (recipeIds.length === 0) {
      return { triggered: false, recipeIds: [], results: [] }
    }

    return this.recalculateMultipleRecipes(recipeIds)
  }

  /**
   * Recalculate HPP for multiple recipes
   */
  private async recalculateMultipleRecipes(recipeIds: string[]): Promise<HppTriggerResult> {
    const calculator = new HppCalculatorService(this.context)
    const results: HppTriggerResult['results'] = []

    for (const recipeId of recipeIds) {
      try {
        const calculation = await calculator.calculateRecipeHpp(recipeId)
        results.push({
          recipeId,
          success: true,
          newCostPerUnit: calculation.cost_per_unit
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        this.logger.error({ error: err, recipeId }, 'Failed to recalculate HPP for recipe')
        results.push({
          recipeId,
          success: false,
          error: errorMessage
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    this.logger.info({ 
      totalRecipes: recipeIds.length, 
      successCount,
      failedCount: recipeIds.length - successCount 
    }, 'HPP recalculation batch completed')

    return {
      triggered: true,
      recipeIds,
      results
    }
  }

  /**
   * Check if HPP needs recalculation based on data staleness
   */
  async checkStaleHpp(maxAgeDays: number = 7): Promise<string[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)

    // Find recipes with old or missing HPP calculations
    const { data: staleRecipes, error } = await this.context.supabase
      .from('recipes')
      .select(`
        id,
        name,
        hpp_calculations (
          created_at
        )
      `)
      .eq('user_id', this.context.userId)
      .eq('is_active', true)

    if (error || !staleRecipes) {
      return []
    }

    const staleRecipeIds: string[] = []

    for (const recipe of staleRecipes) {
      const calculations = recipe.hpp_calculations as Array<{ created_at: string }> | null
      
      if (!calculations || calculations.length === 0) {
        // No HPP calculation exists
        staleRecipeIds.push(recipe.id)
      } else {
        // Check if latest calculation is older than cutoff
        const latestCalc = calculations.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
        
        if (latestCalc && new Date(latestCalc.created_at) < cutoffDate) {
          staleRecipeIds.push(recipe.id)
        }
      }
    }

    return staleRecipeIds
  }

  /**
   * Refresh stale HPP calculations
   */
  async refreshStaleHpp(maxAgeDays: number = 7): Promise<HppTriggerResult> {
    const staleRecipeIds = await this.checkStaleHpp(maxAgeDays)
    
    if (staleRecipeIds.length === 0) {
      return { triggered: false, recipeIds: [], results: [] }
    }

    this.logger.info({ count: staleRecipeIds.length }, 'Refreshing stale HPP calculations')
    return this.recalculateMultipleRecipes(staleRecipeIds)
  }
}
