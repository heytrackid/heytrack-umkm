export const runtime = 'nodejs'

import { ListQuerySchema, createCreateHandler, createListHandler } from '@/lib/api/crud-helpers'
import { createApiRoute } from '@/lib/api/route-factory'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { z } from 'zod'

const CreateProductionSchema = z.object({
  recipe_id: z.string().uuid(),
  quantity: z.number().positive(),
  cost_per_unit: z.number().min(0),
  labor_cost: z.number().min(0).optional().default(0),
  total_cost: z.number().min(0),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional().default('PLANNED'),
  planned_start_time: z.string().optional(),
  notes: z.string().max(500).optional(),
}).strict()

// GET /api/production-batches - List production batches
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/production-batches',
    querySchema: ListQuerySchema,
  },
  createListHandler({
    table: 'productions',
    selectFields: '*, recipe:recipes(name, cook_time)',
    defaultSort: 'created_at',
    defaultOrder: 'desc',
  })
)

// POST /api/production-batches - Create production batch
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/production-batches',
    bodySchema: CreateProductionSchema,
  },
  createCreateHandler({
    table: 'productions',
    selectFields: '*, recipe:recipes(name, cook_time)',
  }, SUCCESS_MESSAGES.PRODUCTION_BATCH_CREATED)
)
