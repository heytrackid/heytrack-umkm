export const runtime = 'nodejs'

import { ListQuerySchema, createCreateHandler, createListHandler } from '@/lib/api/crud-helpers'
import { createApiRoute } from '@/lib/api/route-factory'
import { INGREDIENT_FIELDS } from '@/lib/database/query-fields'
import { IngredientInsertSchema } from '@/lib/validations/domains/ingredient'

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

import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

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
    SUCCESS_MESSAGES.INGREDIENT_CREATED
  )
)
