export const runtime = 'nodejs'

import { createApiRoute } from '@/lib/api/route-factory'
import { ListQuerySchema, createListHandler } from '@/lib/api/crud-helpers'

// Sales = financial_records with type='INCOME'
// Note: Sales are typically created via orders, not directly

// GET /api/sales - List sales records
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/sales',
    querySchema: ListQuerySchema,
  },
  createListHandler({
    table: 'financial_records',
    selectFields: '*',
    defaultSort: 'date',
    defaultOrder: 'desc',
    searchFields: ['description', 'category'],
  })
)

// POST endpoint removed - sales are created through orders
