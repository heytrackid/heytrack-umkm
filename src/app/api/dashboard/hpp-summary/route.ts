/**
 * HPP Dashboard Summary API
 * 
 * Provides aggregated HPP data for dashboard widget
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'

export async function GET(__request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get total recipes count
    const { count: totalRecipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (recipesError) {
      throw recipesError
    }

    // Get recipes with HPP calculations
    type HppWithRecipe = {
      recipe_id: string
      total_hpp: number
      cost_per_unit: number
      calculation_date: string | null
      recipes: {
        id: string
        name: string
        selling_price: number | null
        user_id: string
      } | null
    }

    const { data: hppCalculations, error: hppError } = await supabase
      .from('hpp_calculations')
      .select(`
        recipe_id,
        total_hpp,
        cost_per_unit,
        calculation_date,
        recipes!inner (
          id,
          name,
          selling_price,
          user_id
        )
      `)
      .eq('recipes.user_id', user.id)
      .order('calculation_date', { ascending: false }) as { data: HppWithRecipe[] | null, error: unknown }

    if (hppError) {
      throw hppError
    }

    // Get unique recipes with HPP
    const uniqueRecipeIds = new Set(hppCalculations?.map(calc => calc.recipe_id) || [])
    const recipesWithHpp = uniqueRecipeIds.size

    // Calculate average HPP
    const latestHppByRecipe = new Map<string, HppWithRecipe>()
    hppCalculations?.forEach(calc => {
      if (!latestHppByRecipe.has(calc.recipe_id)) {
        latestHppByRecipe.set(calc.recipe_id, calc)
      }
    })

    const hppValues = Array.from(latestHppByRecipe.values())
    const averageHpp = hppValues.length > 0
      ? hppValues.reduce((sum, calc) => sum + (calc.cost_per_unit || 0), 0) / hppValues.length
      : 0

    // Calculate average margin
    const marginsData = hppValues
      .map(calc => {
        const recipe = calc.recipes
        if (!recipe || !recipe.selling_price || recipe.selling_price <= 0) return null
        
        const margin = ((recipe.selling_price - calc.cost_per_unit) / recipe.selling_price) * 100
        return margin
      })
      .filter((m): m is number => m !== null)

    const averageMargin = marginsData.length > 0
      ? marginsData.reduce((sum, m) => sum + m, 0) / marginsData.length
      : 0

    // Get HPP alerts
    type AlertRow = {
      id: string
      is_read: boolean | null
    }

    const { data: alerts, error: alertsError} = await supabase
      .from('hpp_alerts')
      .select('id, is_read')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50) as { data: AlertRow[] | null, error: unknown }

    if (alertsError) {
      throw alertsError
    }

    const totalAlerts = alerts?.length || 0
    const unreadAlerts = alerts?.filter(a => !a.is_read).length || 0

    // Get top recipes by margin
    const topRecipes = hppValues
      .map(calc => {
        const recipe = calc.recipes
        if (!recipe || !recipe.selling_price || recipe.selling_price <= 0) return null

        const margin = ((recipe.selling_price - calc.cost_per_unit) / recipe.selling_price) * 100
        
        return {
          id: recipe.id,
          name: recipe.name,
          hpp_value: calc.cost_per_unit,
          margin_percentage: Math.round(margin * 10) / 10,
          last_updated: calc.calculation_date
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.margin_percentage - a.margin_percentage)
      .slice(0, 3)

    // Get recent HPP changes (compare last 2 calculations per recipe)
    type HppCalcWithRecipe = {
      cost_per_unit: number
      calculation_date: string | null
      recipes: {
        id: string
        name: string
        user_id: string
      } | null
    }

    const recentChanges: Array<{
      recipe_id: string
      recipe_name: string
      change_percentage: number
      direction: 'increase' | 'decrease'
    }> = []

    for (const recipeId of Array.from(uniqueRecipeIds).slice(0, 5)) {
      const { data: calcs } = await supabase
        .from('hpp_calculations')
        .select(`
          cost_per_unit,
          calculation_date,
          recipes!inner (
            id,
            name,
            user_id
          )
        `)
        .eq('recipe_id', recipeId)
        .eq('recipes.user_id', user.id)
        .order('calculation_date', { ascending: false })
        .limit(2) as { data: HppCalcWithRecipe[] | null }

      if (calcs && calcs.length >= 2) {
        const latest = calcs[0]
        const previous = calcs[1]
        
        if (latest && previous && previous.cost_per_unit > 0) {
          const changePercentage = ((latest.cost_per_unit - previous.cost_per_unit) / previous.cost_per_unit) * 100
          
          if (Math.abs(changePercentage) > 1) { // Only show changes > 1%
            recentChanges.push({
              recipe_id: recipeId,
              recipe_name: latest.recipes?.name || 'Unknown',
              change_percentage: Math.round(changePercentage * 10) / 10,
              direction: changePercentage > 0 ? 'increase' : 'decrease'
            })
          }
        }
      }
    }

    const response = {
      totalRecipes: totalRecipes || 0,
      recipesWithHpp,
      averageHpp: Math.round(averageHpp),
      averageMargin: Math.round(averageMargin * 10) / 10,
      totalAlerts,
      unreadAlerts,
      topRecipes,
      recentChanges: recentChanges.slice(0, 3)
    }

    apiLogger.info({ userId: user.id }, 'HPP dashboard summary fetched')

    return NextResponse.json(response)
  } catch (error) {
    apiLogger.error({ error }, 'Failed to fetch HPP dashboard summary')
    return NextResponse.json(
      { error: 'Failed to fetch HPP dashboard summary' },
      { status: 500 }
    )
  }
}
