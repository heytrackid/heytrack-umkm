export const runtime = 'nodejs'

import { createErrorResponse, createSuccessResponse } from '@/lib/api-core/responses'
import { ListQuerySchema, createListHandler } from '@/lib/api/crud-helpers'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const FinancialRecordSchema = z.object({
  description: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  type: z.enum(['INCOME', 'EXPENSE']),  // Uppercase to match database
})

// GET /api/financial/records - List financial records
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/financial/records',
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

// POST /api/financial/records - Create manual financial record
async function createFinancialRecordHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof FinancialRecordSchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  if (!body) {
    return createErrorResponse('Request body is required', 400)
  }

  const insertData = {
    user_id: user.id,
    type: body.type as 'INCOME' | 'EXPENSE',
    description: body.description,
    category: body.type === 'INCOME' ? 'Revenue' : body.category,
    amount: body.amount,
    date: body.date,
    reference: `MANUAL-${Date.now()}`,
    created_by: user.id,
    updated_by: user.id,
  }

  const { data, error } = await supabase
    .from('financial_records' as never)
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    return createErrorResponse('Failed to create financial record', 500)
  }

  return createSuccessResponse(data, 'Financial record created successfully', undefined, 201)
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/financial/records',
    bodySchema: FinancialRecordSchema,
  },
  createFinancialRecordHandler
)
