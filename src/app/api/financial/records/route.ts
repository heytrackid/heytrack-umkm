export const runtime = 'nodejs'

import { z } from 'zod'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { ListQuerySchema, createListHandler } from '@/lib/api/crud-helpers'
import { NextResponse } from 'next/server'

const FinancialRecordSchema = z.object({
  description: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  type: z.enum(['income', 'expense']),
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
    return NextResponse.json({ error: 'Request body is required' }, { status: 400 })
  }

  const insertData = {
    user_id: user.id,
    type: body.type.toUpperCase() as 'INCOME' | 'EXPENSE',
    description: body.description,
    category: body.type === 'income' ? 'Revenue' : body.category,
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
    return NextResponse.json({ error: 'Failed to create financial record' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/financial/records',
    bodySchema: FinancialRecordSchema,
  },
  createFinancialRecordHandler
)
