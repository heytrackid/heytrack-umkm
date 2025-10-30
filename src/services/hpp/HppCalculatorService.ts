/**
 * Consolidated HPP Calculator Service
 * Handles all HPP (Harga Pokok Produksi) calculations
 * 
 * This is the SINGLE source of truth for HPP calculations.
 * DO NOT create duplicate services.
 */

import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import { HPP_CONFIG } from '@/lib/constants/hpp-config'
import { isRecipeWithIngredients } from '@/lib/type-guards'
import type { Database } from '@/types/supabase-generated'
import type { SupabaseClient } from '@supabase/supabase-js'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type Production = Database['public']['Tables']['productions']['Row']
type StockTransaction = Database['public']['Tables']['stock_transactions']['Row']

export interface HppCalculationResult {
  recipe_id: string // Use snake_case for consistency with DB
  material_cost: number
  labor_cost: number
  overhead_cost: number
  total_hpp: number
  cost_per_unit: number
  wac_adjustment: number
  production_quantity: number
  material_breakdown: Array<{
    ingredient_id: string
    ingredient_name: string
    quantity: number
    unit: string
    unit_price: number
    total_cost: number
  }>
}

export class HppCalculatorService {
  private logger = dbLogger

  /**
   * Calculate HPP for a specific recipe
   * @param supabase - Supabase client (passed from caller for proper auth context)
   * @param recipeId - Recipe ID to calculate HPP for
   * @param userId - User ID for RLS enforcement
   */
  async calculateRecipeHpp(
    supabase: SupabaseClient<Database>,
    recipeId: string,
    userId: string
  ): Promise<HppCalculationResult> {
    try {
      this.logger.info({ recipeId, userId }, 'Calculating HPP for recipe')

      // Get recipe details with ingredients
      type RecipeWithIngredients = Recipe & {
        recipe_ingredients: Array<RecipeIngredient & {
          ingredients: Ingredient | null
        }> | null
      }

      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            *,
            ingredients:ingredient_id (
              id,
              name,
              price_per_unit,
              weighted_average_cost,
              unit
            )
          )
        `)
        .eq('id', recipeId)
        .eq('user_id', userId)
        .single()

      if (recipeError || !recipe) {
        throw new Error(`Recipe not found: ${recipeId}`)
      }

      // Use type guard to validate the structure of the returned recipe data
      if (!isRecipeWithIngredients(recipe)) {
        throw new Error('Invalid recipe data structure returned from database')
      }

      const recipeData = recipe

      // Calculate material costs using WAC when available
      const material_breakdown: HppCalculationResult['material_breakdown'] = []
      let total_material_cost = 0

      const recipeIngredients = recipeData.recipe_ingredients || []

      for (const ri of recipeIngredients) {
        const ingredient = ri.ingredients
        if (!ingredient) {
          this.logger.warn({ ingredient_id: ri.ingredient_id }, 'Ingredient not found for recipe ingredient')
          continue
        }

        const quantity = Number(ri.quantity)
        // Use WAC if available, otherwise use current price
        const unit_price = Number(ingredient.weighted_average_cost || ingredient.price_per_unit || 0)
        const total_cost = quantity * unit_price

        material_breakdown.push({
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          quantity,
          unit: ri.unit,
          unit_price,
          total_cost
        })

        total_material_cost += total_cost
      }

      // Calculate labor cost from recent productions
      const labor_cost = await this.calculateLaborCost(supabase, recipeId, userId)

      // Calculate overhead cost with production-based allocation
      const overhead_cost = await this.calculateOverheadCost(supabase, recipeId, userId)

      // Apply WAC adjustment based on recipe quantities
      const wac_adjustment = await this.calculateWacAdjustment(
        supabase,
        recipeId,
        userId,
        recipeIngredients
      )

      // Calculate total HPP
      const total_hpp = total_material_cost + labor_cost + overhead_cost + wac_adjustment
      const servings = recipeData.servings || 1
      const cost_per_unit = servings > 0 ? total_hpp / servings : total_hpp

      const result: HppCalculationResult = {
        recipe_id: recipeId,
        material_cost: total_material_cost,
        labor_cost,
        overhead_cost,
        total_hpp,
        cost_per_unit,
        wac_adjustment,
        production_quantity: servings,
        material_breakdown
      }

      // Save calculation to database
      await this.saveHppCalculation(supabase, result, userId)

      this.logger.info({ recipe_id: recipeId, total_hpp, cost_per_unit }, 'HPP calculated successfully')
      return result

    } catch (error: unknown) {
      this.logger.error({ error, recipeId }, 'Failed to calculate HPP for recipe')
      throw error
    }
  }

  /**
   * Calculate labor cost based on recent production batches
   * Uses weighted average from last 10 completed productions
   */
  private async calculateLaborCost(
    supabase: SupabaseClient<Database>,
    recipeId: string,
    userId: string
  ): Promise<number> {
    try {
      const { data: productions, error } = await supabase
        .from('productions')
        .select('labor_cost, actual_quantity')
        .eq('recipe_id', recipeId)
        .eq('user_id', userId)
        .eq('status', 'COMPLETED')
        .order('actual_end_time', { ascending: false })
        .limit(10)

      if (error) {
        this.logger.warn({ error: error.message }, 'Failed to fetch productions for labor cost')
        return HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING
      }

      if (!productions || productions.length === 0) {
        return HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING
      }

      // Calculate weighted average labor cost per unit
      const totalLaborCost = productions.reduce(
        (sum, p) => sum + Number(p.labor_cost || 0),
        0
      )
      const totalQuantity = productions.reduce(
        (sum, p) => sum + Number(p.actual_quantity || 0),
        0
      )

      return totalQuantity > 0 ? totalLaborCost / totalQuantity : HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING

    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to calculate labor cost')
      return HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING
    }
  }

  /**
   * Calculate overhead cost allocation
   * Uses production volume-based allocation for fairness
   */
  private async calculateOverheadCost(
    supabase: SupabaseClient<Database>,
    recipeId: string,
    userId: string
  ): Promise<number> {
    try {
      // Get active operational costs
      const { data: operationalCosts, error } = await supabase
        .from('operational_costs')
        .select('amount')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        this.logger.warn({ error: error.message }, 'Failed to fetch operational costs')
        return HPP_CONFIG.DEFAULT_OVERHEAD_PER_SERVING
      }

      if (!operationalCosts || operationalCosts.length === 0) {
        return HPP_CONFIG.DEFAULT_OVERHEAD_PER_SERVING
      }

      const totalOverhead = operationalCosts.reduce(
        (sum, cost) => sum + Number(cost.amount || 0),
        0
      )

      // Get production volume for this recipe (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: recipeProductions } = await supabase
        .from('productions')
        .select('actual_quantity')
        .eq('recipe_id', recipeId)
        .eq('user_id', userId)
        .eq('status', 'COMPLETED')
        .gte('actual_end_time', thirtyDaysAgo.toISOString())

      const recipeVolume = (recipeProductions || []).reduce(
        (sum, p) => sum + Number(p.actual_quantity || 0),
        0
      )

      // Get total production volume for all recipes
      const { data: allProductions } = await supabase
        .from('productions')
        .select('actual_quantity')
        .eq('user_id', userId)
        .eq('status', 'COMPLETED')
        .gte('actual_end_time', thirtyDaysAgo.toISOString())

      const totalVolume = (allProductions || []).reduce(
        (sum, p) => sum + Number(p.actual_quantity || 0),
        0
      )

      // Allocate overhead proportionally based on production volume
      if (totalVolume > 0 && recipeVolume > 0) {
        const allocationRatio = recipeVolume / totalVolume
        return (totalOverhead * allocationRatio) / recipeVolume
      }

      // Fallback: equal allocation across active recipes
      const { count: recipeCount } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true)

      if (recipeCount && recipeCount > 0) {
        return totalOverhead / recipeCount
      }

      return totalOverhead / HPP_CONFIG.FALLBACK_RECIPE_COUNT

    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to calculate overhead cost')
      return HPP_CONFIG.DEFAULT_OVERHEAD_PER_SERVING
    }
  }

  /**
   * Calculate WAC (Weighted Average Cost) adjustment
   * Compares current prices with historical WAC from recent purchases
   */
  private async calculateWacAdjustment(
    supabase: SupabaseClient<Database>,
    recipeId: string,
    userId: string,
    recipeIngredients: Array<RecipeIngredient & { ingredients: Ingredient | null }>
  ): Promise<number> {
    try {
      if (!recipeIngredients || recipeIngredients.length === 0) {
        return 0
      }

      const ingredientIds = recipeIngredients
        .filter(ri => ri.ingredients)
        .map(ri => ri.ingredient_id)

      if (ingredientIds.length === 0) {
        return 0
      }

      // Get recent purchase transactions for these ingredients
      const { data: transactions, error } = await supabase
        .from('stock_transactions')
        .select('ingredient_id, quantity, unit_price, total_price')
        .in('ingredient_id', ingredientIds)
        .eq('user_id', userId)
        .eq('type', 'PURCHASE')
        .order('created_at', { ascending: false })
        .limit(HPP_CONFIG.WAC_LOOKBACK_TRANSACTIONS)

      if (error || !transactions) {
        this.logger.warn({ error }, 'Failed to fetch stock transactions for WAC')
        return 0
      }

      let totalAdjustment = 0

      // Calculate WAC adjustment for each ingredient
      for (const ri of recipeIngredients) {
        const ingredient = ri.ingredients
        if (!ingredient) {continue}

        const ingredientTransactions = transactions.filter(
          t => t.ingredient_id === ri.ingredient_id
        )

        if (ingredientTransactions.length === 0) {continue}

        // Calculate weighted average cost from transactions
        const totalQuantity = ingredientTransactions.reduce(
          (sum, t) => sum + Number(t.quantity || 0),
          0
        )
        const totalValue = ingredientTransactions.reduce(
          (sum, t) => sum + Number(t.total_price || 0),
          0
        )

        if (totalQuantity === 0) {continue}

        const wac = totalValue / totalQuantity
        const currentPrice = Number(ingredient.price_per_unit || 0)

        // Adjustment based on recipe quantity (not transaction quantity!)
        const recipeQuantity = Number(ri.quantity || 0)
        const adjustment = (wac - currentPrice) * recipeQuantity

        totalAdjustment += adjustment

        this.logger.debug({
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          wac,
          currentPrice,
          recipeQuantity,
          adjustment
        }, 'WAC adjustment calculated for ingredient')
      }

      return totalAdjustment

    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to calculate WAC adjustment')
      return 0
    }
  }

  /**
   * Save HPP calculation to database
   */
  private async saveHppCalculation(
    supabase: SupabaseClient<Database>,
    result: HppCalculationResult,
    userId: string
  ): Promise<void> {
    try {
      const calculationData = {
        recipe_id: result.recipe_id,
        user_id: userId,
        calculation_date: new Date().toISOString().split('T')[0],
        material_cost: result.material_cost,
        labor_cost: result.labor_cost,
        overhead_cost: result.overhead_cost,
        total_hpp: result.total_hpp,
        cost_per_unit: result.cost_per_unit,
        wac_adjustment: result.wac_adjustment,
        production_quantity: result.production_quantity,
        notes: `Auto-calculated HPP for ${result.production_quantity} servings`
      }

      const { error } = await supabase
        .from('hpp_calculations')
        .insert(calculationData)

      if (error) {
        throw new Error(`Failed to save HPP calculation: ${error.message}`)
      }

      // Update recipe with latest cost
      await supabase
        .from('recipes')
        .update({ cost_per_unit: result.cost_per_unit })
        .eq('id', result.recipe_id)
        .eq('user_id', userId)

      this.logger.info({ recipe_id: result.recipe_id }, 'HPP calculation saved')

    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to save HPP calculation')
      throw error
    }
  }

  /**
   * Get latest HPP for a recipe
   */
  async getLatestHpp(
    supabase: SupabaseClient<Database>,
    recipeId: string,
    userId: string
  ): Promise<Database['public']['Tables']['hpp_calculations']['Row'] | null> {
    try {
      const { data, error } = await supabase
        .from('hpp_calculations')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('user_id', userId)
        .order('calculation_date', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch latest HPP: ${error.message}`)
      }

      return data || null

    } catch (error: unknown) {
      this.logger.error({ error, recipeId }, 'Failed to get latest HPP')
      throw error
    }
  }
}
