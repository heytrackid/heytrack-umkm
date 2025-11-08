// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import type { Row } from '@/types/database'
import { createSecureHandler, SecurityPresets } from '@/utils/security'

import { createClient } from '@/utils/supabase/server'

type Recipe = Row<'recipes'>

const getProfitabilityLevel = (marginPercentage: number): 'high' | 'low' | 'medium' => {
  if (marginPercentage >= 30) {
    return 'high'
  }

  if (marginPercentage >= 15) {
    return 'medium'
  }

  return 'low'
}

const getEfficiencyLevel = (timesMade: number): 'high' | 'low' | 'medium' => {
  if (timesMade >= 20) {
    return 'high'
  }

  if (timesMade >= 10) {
    return 'medium'
  }

  return 'low'
}

// GET /api/hpp/comparison - Get recipe comparison data
async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Get recipes with HPP and sales data
    let query = supabase
      .from('recipes')
      .select(`
        id,
        name,
        category,
        selling_price,
        margin_percentage,
        times_made,
        last_made_at,
        cost_per_unit
      `)
      .eq('user_id', user['id'])
      .eq('is_active', true)
      .gt('cost_per_unit', 0)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: recipes, error } = await query

    if (error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`)
    }

    // Process comparison data
    const comparisonData = ((recipes as Recipe[]) ?? []).map(recipe => {
      const hppValue = Number(recipe.cost_per_unit) || 0
      const sellingPrice = Number(recipe.selling_price) || 0
      const margin = sellingPrice - hppValue
      const marginPercentage = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0

      // Calculate profitability and efficiency
      const profitability = getProfitabilityLevel(marginPercentage)

      const timesMade = recipe.times_made ?? 0
      const efficiency = getEfficiencyLevel(timesMade)

      return {
        id: recipe['id'],
        name: recipe.name,
        category: recipe.category ?? 'General',
        hppValue,
        sellingPrice,
        margin,
        marginPercentage,
        timesMade,
        lastMade: recipe.last_made_at,
        profitability,
        efficiency
      }
    })

    // Calculate benchmark data
    const totalRecipes = comparisonData.length
    const averageHpp = totalRecipes > 0
      ? comparisonData.reduce((sum, r) => sum + r.hppValue, 0) / totalRecipes
      : 0

    const averageMargin = totalRecipes > 0
      ? comparisonData.reduce((sum, r) => sum + r.marginPercentage, 0) / totalRecipes
      : 0

    const averagePrice = totalRecipes > 0
      ? comparisonData.reduce((sum, r) => sum + r.sellingPrice, 0) / totalRecipes
      : 0

    const totalProduction = comparisonData.reduce((sum, r) => sum + r.timesMade, 0)

    // Find top and worst performers
    const sortedByMargin = [...comparisonData].sort((a, b) => b.marginPercentage - a.marginPercentage)
    const topPerformer = sortedByMargin[0] ?? null
    const worstPerformer = sortedByMargin[sortedByMargin.length - 1] ?? null

    const benchmark = {
      averageHpp,
      averageMargin,
      averagePrice,
      totalRevenue: comparisonData.reduce((sum, r) => sum + (r.sellingPrice * r.timesMade), 0),
      totalProduction,
      topPerformer,
      worstPerformer
    }

    apiLogger.info({
      userId: user['id'],
      totalRecipes,
      category: category ?? 'all'
    }, 'Recipe comparison data retrieved successfully')

    return NextResponse.json({
      recipes: comparisonData,
      benchmark,
      total: totalRecipes
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error fetching recipe comparison data')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/hpp/comparison', SecurityPresets.enhanced())
