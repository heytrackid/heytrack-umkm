export const runtime = 'nodejs'
import { handleAPIError } from '@/lib/errors/api-error-handler'

import { calculateAverageDailyUsage, calculateReorderPoint } from '@/lib/business-rules/inventory'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { createSuccessResponse } from '@/lib/api-core/responses'
import { z } from 'zod'

const CalculateReorderSchema = z.object({
  ingredientId: z.string().uuid(),
  leadTimeDays: z.number().min(1).max(365).optional().default(7),
  safetyStockDays: z.number().min(0).max(365).optional().default(3),
})

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ingredients/calculate-reorder',
    bodySchema: CalculateReorderSchema,
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context: RouteContext, _query, body) => {
    const { user, supabase } = context
    const { ingredientId, leadTimeDays, safetyStockDays } = body!

    // Get ingredient
    const { data: _ingredient, error: ingredientError } = await supabase
      .from('ingredients')
      .select('id, name, current_stock, reorder_point, unit')
      .eq('id', ingredientId)
      .eq('user_id', user.id)
      .single()

    if (ingredientError) {
      if (ingredientError.code === 'PGRST116') {
        return handleAPIError(new Error('Ingredient not found'), 'API Route')
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

    return createSuccessResponse({
      ingredientId,
      averageDailyUsage,
      leadTimeDays,
      safetyStockDays,
      calculatedReorderPoint: reorderPoint,
      ingredient: updated,
    }, 'Reorder point calculated successfully')
  }
)
