import { HPP_CONFIG } from '@/lib/constants/hpp-config'
import { dbLogger } from '@/lib/logger'
import { isRecipeWithIngredients } from '@/lib/type-guards'
import { BaseService, type ServiceContext } from '@/services/base'

import type { Insert, Row } from '@/types/database'



/**
 * Consolidated HPP Calculator Service
 * Handles all HPP (Harga Pokok Produksi) calculations
 * 
 * ✅ STANDARDIZED: Extends BaseService, uses ServiceContext
 * This is the SINGLE source of truth for HPP calculations.
 */


type RecipeIngredient = Row<'recipe_ingredients'>
type Ingredient = Row<'ingredients'>

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

export class HppCalculatorService extends BaseService {
  private readonly logger = dbLogger

  constructor(context: ServiceContext) {
    super(context)
  }

  /**
   * Calculate HPP for a specific recipe
   * @param recipeId - Recipe ID to calculate HPP for
   */
  async calculateRecipeHpp(
    recipeId: string
  ): Promise<HppCalculationResult> {
    return this.executeWithAudit(
      async () => {
        try {
          this.logger.info({ recipeId, userId: this.context.userId }, 'Calculating HPP for recipe')

          // Get recipe details with ingredients
          const { data: recipe, error: recipeError } = await this.context.supabase
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
          .eq('user_id', this.context.userId)
          .single()

      if (recipeError || !recipe) {
        throw new Error(`Recipe not found: ${recipeId}`)
      }

      // Use type guard to validate the structure of the returned recipe data
      if (!isRecipeWithIngredients(recipe)) {
        throw new Error('Invalid recipe data structure returned from database')
      }

      const recipeData = recipe

      // Validate servings
      const servings = recipeData.servings ?? 1
      if (servings <= 0) {
        throw new Error(`Invalid servings: ${servings}. Must be greater than 0`)
      }

      // Calculate material costs (per batch) using CURRENT PRICE (not WAC)
      // WAC adjustment will be calculated separately to avoid double-counting
      const material_breakdown: HppCalculationResult['material_breakdown'] = []
      let total_material_cost = 0

      const recipeIngredients = recipeData.recipe_ingredients || []

      for (const ri of recipeIngredients) {
        const ingredient = ri.ingredients
        if (!ingredient || typeof ingredient !== 'object' || !('id' in ingredient) || !('name' in ingredient)) {
          this.logger.warn({ ingredient_id: ri.ingredient_id }, 'Ingredient not found for recipe ingredient')
          continue
        }
        
        // Type assertion after validation
        const validIngredient = ingredient as { id: string; name: string; price_per_unit: number | null; weighted_average_cost: number | null; unit: string }

        const quantity = Number(ri.quantity ?? 0)
        // ALWAYS use current price for material cost (not WAC)
        // WAC adjustment is calculated separately
        const unit_price = Number(validIngredient.price_per_unit ?? 0)
        const total_cost = quantity * unit_price

        material_breakdown.push({
          ingredient_id: validIngredient['id'],
          ingredient_name: validIngredient.name,
          quantity,
          unit: ri.unit,
          unit_price,
          total_cost
        })

        total_material_cost += total_cost
      }

          const material_cost_per_unit = total_material_cost / servings

          // Calculate labor cost (per unit) from recent productions
          const labor_cost_per_unit = await this.calculateLaborCost(recipeId)

          // Calculate overhead cost (per unit) with production-based allocation
          const overhead_cost_per_unit = await this.calculateOverheadCost(recipeId)

          // Calculate WAC adjustment (difference between WAC and current price)
          // This is ONLY for tracking, not double-counted
          const wac_adjustment_per_unit = await this.calculateWacAdjustment(
            recipeIngredients as unknown as Array<RecipeIngredient & { ingredients: Ingredient | null }>,
            servings
          )

      // Final per-unit and per-batch totals
      const cost_per_unit =
        material_cost_per_unit + labor_cost_per_unit + overhead_cost_per_unit + wac_adjustment_per_unit
      
      // Validate cost_per_unit
      if (cost_per_unit < 0) {
        this.logger.warn({ recipeId, cost_per_unit }, 'Negative cost_per_unit detected, clamping to 0')
      }
      if (isNaN(cost_per_unit)) {
        throw new Error(`Invalid cost_per_unit (NaN) for recipe ${recipeId}`)
      }

      const total_hpp = cost_per_unit * servings

      // Convert per-unit components back to per-batch totals for persistence
      const labor_cost = labor_cost_per_unit * servings
      const overhead_cost = overhead_cost_per_unit * servings
      const wac_adjustment = wac_adjustment_per_unit * servings

      const result: HppCalculationResult = {
        recipe_id: recipeId,
        material_cost: total_material_cost,
        labor_cost,
        overhead_cost,
        total_hpp: Math.max(0, total_hpp), // Ensure non-negative
        cost_per_unit: Math.max(0, cost_per_unit), // Ensure non-negative
        wac_adjustment,
        production_quantity: servings,
        material_breakdown
      }

          // Save calculation to database
          await this.saveHppCalculation(result)

          this.logger.info({ recipe_id: recipeId, total_hpp, cost_per_unit }, 'HPP calculated successfully')
          return result

        } catch (error: unknown) {
          this.logger.error({ error, recipeId }, 'Failed to calculate HPP for recipe')
          throw error
        }
      },
      'CREATE',
      'HPP_CALCULATION',
      recipeId
    )
  }

  /**
   * Calculate labor cost based on recent production batches
   * Uses weighted average from completed productions
   * 
   * CALCULATION LOGIC:
   * 1. First, try to get labor cost from this recipe's productions
   * 2. If no data, try to get average labor cost from ALL productions
   * 3. If still no data, calculate from operational costs (labor category)
   * 4. Last resort: use default value
   */
  private async calculateLaborCost(
    recipeId: string
  ): Promise<number> {
    try {
      // Step 1: Try to get labor cost from this recipe's productions
      const { data: recipeProductions, error: recipeError } = await this.context.supabase
        .from('productions')
        .select('labor_cost, actual_quantity')
        .eq('recipe_id', recipeId)
        .eq('user_id', this.context.userId)
        .eq('status', 'COMPLETED')
        .order('actual_end_time', { ascending: false })
        .limit(100)

      if (!recipeError && recipeProductions && recipeProductions.length > 0) {
        const totalLaborCost = recipeProductions.reduce(
          (sum, p) => sum + Number(p.labor_cost ?? 0),
          0
        )
        const totalQuantity = recipeProductions.reduce(
          (sum, p) => sum + Number(p.actual_quantity ?? 0),
          0
        )

        if (totalQuantity > 0 && totalLaborCost > 0) {
          const laborCostPerUnit = totalLaborCost / totalQuantity
          this.logger.debug({ recipeId, laborCostPerUnit, source: 'recipe_productions' }, 'Labor cost calculated from recipe productions')
          return laborCostPerUnit
        }
      }

      // Step 2: Try to get average labor cost from ALL productions
      const { data: allProductions, error: allError } = await this.context.supabase
        .from('productions')
        .select('labor_cost, actual_quantity')
        .eq('user_id', this.context.userId)
        .eq('status', 'COMPLETED')
        .order('actual_end_time', { ascending: false })
        .limit(500)

      if (!allError && allProductions && allProductions.length > 0) {
        const totalLaborCost = allProductions.reduce(
          (sum, p) => sum + Number(p.labor_cost ?? 0),
          0
        )
        const totalQuantity = allProductions.reduce(
          (sum, p) => sum + Number(p.actual_quantity ?? 0),
          0
        )

        if (totalQuantity > 0 && totalLaborCost > 0) {
          const laborCostPerUnit = totalLaborCost / totalQuantity
          this.logger.debug({ recipeId, laborCostPerUnit, source: 'all_productions' }, 'Labor cost calculated from all productions')
          return laborCostPerUnit
        }
      }

      // Step 3: Calculate from operational costs (labor category)
      const { data: laborCosts, error: laborError } = await this.context.supabase
        .from('operational_costs')
        .select('amount')
        .eq('user_id', this.context.userId)
        .eq('is_active', true)
        .ilike('category', '%labor%')

      if (!laborError && laborCosts && laborCosts.length > 0) {
        const totalLaborCost = laborCosts.reduce(
          (sum, cost) => sum + Number(cost.amount ?? 0),
          0
        )

        // Get total production volume to calculate per-unit cost
        const { data: recentProductions } = await this.context.supabase
          .from('productions')
          .select('actual_quantity')
          .eq('user_id', this.context.userId)
          .eq('status', 'COMPLETED')
          .gte('actual_end_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        const totalVolume = (recentProductions ?? []).reduce(
          (sum, p) => sum + Number(p.actual_quantity ?? 0),
          0
        )

        if (totalVolume > 0 && totalLaborCost > 0) {
          const laborCostPerUnit = totalLaborCost / totalVolume
          this.logger.debug({ recipeId, laborCostPerUnit, source: 'operational_costs' }, 'Labor cost calculated from operational costs')
          return laborCostPerUnit
        }
      }

      // Step 4: Last resort - use default value
      this.logger.debug({ recipeId, laborCostPerUnit: HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING, source: 'default' }, 'Using default labor cost')
      return HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING

    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to calculate labor cost')
      return HPP_CONFIG.DEFAULT_LABOR_COST_PER_SERVING
    }
  }

  /**
   * Calculate overhead cost allocation
   * Uses production volume-based allocation for fairness
   * 
   * CALCULATION LOGIC:
   * 1. Get total operational costs (excluding labor - that's calculated separately)
   * 2. If recipe has production history, allocate based on volume ratio
   * 3. If recipe is new (no production), use equal allocation across all recipes
   * 4. Calculate per-unit overhead cost
   * 
   * FORMULA:
   * - For recipes with production: (Total Overhead × Volume Ratio) / Recipe Volume
   * - For new recipes: Total Overhead / Total Active Recipes / Expected Servings
   */
  private async calculateOverheadCost(
    recipeId: string
  ): Promise<number> {
    try {
      // Get active operational costs (EXCLUDING labor - that's calculated separately)
      const { data: operationalCosts, error } = await this.context.supabase
        .from('operational_costs')
        .select('amount, category')
        .eq('user_id', this.context.userId)
        .eq('is_active', true)

      if (error) {
        this.logger.warn({ error: error.message }, 'Failed to fetch operational costs')
        return HPP_CONFIG.DEFAULT_OVERHEAD_PER_SERVING
      }

      if (!operationalCosts || operationalCosts.length === 0) {
        return 0 // No operational costs = no overhead
      }

      // Filter out labor costs (already calculated separately)
      const nonLaborCosts = operationalCosts.filter(
        cost => !cost.category?.toLowerCase().includes('labor') &&
                !cost.category?.toLowerCase().includes('tenaga kerja') &&
                !cost.category?.toLowerCase().includes('gaji')
      )

      const totalOverhead = nonLaborCosts.reduce(
        (sum, cost) => sum + Number(cost.amount ?? 0),
        0
      )

      if (totalOverhead === 0) {
        return 0 // No overhead costs
      }

      // Get production volume for this recipe (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: recipeProductions } = await this.context.supabase
        .from('productions')
        .select('actual_quantity')
        .eq('recipe_id', recipeId)
        .eq('user_id', this.context.userId)
        .eq('status', 'COMPLETED')
        .gte('actual_end_time', thirtyDaysAgo.toISOString())

      const recipeVolume = (recipeProductions ?? []).reduce(
        (sum: number, p: { actual_quantity: number | null }) => sum + Number(p.actual_quantity ?? 0),
        0
      )

      // Get total production volume for all recipes
      const { data: allProductions } = await this.context.supabase
        .from('productions')
        .select('actual_quantity')
        .eq('user_id', this.context.userId)
        .eq('status', 'COMPLETED')
        .gte('actual_end_time', thirtyDaysAgo.toISOString())

      const totalVolume = (allProductions ?? []).reduce(
        (sum: number, p: { actual_quantity: number | null }) => sum + Number(p.actual_quantity ?? 0),
        0
      )

      // Case 1: Recipe has production history - allocate based on volume ratio
      if (totalVolume > 0 && recipeVolume > 0) {
        const allocationRatio = recipeVolume / totalVolume
        const allocatedOverhead = totalOverhead * allocationRatio
        const overheadPerUnit = allocatedOverhead / recipeVolume
        
        this.logger.debug({
          recipeId,
          totalOverhead,
          recipeVolume,
          totalVolume,
          allocationRatio,
          overheadPerUnit,
          source: 'volume_based'
        }, 'Overhead calculated based on production volume')
        
        return overheadPerUnit
      }

      // Case 2: Recipe is new (no production) - use equal allocation
      const { count: recipeCount } = await this.context.supabase
        .from('recipes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', this.context.userId)
        .eq('is_active', true)

      const activeRecipeCount = recipeCount ?? HPP_CONFIG.FALLBACK_RECIPE_COUNT

      // For new recipes, allocate equal share of overhead
      // Then divide by expected servings (we'll use average from other recipes)
      const overheadPerRecipe = totalOverhead / activeRecipeCount

      // Get average servings from all recipes
      const { data: recipes } = await this.context.supabase
        .from('recipes')
        .select('servings')
        .eq('user_id', this.context.userId)
        .eq('is_active', true)

      const avgServings = recipes && recipes.length > 0
        ? recipes.reduce((sum, r) => sum + (r.servings ?? 1), 0) / recipes.length
        : 10 // Default to 10 servings if no data

      const overheadPerUnit = overheadPerRecipe / avgServings

      this.logger.debug({
        recipeId,
        totalOverhead,
        activeRecipeCount,
        avgServings,
        overheadPerUnit,
        source: 'equal_allocation'
      }, 'Overhead calculated using equal allocation (new recipe)')

      return overheadPerUnit

    } catch (error: unknown) {
      this.logger.error({ error }, 'Failed to calculate overhead cost')
      return HPP_CONFIG.DEFAULT_OVERHEAD_PER_SERVING
    }
  }

  /**
   * Calculate WAC (Weighted Average Cost) adjustment
   * Compares current prices with historical WAC from recent purchases
   * 
   * IMPORTANT: This is ONLY for tracking/reporting purposes.
   * Material cost is calculated using CURRENT PRICE, not WAC.
   * This adjustment shows the difference between WAC and current price.
   */
  private async calculateWacAdjustment(
    recipeIngredients: Array<RecipeIngredient & { ingredients: Ingredient | null }>,
    servings: number
  ): Promise<number> {
    try {
      if (!recipeIngredients || recipeIngredients.length === 0) {
        return 0
      }

      if (servings <= 0) {
        return 0
      }

      const ingredientIds = recipeIngredients
        .filter(ri => ri.ingredients)
        .map(ri => ri.ingredient_id)

      if (ingredientIds.length === 0) {
        return 0
      }

      // Get recent purchase transactions for these ingredients
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - HPP_CONFIG.WAC_MAX_AGE_DAYS)

      const { data: transactions, error } = await this.context.supabase
        .from('stock_transactions')
        .select('ingredient_id, quantity, unit_price, total_price, created_at')
        .in('ingredient_id', ingredientIds)
        .eq('user_id', this.context.userId)
        .eq('type', 'PURCHASE')
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(HPP_CONFIG.WAC_LOOKBACK_TRANSACTIONS)

      if (error ?? !transactions) {
        this.logger.warn({ error }, 'Failed to fetch stock transactions for WAC')
        return 0
      }

      let totalAdjustment = 0

      // Calculate WAC adjustment per unit for each ingredient
      // Adjustment = (WAC - Current Price) × Qty per Unit
      for (const ri of recipeIngredients) {
        const ingredient = ri.ingredients
        if (!ingredient) {
          continue
        }

        const ingredientTransactions = transactions.filter(
          t => t.ingredient_id === ri.ingredient_id
        )

        if (ingredientTransactions.length === 0) {
          continue
        }

        // Calculate weighted average cost from transactions
        const totalQuantity = ingredientTransactions.reduce(
          (sum, t) => sum + Number(t.quantity ?? 0),
          0
        )
        const totalValue = ingredientTransactions.reduce(
          (sum, t) => sum + Number(t.total_price ?? 0),
          0
        )

        if (totalQuantity === 0) {
          continue
        }

        const wac = totalValue / totalQuantity
        const currentPrice = Number(ingredient.price_per_unit ?? 0)

        // Only calculate adjustment if WAC differs from current price
        if (Math.abs(wac - currentPrice) < 0.01) {
          continue
        }

        // Adjustment per unit: (qty per unit) * (wac - currentPrice)
        const quantityBatch = Number(ri.quantity ?? 0)
        const qtyPerUnit = quantityBatch / servings
        const adjustmentPerUnit = (wac - currentPrice) * qtyPerUnit

        totalAdjustment += adjustmentPerUnit

        this.logger.debug({
          ingredientId: (ingredient as unknown as { id?: string }).id,
          ingredientName: (ingredient as unknown as { name?: string }).name,
          wac,
          currentPrice,
          qtyPerUnit,
          adjustmentPerUnit,
          note: 'WAC adjustment for tracking only, not included in material cost'
        }, 'WAC adjustment calculated per unit for ingredient')
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
    result: HppCalculationResult
  ): Promise<void> {
    try {
      const calculationData: Insert<'hpp_calculations'> = {
        recipe_id: result.recipe_id,
        user_id: this.context.userId,
        calculation_date: new Date().toISOString().split('T')[0] ?? null,
        material_cost: result.material_cost,
        labor_cost: result.labor_cost,
        overhead_cost: result.overhead_cost,
        total_hpp: result.total_hpp,
        cost_per_unit: result.cost_per_unit,
        wac_adjustment: result.wac_adjustment,
        production_quantity: result.production_quantity,
        notes: `Auto-calculated HPP for ${result.production_quantity} servings`
      }

      const { error } = await this.context.supabase
        .from('hpp_calculations')
        .insert(calculationData)

      if (error) {
        throw new Error(`Failed to save HPP calculation: ${error.message}`)
      }

      // Update recipe with latest cost
      await this.context.supabase
        .from('recipes')
        .update({ cost_per_unit: result.cost_per_unit })
        .eq('id', result.recipe_id)
        .eq('user_id', this.context.userId)

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
    recipeId: string
  ): Promise<Row<'hpp_calculations'> | null> {
    try {
      const { data, error } = await this.context.supabase
        .from('hpp_calculations')
        .select()
        .eq('recipe_id', recipeId)
        .eq('user_id', this.context.userId)
        .order('calculation_date', { ascending: false })
        .limit(1)
        .single()

      if (error && error['code'] !== 'PGRST116') {
        throw new Error(`Failed to fetch latest HPP: ${error.message}`)
      }

      return data ?? null

    } catch (error: unknown) {
      this.logger.error({ error, recipeId }, 'Failed to get latest HPP')
      throw error
    }
  }
}
