import 'server-only'
import { dbLogger } from '@/lib/logger'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import type { Database } from '@/types/supabase-generated'

type ServiceSupabaseClient = ReturnType<typeof createServiceRoleClient>

type HppCalculationResult = {
  totalHpp: number
  materialCost: number
  laborCost: number
  overheadCost: number
  wacAdjustment?: number
  materialBreakdown?: Record<string, number>
}

/**
 * Service for automating HPP snapshot creation
 * SERVER-ONLY: Uses service role client for automated tasks
 */
export class HppSnapshotAutomation {
  private logger = dbLogger

  /**
   * Create HPP snapshot for a recipe
   */
  async createSnapshot(recipeId: string, userId: string): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      // Calculate current HPP (simplified - you may need to implement proper calculation)
      const hppResult = await this.calculateRecipeHpp(supabase, recipeId, userId)

      // Get previous snapshot for comparison
      const { data: previousSnapshot } = await supabase
        .from('hpp_snapshots')
        .select('hpp_value')
        .eq('recipe_id', recipeId)
        .eq('user_id', userId)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .maybeSingle<{ hpp_value: number | null }>()

      const previousHpp = previousSnapshot?.hpp_value || 0
      const changePercentage = previousHpp > 0 
        ? ((hppResult.totalHpp - previousHpp) / previousHpp) * 100 
        : 0

      // Get recipe selling price for margin calculation
      const { data: recipe } = await supabase
        .from('recipes')
        .select('selling_price')
        .eq('id', recipeId)
        .maybeSingle<{ selling_price: number | null }>()

      const sellingPrice = recipe?.selling_price || 0
      const marginPercentage = sellingPrice > 0
        ? ((sellingPrice - hppResult.totalHpp) / sellingPrice) * 100
        : 0

      // Create snapshot
      const { error } = await supabase
        .from('hpp_snapshots')
        .insert({
          recipe_id: recipeId,
          user_id: userId,
          snapshot_date: new Date().toISOString(),
          hpp_value: hppResult.totalHpp,
          material_cost: hppResult.materialCost,
          operational_cost: hppResult.laborCost + hppResult.overheadCost,
          cost_breakdown: {
            material: hppResult.materialCost,
            labor: hppResult.laborCost,
            overhead: hppResult.overheadCost,
            wac_adjustment: hppResult.wacAdjustment || 0
          },
          material_cost_breakdown: hppResult.materialBreakdown || {},
          selling_price: sellingPrice,
          margin_percentage: marginPercentage,
          previous_hpp: previousHpp,
          change_percentage: changePercentage
        })

      if (error) {
        throw new Error(`Failed to create HPP snapshot: ${error.message}`)
      }

      this.logger.info({ 
        recipeId, 
        hpp: hppResult.totalHpp,
        change: changePercentage 
      }, 'HPP snapshot created')

      // Check if alert should be created
      await this.checkAndCreateAlert(recipeId, userId, hppResult.totalHpp, previousHpp, changePercentage, marginPercentage)

    } catch (err: unknown) {
      this.logger.error({ error: err, recipeId }, 'Failed to create HPP snapshot')
      throw err
    }
  }

  /**
   * Create HPP snapshots for all active recipes
   */
  async createSnapshotsForAllRecipes(userId: string): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .returns<Array<Pick<Database['public']['Tables']['recipes']['Row'], 'id'>>>()

      if (error) {
        throw new Error(`Failed to fetch recipes: ${error.message}`)
      }

      if (!recipes || recipes.length === 0) {
        this.logger.info({ userId }, 'No active recipes found for snapshot')
        return
      }

      this.logger.info({ userId, count: recipes.length }, 'Creating HPP snapshots for all recipes')

      // Create snapshots in parallel (with limit to avoid overwhelming the system)
      const batchSize = 5
      for (let i = 0; i < recipes.length; i += batchSize) {
        const batch = recipes.slice(i, i + batchSize)
        await Promise.all(
          batch.map(recipe => 
            this.createSnapshot(recipe.id, userId).catch(err => {
              this.logger.error({ error: err, recipeId: recipe.id }, 'Failed to create snapshot for recipe')
            })
          )
        )
      }

      this.logger.info({ userId, count: recipes.length }, 'Completed HPP snapshots for all recipes')

    } catch (err: unknown) {
      this.logger.error({ error: err, userId }, 'Failed to create snapshots for all recipes')
      throw err
    }
  }

  /**
   * Check if alert should be created based on HPP changes
   */
  private async checkAndCreateAlert(
    recipeId: string,
    userId: string,
    currentHpp: number,
    previousHpp: number,
    changePercentage: number,
    marginPercentage: number
  ): Promise<void> {
    try {
      const alerts: Array<{
        alert_type: string
        severity: string
        title: string
        message: string
        old_value?: number
        new_value?: number
        change_percentage?: number
        threshold?: number
      }> = []

      // Alert for significant HPP increase (>10%)
      if (changePercentage > 10) {
        alerts.push({
          alert_type: 'hpp_increase',
          severity: changePercentage > 20 ? 'high' : 'medium',
          title: 'HPP Meningkat Signifikan',
          message: `HPP meningkat ${changePercentage.toFixed(1)}% dari Rp ${previousHpp.toLocaleString()} menjadi Rp ${currentHpp.toLocaleString()}`,
          old_value: previousHpp,
          new_value: currentHpp,
          change_percentage: changePercentage,
          threshold: 10
        })
      }

      // Alert for significant HPP decrease (>10%)
      if (changePercentage < -10) {
        alerts.push({
          alert_type: 'hpp_decrease',
          severity: 'low',
          title: 'HPP Menurun Signifikan',
          message: `HPP menurun ${Math.abs(changePercentage).toFixed(1)}% dari Rp ${previousHpp.toLocaleString()} menjadi Rp ${currentHpp.toLocaleString()}`,
          old_value: previousHpp,
          new_value: currentHpp,
          change_percentage: changePercentage,
          threshold: -10
        })
      }

      // Alert for low margin (<20%)
      if (marginPercentage < 20 && marginPercentage > 0) {
        alerts.push({
          alert_type: 'margin_low',
          severity: marginPercentage < 10 ? 'critical' : 'high',
          title: 'Margin Keuntungan Rendah',
          message: `Margin keuntungan hanya ${marginPercentage.toFixed(1)}%. Pertimbangkan untuk menaikkan harga jual atau menurunkan biaya produksi.`,
          new_value: marginPercentage,
          threshold: 20
        })
      }

      // Insert alerts
      if (alerts.length > 0) {
        const supabase = createServiceRoleClient()
        
        const alertsToInsert = alerts.map(alert => ({
          ...alert,
          recipe_id: recipeId,
          user_id: userId,
          is_read: false,
          is_dismissed: false
        }))

        const { error } = await supabase
          .from('hpp_alerts')
          .insert(alertsToInsert)

        if (error) {
          this.logger.error({ error }, 'Failed to create HPP alerts')
        } else {
          this.logger.info({ recipeId, alertCount: alerts.length }, 'HPP alerts created')
        }
      }

    } catch (err: unknown) {
      this.logger.error({ error: err, recipeId }, 'Failed to check and create alerts')
    }
  }

  /**
   * Trigger snapshot creation when ingredient price changes
   */
  async onIngredientPriceChange(ingredientId: string, userId: string): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      // Find all recipes using this ingredient
      const { data: recipeIngredients, error } = await supabase
        .from('recipe_ingredients')
        .select('recipe_id')
        .eq('ingredient_id', ingredientId)
        .eq('user_id', userId)
        .returns<Array<Pick<Database['public']['Tables']['recipe_ingredients']['Row'], 'recipe_id'>>>()

      if (error || !recipeIngredients || recipeIngredients.length === 0) {
        return
      }

      const recipeIds = [...new Set(recipeIngredients.map(ri => ri.recipe_id))]

      this.logger.info({ 
        ingredientId, 
        affectedRecipes: recipeIds.length 
      }, 'Creating snapshots for recipes affected by ingredient price change')

      // Create snapshots for affected recipes
      for (const recipeId of recipeIds) {
        await this.createSnapshot(recipeId, userId).catch(err => {
          this.logger.error({ error: err, recipeId }, 'Failed to create snapshot after ingredient price change')
        })
      }

    } catch (err: unknown) {
      this.logger.error({ error: err, ingredientId }, 'Failed to handle ingredient price change')
    }
  }

  /**
   * Trigger snapshot creation when recipe ingredients are updated
   */
  async onRecipeIngredientsUpdate(recipeId: string, userId: string): Promise<void> {
    try {
      this.logger.info({ recipeId }, 'Creating snapshot after recipe ingredients update')
      await this.createSnapshot(recipeId, userId)
    } catch (err: unknown) {
      this.logger.error({ error: err, recipeId }, 'Failed to create snapshot after recipe update')
    }
  }

  /**
   * Calculate HPP for a recipe (simplified version)
   * TODO: Implement full HPP calculation logic
   */
  private async calculateRecipeHpp(
    supabase: ServiceSupabaseClient,
    recipeId: string,
    _userId: string
  ): Promise<HppCalculationResult> {
    // Get recipe with ingredients
    const { data: recipe } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          ingredient_id,
          quantity,
          unit,
          ingredient:ingredients (
            price_per_unit,
            weighted_average_cost
          )
        )
      `)
      .eq('id', recipeId)
      .eq('user_id', _userId)
      .single()

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    // Calculate material cost
    let materialCost = 0
    const materialBreakdown: Record<string, number> = {}
    let fallbackIndex = 0

    for (const ri of recipe.recipe_ingredients || []) {
      const ingredient = Array.isArray(ri.ingredient) ? ri.ingredient[0] : ri.ingredient
      if (ingredient) {
        const cost = ri.quantity * (ingredient.weighted_average_cost || ingredient.price_per_unit || 0)
        materialCost += cost
        const ingredientKey = ri.ingredient_id ?? `ingredient-${fallbackIndex++}`
        materialBreakdown[ingredientKey] = cost
      }
    }

    // Simplified operational costs (you may want to implement proper calculation)
    const laborCost = 5000 // Default labor cost
    const overheadCost = 2000 // Default overhead cost

    return {
      totalHpp: materialCost + laborCost + overheadCost,
      materialCost,
      laborCost,
      overheadCost,
      wacAdjustment: 0,
      materialBreakdown
    }
  }
}
