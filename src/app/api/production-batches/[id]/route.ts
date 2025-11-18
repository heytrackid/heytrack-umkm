export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute } from '@/lib/api/route-factory'
import { createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'

const UpdateProductionSchema = z.object({
  quantity: z.number().positive().optional(),
  cost_per_unit: z.number().min(0).optional(),
  labor_cost: z.number().min(0).optional(),
  total_cost: z.number().min(0).optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  planned_start_time: z.string().optional(),
  actual_start_time: z.string().optional(),
  actual_end_time: z.string().optional(),
  notes: z.string().max(500).optional(),
})

// GET /api/production-batches/[id] - Get single batch
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/production-batches/[id]',
  },
  createGetHandler({
    table: 'productions',
    selectFields: '*, recipe:recipes(name, cook_time)',
  })
)

// PUT /api/production-batches/[id] - Update batch
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/production-batches/[id]',
    bodySchema: UpdateProductionSchema,
  },
  createUpdateHandler({
    table: 'productions',
    selectFields: '*, recipe:recipes(name, cook_time)',
  })
)

// DELETE /api/production-batches/[id] - Delete batch
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/production-batches/[id]',
  },
  createDeleteHandler(
    {
      table: 'productions',
    },
    'Production batch deleted successfully'
  )
)
