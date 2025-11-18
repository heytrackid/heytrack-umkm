export const runtime = 'nodejs'

import { createApiRoute } from '@/lib/api/route-factory'
import { createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'
import { z } from 'zod'

const UpdateFinancialRecordSchema = z.object({
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().optional(),
})

// GET /api/financial/records/[id] - Get single record
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/financial/records/[id]',
  },
  createGetHandler({
    table: 'financial_records',
    selectFields: '*',
  })
)

// PUT /api/financial/records/[id] - Update record
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/financial/records/[id]',
    bodySchema: UpdateFinancialRecordSchema,
  },
  createUpdateHandler({
    table: 'financial_records',
    selectFields: '*',
  })
)

// DELETE /api/financial/records/[id] - Delete record
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/financial/records/[id]',
  },
  createDeleteHandler(
    {
      table: 'financial_records',
    },
    'Financial record deleted successfully'
  )
)
