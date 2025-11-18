export const runtime = 'nodejs'

import { INGREDIENT_FIELDS } from '@/lib/database/query-fields'
import { IngredientUpdateSchema } from '@/lib/validations/domains/ingredients'
import { createApiRoute } from '@/lib/api/route-factory'
import { createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'

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
    'Bahan baku berhasil diperbarui'
  )
)

// DELETE /api/ingredients/[id] - Delete ingredient
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/ingredients/[id]',
  },
  createDeleteHandler(
    {
      table: 'ingredients',
    },
    'Bahan baku berhasil dihapus'
  )
)

