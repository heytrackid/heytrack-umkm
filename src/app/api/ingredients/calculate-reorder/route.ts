export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { calculateAverageDailyUsage, calculateReorderPoint } from '@/lib/business-rules/inventory'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const body = await request.json()
    const { ingredientId, leadTimeDays = 7, safetyStockDays = 3 } = body

    const supabase = createServiceRoleClient()

    // Get ingredient
    const { data: _ingredient, error: ingredientError } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', ingredientId)
      .eq('user_id', user.id)
      .single()

    if (ingredientError) {
      if (ingredientError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 })
      }
      throw ingredientError
    }

    // Get usage history from recipe_ingredients (last 30 days)
    // This is a simplified version - in production, you'd track actual usage
    const { data: usageData, error: usageError } = await supabase
      .from('recipe_ingredients')
      .select('quantity, recipes!inner(created_at)')
      .eq('ingredient_id', ingredientId)
      .gte('recipes.created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (usageError) throw usageError

    // Calculate average daily usage
    type UsageData = { quantity: number; recipes: { created_at: string | null } }
    const usageHistory = ((usageData || []) as UsageData[]).map((item) => ({
      date: item.recipes.created_at || new Date().toISOString(),
      quantity: item.quantity,
    }))

    const averageDailyUsage = calculateAverageDailyUsage(usageHistory, 30)

    // Calculate reorder point
    const reorderPoint = calculateReorderPoint(
      averageDailyUsage,
      leadTimeDays,
      safetyStockDays
    )

    // Update ingredient with calculated reorder point
    const { data: updated, error: updateError } = await supabase
      .from('ingredients')
      .update({ reorder_point: reorderPoint } as never)
      .eq('id', ingredientId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      data: {
        ingredientId,
        averageDailyUsage,
        leadTimeDays,
        safetyStockDays,
        calculatedReorderPoint: reorderPoint,
        ingredient: updated,
      },
    })
  } catch (error) {
    return handleAPIError(error, 'POST /api/ingredients/calculate-reorder')
  }
}

export const POST = createSecureHandler(postHandler, 'POST /api/ingredients/calculate-reorder', SecurityPresets.enhanced())
