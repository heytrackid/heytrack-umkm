// External libraries
import { z } from 'zod'

// Internal modules
import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute } from '@/lib/api/route-factory'
import { buildRecipeCostPreview } from '@/lib/costs/cost-calculations'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { UUIDSchema } from '@/lib/validations/common'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas
import type { RecipeCostPreview, RecipeCostRecord } from '@/types/recipes/cost'
import { isRecipeCostRecord } from '@/types/recipes/cost'

// Constants and config
export const runtime = 'nodejs'

const CostPreviewsRequestSchema = z.object({
  recipeIds: z.array(UUIDSchema),
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
    securityPreset: SecurityPresets.enhanced(),
  },
  async ({ supabase }, _query, body) => {
    if (!body) {
      apiLogger.warn({}, 'No body provided to cost-previews endpoint')
      return createSuccessResponse({})
    }

    const { recipeIds } = body as CostPreviewsRequest

    if (!recipeIds || recipeIds.length === 0) {
      apiLogger.debug({}, 'Empty recipeIds array, returning empty result')
      return createSuccessResponse({})
    }

    apiLogger.debug({ recipeIds }, 'Fetching cost previews for recipes')

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
            unit,
            ingredients (
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
        try {
          if (!isRecipeCostRecord(recipe)) {
            apiLogger.warn({ recipeId: (recipe as RecipeCostRecord).id }, 'Invalid recipe cost record structure')
            continue
          }

          result[recipe.id] = buildRecipeCostPreview(recipe)
        } catch (error) {
          apiLogger.error({ error, recipeId: recipe.id }, 'Failed to calculate cost preview for recipe')
          // Include recipe with zero cost as fallback
          result[recipe.id] = {
            recipeId: recipe.id,
            materialCost: 0,
            costPerServing: 0,
            lastUpdated: recipe.updated_at,
            ingredientsCount: 0
          }
        }
      }

      return createSuccessResponse(result)
    } catch (error) {
      apiLogger.error({ error }, 'Failed to build recipe cost previews')
      return handleAPIError(new Error('Internal server error'), 'API Route')
    }
  }
)