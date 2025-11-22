// External libraries
// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { ListQuerySchema, createCreateHandler, createListHandler, createGetHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { INGREDIENT_FIELDS } from '@/lib/database/query-fields'
import { SecurityPresets } from '@/utils/security/api-middleware'

// Types and schemas
import { IngredientInsertSchema, IngredientUpdateSchema } from '@/lib/validations/domains/ingredient'

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

// GET /api/ingredients or /api/ingredients/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ingredients',
    querySchema: ListQuerySchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, validatedQuery) => {
    const { params } = context
    const { slug } = parseRouteParams(params)

    if (!slug || slug.length === 0) {
      // GET /api/ingredients - List all ingredients
      return createListHandler({
        table: 'ingredients',
        selectFields: INGREDIENT_FIELDS.LIST,
        defaultSort: 'name',
        defaultOrder: 'asc',
        searchFields: ['name'],
      })(context, validatedQuery)
    } else if (slug && slug.length === 1) {
      // GET /api/ingredients/[id] - Get single ingredient
      return createGetHandler({
        table: 'ingredients',
        selectFields: INGREDIENT_FIELDS.LIST,
      })(context)
    } else {
      return handleAPIError(new Error('Invalid path'), 'GET /api/ingredients')
    }
  }
)

// POST /api/ingredients - Create new ingredient
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ingredients',
    bodySchema: IngredientInsertSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const { slug } = parseRouteParams(context.params)
    if (slug && slug.length > 0) {
      return handleAPIError(new Error('Method not allowed'), 'POST /api/ingredients')
    }
    return createCreateHandler(
      {
        table: 'ingredients',
        selectFields: INGREDIENT_FIELDS.LIST,
      },
      SUCCESS_MESSAGES.INGREDIENT_CREATED
    )(context, undefined, body)
  }
)

// PUT /api/ingredients/[id] - Update ingredient
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/ingredients/[id]',
    bodySchema: IngredientUpdateSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const { slug } = parseRouteParams(context.params)
    if (!slug || slug.length !== 1) {
      return handleAPIError(new Error('Invalid path'), 'PUT /api/ingredients')
    }
    return createUpdateHandler(
      {
        table: 'ingredients',
        selectFields: INGREDIENT_FIELDS.LIST,
      },
      SUCCESS_MESSAGES.INGREDIENT_UPDATED
    )(context, undefined, body)
  }
)

// DELETE /api/ingredients/[id] - Delete ingredient
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/ingredients/[id]',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    const { user, supabase } = context
    const { id } = parseRouteParams(context.params)

    if (!id) {
      return handleAPIError(new Error('Resource ID is required'), 'DELETE /api/ingredients')
    }

    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      // Check for Foreign Key Violation
      if (error.code === '23503') {
        return handleAPIError(new Error('Cannot delete ingredient because it is currently in use (e.g., in recipes, purchases, or stock history).'), 'DELETE /api/ingredients')
      }

      return handleAPIError(error, 'DELETE /api/ingredients')
    }

    return createSuccessResponse({ id }, SUCCESS_MESSAGES.INGREDIENT_DELETED)
  }
)