export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute } from '@/lib/api/route-factory'
import { ListQuerySchema, createListHandler, createCreateHandler } from '@/lib/api/crud-helpers'

const IngredientPurchaseSchema = z.object({
  ingredient_id: z.string().uuid(),
  quantity: z.number().positive(),
  price_per_unit: z.number().positive(),
  total_cost: z.number().positive(),
  supplier: z.string().min(1),
  purchase_date: z.string(),
  notes: z.string().optional(),
})

// GET /api/ingredient-purchases - List purchases
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/ingredient-purchases',
    querySchema: ListQuerySchema,
  },
  createListHandler({
    table: 'ingredient_purchases',
    selectFields: '*, ingredient:ingredients(id, name, unit, current_stock, price_per_unit)',
    defaultSort: 'purchase_date',
    defaultOrder: 'desc',
    searchFields: ['supplier', 'notes'],
  })
)

// POST /api/ingredient-purchases - Create purchase
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ingredient-purchases',
    bodySchema: IngredientPurchaseSchema,
  },
  createCreateHandler({
    table: 'ingredient_purchases',
    selectFields: '*, ingredient:ingredients(id, name, unit)',
  })
)
