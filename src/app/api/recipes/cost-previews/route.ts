import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createSuccessResponse, createErrorResponse } from '@/lib/api-core'
import { createApiRoute } from '@/lib/api/route-factory'
import { buildRecipeCostPreview } from '@/lib/costs/cost-calculations'
import { apiLogger } from '@/lib/logger'
import { isRecipeCostRecord } from '@/types/recipes/cost'
import type { RecipeCostPreview, RecipeCostRecord } from '@/types/recipes/cost'

const CostPreviewsRequestSchema = z.object({
  recipeIds: z.array(z.string()),
})

type CostPreviewsRequest = z.infer<typeof CostPreviewsRequestSchema>

/**
 * POST /api/recipes/cost-previews
 * Get cost previews for multiple recipes
 */
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/recipes/cost-previews',
    bodySchema: CostPreviewsRequestSchema,
    requireAuth: true,
  },
  async ({ supabase }, body) => {
    const { recipeIds } = body as CostPreviewsRequest

    if (!recipeIds || recipeIds.length === 0) {
      return createSuccessResponse({})
    }

    try {
      const { data, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          servings,
          updated_at,
          recipe_ingredients (
            quantity,
            ingredients:ingredient_id (
              id,
              name,
              price_per_unit,
              weighted_average_cost,
              unit,
              updated_at
            )
          )
        `)
        .in('id', recipeIds)

      if (recipesError) {
        throw recipesError
      }

      const recipes = (data ?? []) as RecipeCostRecord[]
      const result: Record<string, RecipeCostPreview> = {}

      for (const recipe of recipes) {
        if (!isRecipeCostRecord(recipe)) {
          continue
        }

        result[recipe.id] = buildRecipeCostPreview(recipe)
      }

      return createSuccessResponse(result)
    } catch (error) {
      apiLogger.error({ error }, 'Failed to build recipe cost previews')
      return createErrorResponse(
        { error: 'Internal server error' },
        500
      )
    }
  }
)