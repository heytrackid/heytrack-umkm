// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

/**
 * Optimized Recipes API Route
 * Example of using caching and performance optimizations
 */

// Internal modules - Core
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'

// Internal modules - Utils
import { apiLogger, dbLogger } from '@/lib/logger'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { getErrorMessage } from '@/lib/type-guards'

// Types and schemas
import { RecipeListQuerySchema, type RecipeListQuery } from '@/lib/validations/domains/recipe'

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/recipes/optimized',
    querySchema: RecipeListQuerySchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, validatedQuery?: RecipeListQuery) => {
    const { user, supabase } = context

    try {
      apiLogger.info({ userId: user.id }, 'GET /api/recipes/optimized - Request received')

      // Use validated query params
      const { is_active, limit = 50, page = 1, sort_by, sort_order, search, category } = validatedQuery || {}

      // Build optimized query
      let query = supabase
        .from('recipes')
        .select(
          `
          id,
          name,
          description,
          batch_size,
          total_cost,
          is_active,
          created_at,
          recipe_ingredients (
            id,
            quantity,
            ingredient:ingredients (
              id,
              name,
              unit,
              price_per_unit
            )
          )
        `,
          { count: 'exact' }
        )
        .eq('user_id', user.id)
        .range((page - 1) * limit, page * limit - 1)

      // Apply filters
      if (is_active !== undefined) {
        query = query.eq('is_active', is_active)
      }
      if (category) {
        query = query.eq('category', category)
      }
      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      // Apply sorting
      if (sort_by) {
        query = query.order(sort_by, { ascending: sort_order === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data: recipes, error, count } = await query

      if (error) {
        dbLogger.error({ error, userId: user.id, msg: 'Failed to fetch recipes' })
        return handleAPIError(new Error('Failed to fetch recipes'), 'GET /api/recipes/optimized')
      }

      return createSuccessResponse({
        recipes: recipes || [],
        total: count || 0,
        page,
        limit
      })
    } catch (error) {
      dbLogger.error({ error: getErrorMessage(error), msg: 'Recipes API error' })
      return handleAPIError(new Error('Internal server error'), 'GET /api/recipes/optimized')
    }
  }
)
