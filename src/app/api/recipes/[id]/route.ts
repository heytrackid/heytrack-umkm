export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute } from '@/lib/api/route-factory'
import { createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'
import { RECIPE_FIELDS } from '@/lib/database/query-fields'

const RecipeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  prep_time: z.number().int().positive().optional(),
  cook_time: z.number().int().positive().optional(),
  serving_size: z.number().int().positive().optional(),
  selling_price: z.number().positive().optional(),
  is_active: z.boolean().optional(),
})

// GET /api/recipes/[id] - Get single recipe with ingredients
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/recipes/[id]',
  },
  createGetHandler({
    table: 'recipes',
    selectFields: RECIPE_FIELDS.DETAIL,
  })
)

// PUT /api/recipes/[id] - Update recipe
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/recipes/[id]',
    bodySchema: RecipeUpdateSchema,
  },
  createUpdateHandler({
    table: 'recipes',
    selectFields: RECIPE_FIELDS.DETAIL,
  })
)

// DELETE /api/recipes/[id] - Delete recipe
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/recipes/[id]',
  },
  createDeleteHandler(
    {
      table: 'recipes',
    },
    'Recipe deleted successfully'
  )
)
