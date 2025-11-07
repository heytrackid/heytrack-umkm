// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/database'
import { typed } from '@/types/type-utilities'
import { createSecureHandler, SecurityPresets } from '@/utils/security'

import { createClient } from '@/utils/supabase/server'

type TypedSupabaseClient = ReturnType<typeof typed>

type RecipeRow = Database['public']['Tables']['recipes']['Row']
type HppCalculationRow = Database['public']['Tables']['hpp_calculations']['Row']
type AlertRow = Database['public']['Tables']['hpp_alerts']['Row']

interface HppSummaryResponse {
  totalRecipes: number
  recipesWithHpp: number
  averageHpp: number
  averageMargin: number
  totalAlerts: number
  unreadAlerts: number
  hppTrends: Array<{ date: string | null; value: number | null }>
  topRecipes: Array<{
    id: string
    name: string
    hpp_value: number
    margin_percentage: number
    last_updated: string
  }>
  recentChanges: Array<{
    recipe_id: string | null
    recipe_name: string
    change_percentage: number
    direction: 'increase' | 'decrease'
  }>
}

async function getTypedClient(): Promise<TypedSupabaseClient> {
  return typed(await createClient())
}

async function requireUserId(supabase: TypedSupabaseClient): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  return user.id
}

async function fetchRecipes(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<RecipeRow[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, selling_price, is_active')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    throw error
  }
  return data ?? []
}

async function fetchHppCalculations(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<HppCalculationRow[]> {
  const { data, error } = await supabase
    .from('hpp_calculations')
    .select('recipe_id, total_hpp, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }
  return data ?? []
}

async function fetchAlerts(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<AlertRow[]> {
  const { data, error } = await supabase
    .from('hpp_alerts')
    .select('id, recipe_id, alert_type, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }
  return data ?? []
}

function buildHppTrends(calculations: HppCalculationRow[]): Array<{ date: string | null; value: number | null }> {
  return calculations.slice(0, 10).map(calc => ({
    date: calc.created_at,
    value: calc.total_hpp ?? null
  }))
}

function buildRecipeHppMap(calculations: HppCalculationRow[]): Map<string, HppCalculationRow> {
  const map = new Map<string, HppCalculationRow>()
  calculations.forEach(calc => {
    if (calc.recipe_id && !map.has(calc.recipe_id)) {
      map.set(calc.recipe_id, calc)
    }
  })
  return map
}

function calculateAverageHpp(calculations: HppCalculationRow[]): number {
  const valid = calculations.filter(calc => typeof calc.total_hpp === 'number' && (calc.total_hpp ?? 0) > 0)
  if (valid.length === 0) {
    return 0
  }
  const total = valid.reduce((sum, calc) => sum + (calc.total_hpp ?? 0), 0)
  return total / valid.length
}

function calculateAverageMargin(recipes: RecipeRow[], hppMap: Map<string, HppCalculationRow>): number {
  const candidates = recipes.filter(recipe => (recipe.selling_price ?? 0) > 0)
  if (candidates.length === 0) {
    return 0
  }

  const totalMargin = candidates.reduce((sum, recipe) => {
    const calc = recipe.id ? hppMap.get(recipe.id) : undefined
    const hppValue = calc?.total_hpp ?? 0
    const sellingPrice = recipe.selling_price ?? 0
    const margin = sellingPrice > 0 ? ((sellingPrice - hppValue) / sellingPrice) * 100 : 0
    return sum + margin
  }, 0)

  return totalMargin / candidates.length
}

function buildTopRecipes(
  recipes: RecipeRow[],
  hppMap: Map<string, HppCalculationRow>
): Array<{
  id: string
  name: string
  hpp_value: number
  margin_percentage: number
  last_updated: string
}> {
  return recipes
    .map(recipe => {
      const calc = recipe.id ? hppMap.get(recipe.id) : undefined
      const hppValue = calc?.total_hpp ?? 0
      const sellingPrice = recipe.selling_price ?? 0
      const margin = sellingPrice > 0 ? ((sellingPrice - hppValue) / sellingPrice) * 100 : 0

      return {
        id: recipe.id ?? '',
        name: recipe.name ?? 'Unknown Recipe',
        hpp_value: hppValue,
        margin_percentage: margin,
        last_updated: calc?.created_at ?? ''
      }
    })
    .filter(recipe => recipe.id && recipe.hpp_value > 0)
    .sort((a, b) => b.margin_percentage - a.margin_percentage)
    .slice(0, 3)
}

function buildRecentChanges(
  alerts: AlertRow[],
  recipes: RecipeRow[]
): Array<{
  recipe_id: string | null
  recipe_name: string
  change_percentage: number
  direction: 'increase' | 'decrease'
}> {
  return alerts
    .filter(alert => alert.alert_type === 'PRICE_INCREASE' || alert.alert_type === 'PRICE_DECREASE')
    .slice(0, 3)
    .map(alert => {
      const recipe = recipes.find(entry => entry.id === alert.recipe_id)
      return {
        recipe_id: alert.recipe_id,
        recipe_name: recipe?.name ?? 'Unknown Recipe',
        change_percentage: 10,
        direction: alert.alert_type === 'PRICE_INCREASE' ? 'increase' as const : 'decrease' as const
      }
    })
}

function buildResponse(
  recipes: RecipeRow[],
  calculations: HppCalculationRow[],
  alerts: AlertRow[]
): HppSummaryResponse {
  const hppMap = buildRecipeHppMap(calculations)
  const recipesWithHpp = new Set(calculations.map(calc => calc.recipe_id).filter(Boolean)).size
  const unreadAlerts = alerts.filter(alert => !alert.is_read).length

  return {
    totalRecipes: recipes.length,
    recipesWithHpp,
    averageHpp: Math.round(calculateAverageHpp(calculations)),
    averageMargin: Math.round(calculateAverageMargin(recipes, hppMap) * 10) / 10,
    totalAlerts: alerts.length,
    unreadAlerts,
    hppTrends: buildHppTrends(calculations),
    topRecipes: buildTopRecipes(recipes, hppMap),
    recentChanges: buildRecentChanges(alerts, recipes)
  }
}

async function getHandler(): Promise<NextResponse> {
  try {
    const supabase = await getTypedClient()
    const userId = await requireUserId(supabase)

    const [recipes, hppCalculations, alerts] = await Promise.all([
      fetchRecipes(supabase, userId),
      fetchHppCalculations(supabase, userId),
      fetchAlerts(supabase, userId)
    ])

    return NextResponse.json(buildResponse(recipes, hppCalculations, alerts))
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error fetching HPP dashboard summary')
    return NextResponse.json({ error: 'Failed to fetch HPP summary' }, { status: 500 })
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/dashboard/hpp-summary', SecurityPresets.enhanced())
