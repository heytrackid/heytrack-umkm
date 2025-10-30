import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'
import { isRecipe, isHppCalculation, isArrayOf, safeNumber, getErrorMessage } from '@/lib/type-guards'

type Recipe = Database['public']['Tables']['recipes']['Row']
type HppCalculation = Database['public']['Tables']['hpp_calculations']['Row']
type HppAlert = Database['public']['Tables']['hpp_alerts']['Row']

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all recipes with HPP calculations
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, name, selling_price, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (recipesError) throw recipesError

    // Get latest HPP calculations
    const { data: hppCalculations, error: hppError } = await supabase
      .from('hpp_calculations')
      .select('recipe_id, hpp_value, margin_percentage, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (hppError) throw hppError

    // Get HPP alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('hpp_alerts')
      .select('id, recipe_id, alert_type, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (alertsError) throw alertsError

    // Calculate metrics
    const totalRecipes = recipes?.length || 0
    
    // Get unique recipes with HPP
    const recipesWithHppSet = new Set(hppCalculations?.map(calc => calc.recipe_id) || [])
    const recipesWithHpp = recipesWithHppSet.size

    // Calculate average HPP
    const validHppValues = hppCalculations?.filter(calc => calc.hpp_value && calc.hpp_value > 0) || []
    const averageHpp = validHppValues.length > 0
      ? validHppValues.reduce((sum, calc) => sum + (calc.hpp_value || 0), 0) / validHppValues.length
      : 0

    // Calculate average margin
    const validMargins = hppCalculations?.filter(calc => calc.margin_percentage !== null) || []
    const averageMargin = validMargins.length > 0
      ? validMargins.reduce((sum, calc) => sum + (calc.margin_percentage || 0), 0) / validMargins.length
      : 0

    // Count alerts
    const totalAlerts = alerts?.length || 0
    const unreadAlerts = alerts?.filter(alert => !alert.is_read).length || 0

    // Get top recipes by margin
    const recipeHppMap = new Map<string, HppCalculation>()
    hppCalculations?.forEach(calc => {
      if (!recipeHppMap.has(calc.recipe_id)) {
        recipeHppMap.set(calc.recipe_id, calc)
      }
    })

    const topRecipes = recipes
      ?.map(recipe => {
        const hppCalc = recipeHppMap.get(recipe.id)
        return {
          id: recipe.id,
          name: recipe.name,
          hpp_value: hppCalc?.hpp_value || 0,
          margin_percentage: hppCalc?.margin_percentage || 0,
          last_updated: hppCalc?.updated_at || recipe.updated_at || ''
        }
      })
      .filter(r => r.hpp_value > 0)
      .sort((a, b) => (b.margin_percentage || 0) - (a.margin_percentage || 0))
      .slice(0, 3) || []

    // Get recent changes (from alerts)
    const recentChanges = alerts
      ?.filter(alert => alert.alert_type === 'PRICE_INCREASE' || alert.alert_type === 'PRICE_DECREASE')
      .slice(0, 3)
      .map(alert => {
        const recipe = recipes?.find(r => r.id === alert.recipe_id)
        return {
          recipe_id: alert.recipe_id,
          recipe_name: recipe?.name || 'Unknown Recipe',
          change_percentage: 10, // Placeholder - would need to calculate from alert data
          direction: alert.alert_type === 'PRICE_INCREASE' ? 'increase' as const : 'decrease' as const
        }
      }) || []

    return NextResponse.json({
      totalRecipes,
      recipesWithHpp,
      averageHpp: Math.round(averageHpp),
      averageMargin: Math.round(averageMargin * 10) / 10,
      totalAlerts,
      unreadAlerts,
      topRecipes,
      recentChanges
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error fetching HPP dashboard summary')
    return NextResponse.json(
      { error: 'Failed to fetch HPP summary' },
      { status: 500 }
    )
  }
}
