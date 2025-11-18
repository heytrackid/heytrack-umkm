export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute } from '@/lib/api/route-factory'
import { createGetHandler, createUpdateHandler, createDeleteHandler } from '@/lib/api/crud-helpers'

const UpdateExpenseSchema = z.object({
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().optional(),
  reference: z.string().optional(),
  supplier_id: z.string().uuid().optional(),
})

// GET /api/expenses/[id] - Get single expense
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/expenses/[id]',
  },
  createGetHandler({
    table: 'financial_records',
    selectFields: '*',
  })
)

// PUT /api/expenses/[id] - Update expense
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/expenses/[id]',
    bodySchema: UpdateExpenseSchema,
  },
  createUpdateHandler({
    table: 'financial_records',
    selectFields: '*',
  })
)

// DELETE /api/expenses/[id] - Delete expense
export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/expenses/[id]',
  },
  createDeleteHandler(
    {
      table: 'financial_records',
    },
    'Expense deleted successfully'
  )
)
