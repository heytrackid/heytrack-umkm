import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

interface HppCalculationSummary {
  recipe_id: string | null
  total_hpp: number
  created_at: string | null
}

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

    if (recipesError) {throw recipesError}

    // Get latest HPP calculations
    const { data: hppCalculations, error: hppError } = await supabase
      .from('hpp_calculations')
      .select('recipe_id, total_hpp, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (hppError) {throw hppError}

    // Get HPP alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('hpp_alerts')
      .select('id, recipe_id, alert_type, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (alertsError) {throw alertsError}

    // Calculate metrics
    const totalRecipes = recipes?.length || 0
    
    // Get unique recipes with HPP
    const recipesWithHppSet = new Set(hppCalculations?.map(calc => calc.recipe_id) || [])
    const recipesWithHpp = recipesWithHppSet.size

    // Calculate average HPP
    const validHppValues = hppCalculations?.filter(calc => calc.total_hpp && calc.total_hpp > 0) || []
    const averageHpp = validHppValues.length > 0
      ? validHppValues.reduce((sum, calc) => sum + (calc.total_hpp || 0), 0) / validHppValues.length
      : 0

    // Count alerts
    const totalAlerts = alerts?.length || 0
    const unreadAlerts = alerts?.filter(alert => !alert.is_read).length || 0

    // Get top recipes by margin - create map first
    const recipeHppMap = new Map<string, HppCalculationSummary>()
    hppCalculations?.forEach(calc => {
      if (calc.recipe_id && !recipeHppMap.has(calc.recipe_id)) {
        recipeHppMap.set(calc.recipe_id, calc)
      }
    })

    // Calculate average margin from recipes (since margin is calculated from selling price vs hpp)
    const recipesWithMargin = recipes?.filter(recipe => recipe.selling_price && recipe.selling_price > 0) || []
    const averageMargin = recipesWithMargin.length > 0
      ? recipesWithMargin.reduce((sum, recipe) => {
          const hppCalc = recipeHppMap.get(recipe.id)
          const hpp = hppCalc?.total_hpp ?? 0
          const sellingPrice = recipe.selling_price ?? 0
          const margin = sellingPrice > 0 ? ((sellingPrice - hpp) / sellingPrice) * 100 : 0
          return sum + margin
        }, 0) / recipesWithMargin.length
      : 0

    const topRecipes = recipes
      ?.map(recipe => {
        const hppCalc = recipeHppMap.get(recipe.id)
        const hpp = hppCalc?.total_hpp ?? 0
        const sellingPrice = recipe.selling_price ?? 0
        const margin = sellingPrice > 0 ? ((sellingPrice - hpp) / sellingPrice) * 100 : 0
        
        return {
          id: recipe.id,
          name: recipe.name,
          hpp_value: hpp,
          margin_percentage: margin,
          last_updated: hppCalc?.created_at ?? ''
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
          recipe_name: recipe?.name ?? 'Unknown Recipe',
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
