export const runtime = 'nodejs'

import { INGREDIENT_FIELDS } from '@/lib/database/query-fields'
import { IngredientInsertSchema } from '@/lib/validations/domains/ingredient'
import { createApiRoute } from '@/lib/api/route-factory'
import { ListQuerySchema, createListHandler, createCreateHandler } from '@/lib/api/crud-helpers'

// GET /api/ingredients - List all ingredients with pagination, search, and sorting
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ingredients',
    querySchema: ListQuerySchema,
  },
  createListHandler({
    table: 'ingredients',
    selectFields: INGREDIENT_FIELDS.LIST,
    defaultSort: 'name',
    defaultOrder: 'asc',
    searchFields: ['name'],
  })
)

// POST /api/ingredients - Create new ingredient
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ingredients',
    bodySchema: IngredientInsertSchema,
  },
  createCreateHandler(
    {
      table: 'ingredients',
      selectFields: INGREDIENT_FIELDS.LIST,
    },
    'Bahan baku berhasil ditambahkan'
  )
)
