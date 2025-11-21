export const runtime = 'nodejs'

import { ListQuerySchema, createCreateHandler, createListHandler } from '@/lib/api/crud-helpers'
import { createApiRoute } from '@/lib/api/route-factory'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { OperationalCostInsertSchema } from '@/lib/validations/domains/finance'


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
    SUCCESS_MESSAGES.OPERATIONAL_COST_CREATED
  )
)
