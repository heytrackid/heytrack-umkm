export const runtime = 'nodejs'

import { createErrorResponse, createSuccessResponse, handleAPIError } from '@/lib/api-core'
import { createGetHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createApiRoute } from '@/lib/api/route-factory'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { INGREDIENT_FIELDS } from '@/lib/database/query-fields'
import { IngredientUpdateSchema } from '@/lib/validations/domains/ingredient'

// GET /api/ingredients/[id] - Get single ingredient
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ingredients/[id]',
  },
  createGetHandler({
    table: 'ingredients',
    selectFields: INGREDIENT_FIELDS.LIST,
  })
)

// PUT /api/ingredients/[id] - Update ingredient
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/ingredients/[id]',
    bodySchema: IngredientUpdateSchema,
  },
  createUpdateHandler(
    {
      table: 'ingredients',
      selectFields: INGREDIENT_FIELDS.LIST,
    },
    SUCCESS_MESSAGES.INGREDIENT_UPDATED
  )
)

// DELETE /api/ingredients/[id] - Delete ingredient
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/ingredients/[id]',
  },
  async (context) => {
    const { user, supabase, params } = context
    const id = params?.['id']

    if (!id) {
      return createErrorResponse('Resource ID is required', 400)
    }

    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      // Check for Foreign Key Violation
      if (error.code === '23503') {
        return createErrorResponse(
          'Cannot delete ingredient because it is currently in use (e.g., in recipes, purchases, or stock history).',
          409 // Conflict
        )
      }
      
      const apiError = handleAPIError(error)
      return createErrorResponse(apiError.message, apiError['statusCode'])
    }

    return createSuccessResponse({ id }, SUCCESS_MESSAGES.INGREDIENT_DELETED)
  }
)

