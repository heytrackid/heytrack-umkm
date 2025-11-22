// External libraries
// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { parseRouteParams } from '@/lib/api/route-helpers'
import { ListQuerySchema, createCreateHandler, createListHandler, createGetHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { INGREDIENT_FIELDS } from '@/lib/database/query-fields'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { cacheInvalidation } from '@/lib/cache'

// Types and schemas
import { IngredientInsertSchema, IngredientUpdateSchema } from '@/lib/validations/domains/ingredient'

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

export const runtime = 'nodejs'

/**
 * GET /api/ingredients or /api/ingredients/[id]
 * Handles ingredient listing and retrieval operations
 *
 * @route GET /api/ingredients - List all ingredients with pagination, search, and filtering
 * @route GET /api/ingredients/[id] - Get a specific ingredient by ID
 *
 * @query {Object} [query] - Query parameters for listing
 * @query {number} [query.page=1] - Page number for pagination
 * @query {number} [query.limit=1000] - Number of items per page
 * @query {string} [query.search] - Search term for filtering ingredients
 * @query {string} [query.sort_by] - Field to sort by
 * @query {string} [query.sort_order] - Sort order ('asc' or 'desc')
 *
 * @returns {Promise<NextResponse>} JSON response with ingredient data
 */
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

/**
 * POST /api/ingredients - Create new ingredient
 * Creates a new ingredient record with validation and cache invalidation
 *
 * @route POST /api/ingredients
 *
 * @body {Object} body - Ingredient creation data
 * @body {string} body.name - Ingredient name (required)
 * @body {string} body.unit - Unit of measurement (required)
 * @body {number} body.price_per_unit - Price per unit (required)
 * @body {number} [body.current_stock=0] - Current stock quantity
 * @body {number} [body.min_stock=0] - Minimum stock threshold
 * @body {string} [body.description] - Ingredient description
 * @body {string} [body.category] - Ingredient category
 * @body {string} [body.supplier] - Supplier name
 *
 * @returns {Promise<NextResponse>} JSON response with created ingredient data
 */
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
    const result = await createCreateHandler(
      {
        table: 'ingredients',
        selectFields: INGREDIENT_FIELDS.LIST,
      },
      SUCCESS_MESSAGES.INGREDIENT_CREATED
    )(context, undefined, body)

    // Invalidate cache after successful creation
    if (result.status === 201) {
      cacheInvalidation.ingredients()
    }

    return result
  }
)

/**
 * PUT /api/ingredients/[id] - Update ingredient
 * Updates an existing ingredient record with validation and cache invalidation
 *
 * @route PUT /api/ingredients/[id]
 *
 * @param {string} id - Ingredient ID (from URL path)
 *
 * @body {Object} body - Ingredient update data (partial)
 * @body {string} [body.name] - Ingredient name
 * @body {string} [body.unit] - Unit of measurement
 * @body {number} [body.price_per_unit] - Price per unit
 * @body {number} [body.current_stock] - Current stock quantity
 * @body {number} [body.min_stock] - Minimum stock threshold
 * @body {string} [body.description] - Ingredient description
 * @body {string} [body.category] - Ingredient category
 * @body {string} [body.supplier] - Supplier name
 *
 * @returns {Promise<NextResponse>} JSON response with updated ingredient data
 */
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
    const result = await createUpdateHandler(
      {
        table: 'ingredients',
        selectFields: INGREDIENT_FIELDS.LIST,
      },
      SUCCESS_MESSAGES.INGREDIENT_UPDATED
    )(context, undefined, body)

    // Invalidate cache after successful update
    if (result.status === 200) {
      const { id } = parseRouteParams(context.params)
      cacheInvalidation.ingredients(id)
    }

    return result
  }
)

/**
 * DELETE /api/ingredients/[id] - Delete ingredient
 * Deletes an ingredient record with foreign key validation and cache invalidation
 *
 * @route DELETE /api/ingredients/[id]
 *
 * @param {string} id - Ingredient ID (from URL path)
 *
 * @returns {Promise<NextResponse>} JSON response confirming deletion
 * @throws {Error} If ingredient is in use by recipes or has purchase history
 */
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

    cacheInvalidation.ingredients(id)
    return createSuccessResponse({ id }, SUCCESS_MESSAGES.INGREDIENT_DELETED)
  }
)