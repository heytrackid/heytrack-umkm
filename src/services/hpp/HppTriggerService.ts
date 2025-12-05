import { dbLogger } from '@/lib/logger'
import { BaseService, type ServiceContext } from '@/services/base'
import { HppCalculatorService } from './HppCalculatorService'

/**
 * HPP Trigger Service
 * Handles automatic HPP recalculation when upstream data changes
 * 
 * TRIGGERS:
 * 1. Ingredient price changes → Recalculate HPP for all recipes using that ingredient
 * 2. Recipe ingredients change → Recalculate HPP for that recipe
 * 3. Operational costs change → Recalculate HPP for all active recipes
 * 4. Production completed → Update labor cost data (affects future HPP calculations)
 * 
 * USAGE:
 * - Call these methods from API routes when relevant data changes
 * - Can also be called from background jobs for batch updates
 */
export class HppTriggerService extends BaseService {
  private readonly logger = dbLogger
  private calculator: HppCalculatorService

  constructor(context: ServiceContext) {
    super(context)
    this.calculator = new HppCalculatorService(context)
  }

  /**
   * Trigger HPP recalculation when ingredient price changes
   * @param ingredientId - The ingredient whose price changed
   */
  async onIngredientPriceChange(ingredientId: string): Promise<{
    success: boolean
    recipesUpdated: number
    errors: string[]
  }> {
    const errors: string[] = []
    let recipesUpdated = 0

    try {
      this.logger.info({ ingredientId, userId: this.context.userId }, 'Triggering HPP recalculation for ingredient price change')

      // Find all recipes that use this ingredient
      const { data: recipeIngredients, error } = await this.context.supabase
        .from('recipe_ingredients')
        .select('recipe_id')
        .eq('ingredient_id', ingredientId)

      if (error) {
        throw new Error(`Failed to find recipes using ingredient: ${error.message}`)
      }

      if (!recipeIngredients || recipeIngredients.length === 0) {
        this.logger.info({ ingredientId }, 'No recipes use this ingredient')
        return { success: true, recipesUpdated: 0, errors: [] }
      }

      // Get unique recipe IDs
      const recipeIds = [...new Set(recipeIngredients.map(ri => ri.recipe_id))]

      // Recalculate HPP for each recipe
      for (const recipeId of recipeIds) {
        try {
          // Verify recipe belongs to user and is active
          const { data: recipe } = await this.context.supabase
            .from('recipes')
            .select('id, is_active')
            .eq('id', recipeId)
            .eq('user_id', this.context.userId)
            .single()

          if (recipe?.is_active) {
            await this.calculator.calculateRecipeHpp(recipeId)
            recipesUpdated++
          }
        } catch (recipeError) {
          const errorMsg = `Failed to recalculate HPP for recipe ${recipeId}: ${recipeError}`
          this.logger.error({ recipeId, error: recipeError }, errorMsg)
          errors.push(errorMsg)
        }
      }

      this.logger.info({ ingredientId, recipesUpdated, errors: errors.length }, 'HPP recalculation completed for ingredient price change')

      return {
        success: errors.length === 0,
        recipesUpdated,
        errors
      }

    } catch (error) {
      this.logger.error({ error, ingredientId }, 'Failed to trigger HPP recalculation for ingredient price change')
      return {
        success: false,
        recipesUpdated,
        errors: [String(error)]
      }
    }
  }

  /**
   * Trigger HPP recalculation when recipe ingredients change
   * @param recipeId - The recipe whose ingredients changed
   */
  async onRecipeIngredientsChange(recipeId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      this.logger.info({ recipeId, userId: this.context.userId }, 'Triggering HPP recalculation for recipe ingredients change')

      // Verify recipe belongs to user
      const { data: recipe } = await this.context.supabase
        .from('recipes')
        .select('id, is_active')
        .eq('id', recipeId)
        .eq('user_id', this.context.userId)
        .single()

      if (!recipe) {
        return { success: false, error: 'Recipe not found' }
      }

      if (!recipe.is_active) {
        this.logger.info({ recipeId }, 'Recipe is inactive, skipping HPP recalculation')
        return { success: true }
      }

      await this.calculator.calculateRecipeHpp(recipeId)

      this.logger.info({ recipeId }, 'HPP recalculation completed for recipe ingredients change')

      return { success: true }

    } catch (error) {
      this.logger.error({ error, recipeId }, 'Failed to trigger HPP recalculation for recipe ingredients change')
      return {
        success: false,
        error: String(error)
      }
    }
  }

  /**
   * Trigger HPP recalculation when operational costs change
   * This affects overhead allocation for all recipes
   */
  async onOperationalCostsChange(): Promise<{
    success: boolean
    recipesUpdated: number
    errors: string[]
  }> {
    const errors: string[] = []
    let recipesUpdated = 0

    try {
      this.logger.info({ userId: this.context.userId }, 'Triggering HPP recalculation for operational costs change')

      // Get all active recipes for this user
      const { data: recipes, error } = await this.context.supabase
        .from('recipes')
        .select('id')
        .eq('user_id', this.context.userId)
        .eq('is_active', true)

      if (error) {
        throw new Error(`Failed to fetch recipes: ${error.message}`)
      }

      if (!recipes || recipes.length === 0) {
        this.logger.info({}, 'No active recipes to update')
        return { success: true, recipesUpdated: 0, errors: [] }
      }

      // Recalculate HPP for each recipe
      for (const recipe of recipes) {
        try {
          await this.calculator.calculateRecipeHpp(recipe.id)
          recipesUpdated++
        } catch (recipeError) {
          const errorMsg = `Failed to recalculate HPP for recipe ${recipe.id}: ${recipeError}`
          this.logger.error({ recipeId: recipe.id, error: recipeError }, errorMsg)
          errors.push(errorMsg)
        }
      }

      this.logger.info({ recipesUpdated, errors: errors.length }, 'HPP recalculation completed for operational costs change')

      return {
        success: errors.length === 0,
        recipesUpdated,
        errors
      }

    } catch (error) {
      this.logger.error({ error }, 'Failed to trigger HPP recalculation for operational costs change')
      return {
        success: false,
        recipesUpdated,
        errors: [String(error)]
      }
    }
  }

  /**
   * Check for stale HPP calculations
   * Returns recipes that haven't been recalculated in the specified number of days
   * @param staleDays - Number of days after which HPP is considered stale (default: 7)
   */
  async checkStaleHpp(staleDays: number = 7): Promise<{
    staleRecipes: Array<{
      id: string
      name: string
      lastCalculated: string | null
      daysSinceCalculation: number | null
    }>
    totalActive: number
    staleCount: number
  }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - staleDays)

      // Get all active recipes with their latest HPP calculation
      const { data: recipes, error } = await this.context.supabase
        .from('recipes')
        .select(`
          id,
          name,
          hpp_calculations (
            calculation_date,
            created_at
          )
        `)
        .eq('user_id', this.context.userId)
        .eq('is_active', true)
        .order('name')

      if (error) {
        throw new Error(`Failed to fetch recipes: ${error.message}`)
      }

      const staleRecipes: Array<{
        id: string
        name: string
        lastCalculated: string | null
        daysSinceCalculation: number | null
      }> = []

      for (const recipe of recipes || []) {
        const hppCalcs = recipe.hpp_calculations as Array<{ calculation_date: string | null; created_at: string }> | null
        const latestCalc = hppCalcs && hppCalcs.length > 0
          ? hppCalcs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          : null

        const lastCalculated = latestCalc?.calculation_date || latestCalc?.created_at || null
        let daysSinceCalculation: number | null = null

        if (lastCalculated) {
          const calcDate = new Date(lastCalculated)
          daysSinceCalculation = Math.floor((Date.now() - calcDate.getTime()) / (1000 * 60 * 60 * 24))
        }

        // Recipe is stale if never calculated or calculated more than staleDays ago
        if (!lastCalculated || (daysSinceCalculation !== null && daysSinceCalculation > staleDays)) {
          staleRecipes.push({
            id: recipe.id,
            name: recipe.name,
            lastCalculated,
            daysSinceCalculation
          })
        }
      }

      return {
        staleRecipes,
        totalActive: recipes?.length || 0,
        staleCount: staleRecipes.length
      }

    } catch (error) {
      this.logger.error({ error }, 'Failed to check stale HPP')
      throw error
    }
  }

  /**
   * Refresh stale HPP calculations
   * @param staleDays - Number of days after which HPP is considered stale (default: 7)
   */
  async refreshStaleHpp(staleDays: number = 7): Promise<{
    success: boolean
    recipesUpdated: number
    errors: string[]
  }> {
    const errors: string[] = []
    let recipesUpdated = 0

    try {
      this.logger.info({ staleDays, userId: this.context.userId }, 'Refreshing stale HPP calculations')

      const { staleRecipes } = await this.checkStaleHpp(staleDays)

      for (const recipe of staleRecipes) {
        try {
          await this.calculator.calculateRecipeHpp(recipe.id)
          recipesUpdated++
        } catch (recipeError) {
          const errorMsg = `Failed to refresh HPP for recipe ${recipe.id}: ${recipeError}`
          this.logger.error({ recipeId: recipe.id, error: recipeError }, errorMsg)
          errors.push(errorMsg)
        }
      }

      this.logger.info({ recipesUpdated, errors: errors.length }, 'Stale HPP refresh completed')

      return {
        success: errors.length === 0,
        recipesUpdated,
        errors
      }

    } catch (error) {
      this.logger.error({ error }, 'Failed to refresh stale HPP')
      return {
        success: false,
        recipesUpdated,
        errors: [String(error)]
      }
    }
  }

  /**
   * Batch recalculate HPP for all active recipes
   * Use with caution - this can be resource intensive
   */
  async batchRecalculateAll(): Promise<{
    success: boolean
    recipesUpdated: number
    errors: string[]
  }> {
    const errors: string[] = []
    let recipesUpdated = 0

    try {
      this.logger.info({ userId: this.context.userId }, 'Starting batch HPP recalculation for all recipes')

      const { data: recipes, error } = await this.context.supabase
        .from('recipes')
        .select('id, name')
        .eq('user_id', this.context.userId)
        .eq('is_active', true)

      if (error) {
        throw new Error(`Failed to fetch recipes: ${error.message}`)
      }

      if (!recipes || recipes.length === 0) {
        return { success: true, recipesUpdated: 0, errors: [] }
      }

      for (const recipe of recipes) {
        try {
          await this.calculator.calculateRecipeHpp(recipe.id)
          recipesUpdated++
          this.logger.debug({ recipeId: recipe.id, recipeName: recipe.name }, 'HPP recalculated')
        } catch (recipeError) {
          const errorMsg = `Failed to recalculate HPP for recipe ${recipe.name}: ${recipeError}`
          this.logger.error({ recipeId: recipe.id, error: recipeError }, errorMsg)
          errors.push(errorMsg)
        }
      }

      this.logger.info({ recipesUpdated, errors: errors.length }, 'Batch HPP recalculation completed')

      return {
        success: errors.length === 0,
        recipesUpdated,
        errors
      }

    } catch (error) {
      this.logger.error({ error }, 'Failed to batch recalculate HPP')
      return {
        success: false,
        recipesUpdated,
        errors: [String(error)]
      }
    }
  }
}
