import type { SupabaseClient } from '@supabase/supabase-js'
import { apiLogger } from '@/lib/logger'
import { AIService } from '@/lib/ai/service'
import { HppCalculatorService } from './HppCalculatorService'
import { typed } from '@/types/type-utilities'
import type { Database } from '@/types/database'
import type { HppOverview, HppComparison } from '@/modules/hpp/types'



export interface HppCalculationResult {
  id: string
  recipe_id: string
  recipe_name: string
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
  created_at: string
}



export class HppService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async calculateRecipeHpp(recipeId: string, userId: string): Promise<HppCalculationResult> {
    const hppCalculator = new HppCalculatorService()
    const calculation = await hppCalculator.calculateRecipeHpp(typed(this.supabase), recipeId, userId)

    // Save calculation to database
    const { data, error } = await this.supabase
      .from('hpp_calculations')
      .insert({
        recipe_id: recipeId,
        material_cost: calculation.material_cost,
        labor_cost: calculation.labor_cost,
        overhead_cost: calculation.overhead_cost,
        total_hpp: calculation.total_hpp,
        cost_per_unit: calculation.cost_per_unit,
        production_quantity: calculation.production_quantity,
        wac_adjustment: calculation.wac_adjustment,
        user_id: userId
      })
      .select(`
        id,
        recipe_id,
        recipes (
          name
        ),
        material_cost,
        operational_cost,
        total_hpp,
        cost_per_unit,
        created_at
      `)
      .single()

    if (error) {
      apiLogger.error({ error, recipeId, userId }, 'Failed to save HPP calculation')
      throw error
    }

    const typedData = data as unknown
    return {
      id: (typedData as Record<string, unknown>)['id'] as string,
      recipe_id: (typedData as Record<string, unknown>)['recipe_id'] as string,
      recipe_name: ((typedData as Record<string, unknown>)['recipes'] as Record<string, unknown>)?.['name'] as string || 'Unknown Recipe',
      material_cost: calculation.material_cost,
      labor_cost: calculation.labor_cost,
      overhead_cost: calculation.overhead_cost,
      total_hpp: calculation.total_hpp,
      cost_per_unit: calculation.cost_per_unit,
      wac_adjustment: calculation.wac_adjustment,
      production_quantity: calculation.production_quantity,
      material_breakdown: calculation.material_breakdown,
      created_at: (typedData as Record<string, unknown>)['created_at'] as string
    }
  }

  async batchCalculateHpp(userId: string): Promise<HppCalculationResult[]> {
    // Get all active recipes for the user
    const { data: recipes, error: recipesError } = await this.supabase
      .from('recipes')
      .select('id')
      .eq('is_active', true)
      .eq('user_id', userId)

    if (recipesError) {
      apiLogger.error({ error: recipesError, userId }, 'Failed to fetch recipes for batch calculation')
      throw recipesError
    }

    if (!recipes || recipes.length === 0) {
      return []
    }

    const results: HppCalculationResult[] = []

    for (const recipe of recipes) {
      try {
        const calculation = await this.calculateRecipeHpp(recipe.id, userId)
        results.push(calculation)
    } catch (error) {
      apiLogger.error({ error, userId }, 'Failed to fetch recipe for pricing recommendation')
      throw error
    }
    }

    return results
  }

  async getCalculations(
    userId: string,
    filters: {
      page?: number
      limit?: number
      recipe_id?: string
      start_date?: string
      end_date?: string
    } = {}
  ): Promise<{
    data: HppCalculationResult[]
    total: number
    page: number
    limit: number
  }> {
    const { page = 1, limit = 50, recipe_id, start_date, end_date } = filters

    let query = this.supabase
      .from('hpp_calculations')
      .select(`
        id,
        recipe_id,
        recipes (
          name
        ),
        material_cost,
        operational_cost,
        total_hpp,
        cost_per_unit,
        created_at
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (recipe_id) {
      query = query.eq('recipe_id', recipe_id)
    }

    if (start_date) {
      query = query.gte('created_at', start_date)
    }

    if (end_date) {
      query = query.lte('created_at', end_date)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      apiLogger.error({ error, userId, filters }, 'Failed to fetch HPP calculations')
      throw error
    }

    // For getCalculations, we return results from database
    const results: HppCalculationResult[] = (data || []).map((item: unknown) => ({
      id: (item as Record<string, unknown>)['id'] as string,
      recipe_id: (item as Record<string, unknown>)['recipe_id'] as string,
      recipe_name: ((item as Record<string, unknown>)['recipes'] as Record<string, unknown>)?.['name'] as string || 'Unknown Recipe',
      material_cost: (item as Record<string, unknown>)['material_cost'] as number,
      labor_cost: (item as Record<string, unknown>)['labor_cost'] as number,
      overhead_cost: (item as Record<string, unknown>)['overhead_cost'] as number,
      total_hpp: (item as Record<string, unknown>)['total_hpp'] as number,
      cost_per_unit: (item as Record<string, unknown>)['cost_per_unit'] as number,
      wac_adjustment: (item as Record<string, unknown>)['wac_adjustment'] as number,
      production_quantity: (item as Record<string, unknown>)['production_quantity'] as number,
      material_breakdown: [], // Historical data doesn't include breakdown
      created_at: (item as Record<string, unknown>)['created_at'] as string
    }))

    return {
      data: results,
      total: count || 0,
      page,
      limit
    }
  }

  async getComparison(userId: string): Promise<HppComparison> {
    const { data, error } = await this.supabase
      .from('recipes')
      .select(`
        id,
        name,
        cost_per_unit,
        selling_price,
        margin_percentage,
        hpp_calculations (
          created_at
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('margin_percentage', { ascending: false, nullsFirst: false })

    if (error) {
      apiLogger.error({ error, userId }, 'Failed to fetch recipe comparison')
      throw error
    }

    const recipes = (data || []).map((recipe: Record<string, unknown>) => {
      const hppCalculations = recipe['hpp_calculations'] as Array<Record<string, unknown>> | null
      const lastCalculated = hppCalculations && hppCalculations.length > 0
        ? hppCalculations[0]?.['created_at'] as string
        : null

      return {
        id: recipe['id'] as string,
        name: recipe['name'] as string,
        cost_per_unit: recipe['cost_per_unit'] as number,
        selling_price: recipe['selling_price'] as number,
        margin_percentage: recipe['margin_percentage'] as number,
        last_calculated: lastCalculated
      }
    })

    return recipes
  }

  async getOverview(userId: string): Promise<HppOverview> {
    // Get recipe counts
    const { data: recipeStats, error: recipeError } = await this.supabase
      .from('recipes')
      .select('id, cost_per_unit, selling_price, margin_percentage', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (recipeError) {
      apiLogger.error({ error: recipeError, userId }, 'Failed to fetch recipe stats for overview')
      throw recipeError
    }

    const totalRecipes = recipeStats?.length || 0
    const calculatedRecipes = recipeStats?.filter(r => r.cost_per_unit !== null).length || 0
    const totalHppValue = recipeStats?.reduce((sum, r) => sum + (r.cost_per_unit || 0), 0) || 0
    const averageMargin = calculatedRecipes > 0
      ? recipeStats?.reduce((sum, r) => sum + (r.margin_percentage || 0), 0) / calculatedRecipes
      : 0

    // Generate alerts
    const alerts: HppOverview['alerts'] = []

    recipeStats?.forEach((recipe: Record<string, unknown>) => {
      if (!recipe['cost_per_unit']) {
        alerts.push({
          recipe_id: recipe['id'] as string,
          recipe_name: recipe['name'] as string,
          issue: 'Belum dihitung HPP',
          severity: 'medium'
        })
      } else if ((recipe['margin_percentage'] as number || 0) < 20) {
        alerts.push({
          recipe_id: recipe['id'] as string,
          recipe_name: recipe['name'] as string,
          issue: `Margin rendah (${(recipe['margin_percentage'] as number)?.toFixed(1)}%)`,
          severity: 'low'
        })
      }

      if ((recipe['total_sold'] as number || 0) === 0) {
        alerts.push({
          recipe_id: recipe['id'] as string,
          recipe_name: recipe['name'] as string,
          issue: 'Belum pernah terjual',
          severity: 'low'
        })
      }

      if ((recipe['total_revenue'] as number || 0) === 0) {
        alerts.push({
          recipe_id: recipe['id'] as string,
          recipe_name: recipe['name'] as string,
          issue: 'Belum ada pendapatan',
          severity: 'low'
        })
      }
    })

    return {
      totalRecipes,
      calculatedRecipes,
      totalHppValue,
      averageMargin,
      alerts
    }
  }

  async generatePricingRecommendation(
    userId: string,
    recipeId: string
  ): Promise<{
    current_price: number
    recommended_price: number
    hpp_cost: number
    suggested_margin: number
    reasoning: string[]
    ai_insights?: {
      confidence: number
      alternatives: Array<{
        price: number
        margin: number
        rationale: string
      }>
    } | undefined
  }> {
    // Get recipe with ingredients and latest HPP calculation
    const { data, error } = await this.supabase
      .from('recipes')
      .select(`
        id,
        name,
        category,
        selling_price,
        recipe_ingredients (
          quantity,
          ingredients (
            name,
            category,
            price_per_unit
          )
        ),
        hpp_calculations (
          cost_per_unit,
          created_at
        )
      `)
      .eq('id', recipeId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      apiLogger.error({ error, recipeId, userId }, 'Failed to fetch recipe for pricing recommendation')
      throw new Error('Recipe not found')
    }

    const recipe = data as Record<string, unknown>
    const latestHpp = ((recipe['hpp_calculations'] as Record<string, unknown>[])?.[0] as Record<string, unknown>)?.['cost_per_unit'] as number

    if (!latestHpp) {
      throw new Error('No HPP calculation found for this recipe')
    }

    const currentPrice = recipe['selling_price'] as number || 0
    const recipeName = recipe['name'] as string
    const category = recipe['category'] as string || 'General'

    // Prepare ingredient data for AI
    const ingredients = ((recipe['recipe_ingredients'] as Record<string, unknown>[]) || []).map((ri: Record<string, unknown>) => {
      const ingredient = ri['ingredients'] as Record<string, unknown>
      const quantity = ri['quantity'] as number || 0
      const unitPrice = ingredient?.['price_per_unit'] as number || 0

      return {
        name: ingredient?.['name'] as string || 'Unknown',
        cost: quantity * unitPrice,
        category: ingredient?.['category'] as string || 'Unknown'
      }
    })

    // Get AI-powered recommendation
    let aiRecommendation = null
    try {
      aiRecommendation = await AIService.generatePricingRecommendation({
        recipeName,
        currentHpp: latestHpp,
        currentPrice,
        currentMargin: currentPrice > 0 ? ((currentPrice - latestHpp) / latestHpp) * 100 : 0,
        category,
        ingredients
      })
    } catch (aiError) {
      apiLogger.warn({ aiError, recipeId }, 'AI pricing recommendation failed, using fallback')
    }

    // Use AI recommendation or fallback to simple calculation
    const recommendedPrice = aiRecommendation?.recommendedPrice || (latestHpp * 1.35) // 35% margin fallback
    const suggestedMargin = aiRecommendation ?
      ((recommendedPrice - latestHpp) / latestHpp) * 100 :
      35

    const reasoning: string[] = []

    if (currentPrice === 0) {
      reasoning.push('Harga jual belum ditentukan')
    } else if (currentPrice < latestHpp) {
      reasoning.push(`Harga jual saat ini (${currentPrice.toLocaleString('id-ID')}) di bawah HPP (${latestHpp.toLocaleString('id-ID')})`)
    } else {
      const currentMargin = ((currentPrice - latestHpp) / latestHpp) * 100
      if (currentMargin < 20) {
        reasoning.push(`Margin saat ini rendah: ${currentMargin.toFixed(1)}%`)
      } else if (currentMargin > 50) {
        reasoning.push(`Margin saat ini tinggi: ${currentMargin.toFixed(1)}%`)
      }
    }

    reasoning.push(`HPP terbaru: ${latestHpp.toLocaleString('id-ID')} per porsi`)

    if (aiRecommendation) {
      reasoning.push(`AI Confidence: ${aiRecommendation.confidence}%`)
      reasoning.push(...aiRecommendation.reasoning)
    } else {
      reasoning.push(`Rekomendasi margin: ${suggestedMargin.toFixed(1)}%`)
      reasoning.push(`Harga rekomendasi: ${recommendedPrice.toLocaleString('id-ID')}`)
    }

    return {
      current_price: currentPrice,
      recommended_price: recommendedPrice,
      hpp_cost: latestHpp,
      suggested_margin: suggestedMargin,
      reasoning,
      ai_insights: aiRecommendation ? {
        confidence: aiRecommendation.confidence,
        alternatives: aiRecommendation.alternatives
      } : undefined
    }
  }
}