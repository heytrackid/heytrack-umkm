export const runtime = 'nodejs'

import { createApiRoute } from '@/lib/api/route-factory'
import { createGetHandler, createDeleteHandler } from '@/lib/api/crud-helpers'

// Sales = financial_records with type='INCOME'

// GET /api/sales/[id] - Get single sale record
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/sales/[id]',
  },
  createGetHandler({
    table: 'financial_records',
    selectFields: '*',
  })
)

// DELETE /api/sales/[id] - Delete sale record
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/sales/[id]',
  },
  createDeleteHandler(
    {
      table: 'financial_records',
    },
    'Sale record deleted successfully'
  )
)

// PUT endpoint removed - sales records typically shouldn't be edited
