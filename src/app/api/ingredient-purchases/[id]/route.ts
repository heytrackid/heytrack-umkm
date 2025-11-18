export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute } from '@/lib/api/route-factory'
import { createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'

const UpdatePurchaseSchema = z.object({
  quantity: z.number().positive().optional(),
  price_per_unit: z.number().positive().optional(),
  total_cost: z.number().positive().optional(),
  supplier: z.string().min(1).optional(),
  purchase_date: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/ingredient-purchases/[id] - Get single purchase
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ingredient-purchases/[id]',
  },
  createGetHandler({
    table: 'ingredient_purchases',
    selectFields: '*, ingredient:ingredients(id, name, unit)',
  })
)

// PUT /api/ingredient-purchases/[id] - Update purchase
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/ingredient-purchases/[id]',
    bodySchema: UpdatePurchaseSchema,
  },
  createUpdateHandler({
    table: 'ingredient_purchases',
    selectFields: '*, ingredient:ingredients(id, name, unit)',
  })
)

// DELETE /api/ingredient-purchases/[id] - Delete purchase
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/ingredient-purchases/[id]',
  },
  createDeleteHandler(
    {
      table: 'ingredient_purchases',
    },
    'Purchase record deleted successfully'
  )
)
