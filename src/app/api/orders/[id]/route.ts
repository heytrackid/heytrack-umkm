export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute } from '@/lib/api/route-factory'
import { createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'
import { OrderUpdateSchema } from '@/lib/validations/domains/order'

// GET /api/orders/[id] - Get single order with items
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/orders/[id]',
  },
  createGetHandler({
    table: 'orders',
    selectFields: `
      *,
      order_items (
        id,
        recipe_id,
        product_name,
        quantity,
        unit_price,
        total_price,
        special_requests,
        recipe:recipes (
          id,
          name,
          image_url
        )
      )
    `,
  })
)

// PUT /api/orders/[id] - Update order
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/orders/[id]',
    bodySchema: OrderUpdateSchema,
  },
  createUpdateHandler({
    table: 'orders',
    selectFields: `
      *,
      order_items (
        id,
        recipe_id,
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `,
  })
)

// DELETE /api/orders/[id] - Delete order
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/orders/[id]',
  },
  createDeleteHandler(
    {
      table: 'orders',
    },
    'Order deleted successfully'
  )
)
