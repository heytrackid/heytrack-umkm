export const runtime = 'nodejs'

import { OperationalCostInsertSchema } from '@/lib/validations/domains/finance'
import { createApiRoute } from '@/lib/api/route-factory'
import { ListQuerySchema, createListHandler, createCreateHandler } from '@/lib/api/crud-helpers'


// GET /api/operational-costs - List all operational costs with pagination
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/operational-costs',
    querySchema: ListQuerySchema,
  },
  createListHandler({
    table: 'operational_costs',
    selectFields: '*',
    defaultSort: 'date',
    defaultOrder: 'desc',
    searchFields: ['description', 'category'],
  })
)

// POST /api/operational-costs - Create new operational cost
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/operational-costs',
    bodySchema: OperationalCostInsertSchema,
  },
  createCreateHandler(
    {
      table: 'operational_costs',
      selectFields: '*',
    },
    'Operational cost created successfully'
  )
)
