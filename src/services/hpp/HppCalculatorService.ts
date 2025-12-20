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


export interface HppCalculationResult {
  recipe_id: string // Use snake_case for consistency with DB
  material_cost: number
  labor_cost: number
  overhead_cost: number
  packaging_cost: number
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
                waste_factor,
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

      // Calculate material costs (per batch) using WAC (Weighted Average Cost)
      // WAC provides more accurate costing by considering historical purchase prices
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
        const validIngredient = ingredient as { 
          id: string
          name: string
          price_per_unit: number | null
          weighted_average_cost: number | null
          unit: string
          waste_factor?: number | null
        }

        const quantity = Number(ri.quantity ?? 0)
        
        // FIXED: Use WAC if available, fallback to current price
        // WAC is more accurate for costing as it considers historical purchase prices
        const unit_price = Number(
          validIngredient.weighted_average_cost ?? 
          validIngredient.price_per_unit ?? 
          0
        )
        
        // Validate inputs - skip invalid ingredients
        if (quantity <= 0) {
          this.logger.warn({ ingredient_id: ri.ingredient_id, quantity }, 'Skipping ingredient with invalid quantity')
          continue
        }
        
        if (unit_price < 0) {
          this.logger.warn({ ingredient_id: ri.ingredient_id, unit_price }, 'Skipping ingredient with negative price')
          continue
        }
        
        if (unit_price === 0) {
          this.logger.warn({ ingredient_id: ri.ingredient_id }, 'Ingredient has zero price - using for breakdown but no cost impact')
        }
        
        // Apply waste factor (default 1.0 = no waste, 1.05 = 5% waste)
        // FIXED: Waste factor should increase quantity needed, not multiply total cost
        const waste_factor = Math.round((Number(validIngredient.waste_factor ?? 1.0)) * 1000) / 1000 // Round to 3 decimal places
        const effective_quantity = Math.round((quantity * waste_factor) * 1000) / 1000 // Round to 3 decimal places
        const total_cost = Math.round((effective_quantity * unit_price) * 100) / 100 // Round to 2 decimal places for currency

        // Enforce unit consistency: recipe ingredient quantity follows ingredient.unit
        const ingredientUnit = validIngredient.unit
        if (ri.unit && ri.unit !== ingredientUnit) {
          this.logger.warn({
            recipeId,
            ingredient_id: ri.ingredient_id,
            recipeIngredientUnit: ri.unit,
            ingredientUnit
          }, 'Recipe ingredient unit differs from ingredient unit; using ingredient unit for HPP calculation')
        }

        material_breakdown.push({
          ingredient_id: validIngredient['id'],
          ingredient_name: validIngredient.name,
          quantity: effective_quantity, // Show actual quantity used (including waste)
          unit: ingredientUnit,
          unit_price,
          total_cost
        })

        total_material_cost += total_cost
      }

          // FIXED: Add division by zero protection
          const material_cost_per_unit = servings > 0 ? total_material_cost / servings : 0

          // Calculate labor cost (per unit) from recent productions
          const labor_cost_per_unit = await this.calculateLaborCost(recipeId)

          // Calculate overhead cost (per unit) with production-based allocation
          const overhead_cost_per_unit = await this.calculateOverheadCost(recipeId)

          // Calculate packaging cost (per unit) from recipe data
          // packaging_cost_per_unit is stored per serving in the recipe
          const packaging_cost_per_unit = Number((recipeData as unknown as { packaging_cost_per_unit?: number }).packaging_cost_per_unit ?? 0)

      // Final per-unit and per-batch totals
      // FIXED: WAC adjustment is for TRACKING ONLY, not added to actual cost
      // HPP = Material Cost + Labor Cost + Overhead Cost + Packaging Cost
      const cost_per_unit = Math.round((
        material_cost_per_unit + labor_cost_per_unit + overhead_cost_per_unit + packaging_cost_per_unit
      ) * 100) / 100 // Round to 2 decimal places
      
      // Validate cost_per_unit
      if (cost_per_unit < 0) {
        this.logger.warn({ recipeId, cost_per_unit }, 'Negative cost_per_unit detected, clamping to 0')
      }
      if (isNaN(cost_per_unit)) {
        throw new Error(`Invalid cost_per_unit (NaN) for recipe ${recipeId}`)
      }
      if (!isFinite(cost_per_unit)) {
        throw new Error(`Invalid cost_per_unit (infinite) for recipe ${recipeId}`)
      }

      const total_hpp = Math.round((cost_per_unit * servings) * 100) / 100 // Round to 2 decimal places

      // Convert per-unit components back to per-batch totals for persistence
      const labor_cost = Math.round((labor_cost_per_unit * servings) * 100) / 100
      const overhead_cost = Math.round((overhead_cost_per_unit * servings) * 100) / 100
      const packaging_cost = Math.round((packaging_cost_per_unit * servings) * 100) / 100

      const result: HppCalculationResult = {
        recipe_id: recipeId,
        material_cost: total_material_cost,
        labor_cost,
        overhead_cost,
        packaging_cost,
        total_hpp: Math.max(0, total_hpp), // Ensure non-negative
        cost_per_unit: Math.max(0, cost_per_unit), // Ensure non-negative
        wac_adjustment: 0, // No longer used - set to 0
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

        // FIXED: Accept labor_cost = 0 as valid (volunteer/free labor)
        if (totalQuantity > 0) {
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

        // FIXED: Accept labor_cost = 0 as valid (volunteer/free labor)
        if (totalQuantity > 0) {
          const laborCostPerUnit = totalLaborCost / totalQuantity
          this.logger.debug({ recipeId, laborCostPerUnit, source: 'all_productions' }, 'Labor cost calculated from all productions')
          return laborCostPerUnit
        }
      }

      // Step 3: Calculate from operational costs (labor category)
      const { data: laborCosts, error: laborError } = await this.context.supabase
        .from('operational_costs')
        .select('amount, frequency')
        .eq('user_id', this.context.userId)
        .eq('is_active', true)
        .ilike('category', '%labor%')

      if (!laborError && laborCosts && laborCosts.length > 0) {
        // FIXED: Convert all labor costs to monthly basis before summing
        const monthlyLaborCosts = laborCosts.map(cost => {
          const amount = Number(cost.amount ?? 0)
          const frequency = cost.frequency ?? 'MONTHLY'

          // Convert to monthly equivalent
          switch (frequency.toUpperCase()) {
            case 'YEARLY':
              return amount / 12 // Yearly cost divided by 12 months
            case 'QUARTERLY':
              return amount / 3 // Quarterly cost divided by 3 months
            case 'MONTHLY':
              return amount // Already monthly
            case 'ONE_TIME':
              // One-time costs: amortize over 12 months (1 year assumption)
              return amount / 12
            default:
              return amount // Default to monthly
          }
        })

        const totalMonthlyLaborCost = monthlyLaborCosts.reduce((sum, cost) => sum + cost, 0)

        // FIXED: Try recent productions first (30 days), then all productions if no recent data
        let totalVolume = 0
        
        // Try recent productions (30 days)
        const { data: recentProductions } = await this.context.supabase
          .from('productions')
          .select('actual_quantity')
          .eq('user_id', this.context.userId)
          .eq('status', 'COMPLETED')
          .gte('actual_end_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        totalVolume = (recentProductions ?? []).reduce(
          (sum, p) => sum + Number(p.actual_quantity ?? 0),
          0
        )

        // If no recent production, try all completed productions
        if (totalVolume === 0) {
          const { data: allProductions } = await this.context.supabase
            .from('productions')
            .select('actual_quantity')
            .eq('user_id', this.context.userId)
            .eq('status', 'COMPLETED')
            .limit(1000)

          totalVolume = (allProductions ?? []).reduce(
            (sum, p) => sum + Number(p.actual_quantity ?? 0),
            0
          )
        }

        if (totalVolume > 0 && totalMonthlyLaborCost > 0) {
          const laborCostPerUnit = totalMonthlyLaborCost / totalVolume
          this.logger.debug({
            recipeId,
            totalMonthlyLaborCost,
            totalVolume,
            laborCostPerUnit,
            source: 'operational_costs_monthly'
          }, 'Labor cost calculated from operational costs (frequency-adjusted)')
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
      // FIXED: Get active operational costs with frequency information
      const { data: operationalCosts, error } = await this.context.supabase
        .from('operational_costs')
        .select('amount, category, frequency')
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
      // FIXED: More comprehensive labor keyword detection to prevent double counting
      const laborKeywords = ['labor', 'labour', 'tenaga kerja', 'gaji', 'upah', 'salary', 'wage', 'pegawai', 'karyawan']
      const nonLaborCosts = operationalCosts.filter(
        cost => {
          const category = cost.category?.toLowerCase() ?? ''
          return !laborKeywords.some(keyword => category.includes(keyword))
        }
      )

      // FIXED: Convert all overhead costs to monthly basis before summing
      const monthlyOverheadCosts = nonLaborCosts.map(cost => {
        const amount = Number(cost.amount ?? 0)
        const frequency = cost.frequency ?? 'MONTHLY'

        // Convert to monthly equivalent
        switch (frequency.toUpperCase()) {
          case 'YEARLY':
            return amount / 12 // Yearly cost divided by 12 months
          case 'QUARTERLY':
            return amount / 3 // Quarterly cost divided by 3 months
          case 'MONTHLY':
            return amount // Already monthly
          case 'ONE_TIME':
            // One-time costs: amortize over 12 months (1 year assumption)
            return amount / 12
          default:
            return amount // Default to monthly
        }
      })

      const totalMonthlyOverhead = monthlyOverheadCosts.reduce(
        (sum, cost) => sum + cost,
        0
      )

      if (totalMonthlyOverhead === 0) {
        return 0 // No overhead costs
      }

      // Get production volume for this recipe (last 90 days for seasonal consideration)
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const { data: recipeProductions } = await this.context.supabase
        .from('productions')
        .select('actual_quantity')
        .eq('recipe_id', recipeId)
        .eq('user_id', this.context.userId)
        .eq('status', 'COMPLETED')
        .gte('actual_end_time', ninetyDaysAgo.toISOString())

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
        .gte('actual_end_time', ninetyDaysAgo.toISOString())

      const totalVolume = (allProductions ?? []).reduce(
        (sum: number, p: { actual_quantity: number | null }) => sum + Number(p.actual_quantity ?? 0),
        0
      )

      // Case 1: Recipe has production history - allocate based on volume ratio
      if (totalVolume > 0 && recipeVolume > 0) {
        // Volume-based allocation: each unit gets equal share of total overhead
        // overheadPerUnit = totalMonthlyOverhead / totalVolume (fair allocation per unit)
        const overheadPerUnit = totalMonthlyOverhead / totalVolume
        
        this.logger.debug({
          recipeId,
          totalMonthlyOverhead,
          recipeVolume,
          totalVolume,
          overheadPerUnit,
          source: 'volume_based'
        }, 'Overhead calculated based on production volume (frequency-adjusted)')
        
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
      // Then divide by THIS recipe's servings (not average)
      const overheadPerRecipe = totalMonthlyOverhead / activeRecipeCount

      // FIXED: Get this recipe's servings instead of using average
      const { data: thisRecipe } = await this.context.supabase
        .from('recipes')
        .select('servings')
        .eq('id', recipeId)
        .eq('user_id', this.context.userId)
        .single()

      const recipeServings = thisRecipe?.servings ?? 10 // Default to 10 if not found

      const overheadPerUnit = overheadPerRecipe / recipeServings

      this.logger.debug({
        recipeId,
        totalMonthlyOverhead,
        activeRecipeCount,
        recipeServings,
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
        // TODO: Remove 'as any' after running migrations and regenerating types
        ...(result.packaging_cost && { packaging_cost: result.packaging_cost } as unknown as Insert<'hpp_calculations'>),
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
