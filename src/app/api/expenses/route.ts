export const runtime = 'nodejs'

import { calculateOffset, createPaginationMeta } from '@/lib/api-core'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-core/responses'
import { ListQuerySchema } from '@/lib/api/crud-helpers'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ExpenseQuerySchema = ListQuerySchema.extend({
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

const ExpenseSchema = z.object({
  description: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  reference: z.string().optional(),
  supplier_id: z.string().uuid().optional(),
})

// GET /api/expenses - List expenses
async function listExpensesHandler(
  context: RouteContext,
  query?: z.infer<typeof ExpenseQuerySchema>
): Promise<NextResponse> {
  const { user, supabase } = context
  const {
    page = 1,
    limit = 1000,
    sort = 'date',
    order = 'desc',
    search,
    category,
    startDate,
    endDate,
  } = query || {}

  const offset = calculateOffset(page, limit)

  let supabaseQuery = supabase
    .from('financial_records' as never)
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('type', 'EXPENSE')
    .range(offset, offset + limit - 1)

  if (search) {
    supabaseQuery = supabaseQuery.or(`description.ilike.%${search}%,category.ilike.%${search}%`)
  }

  if (category) {
    supabaseQuery = supabaseQuery.eq('category', category)
  }

  if (startDate) {
    supabaseQuery = supabaseQuery.gte('date', startDate)
  }

  if (endDate) {
    supabaseQuery = supabaseQuery.lte('date', endDate)
  }

  supabaseQuery = supabaseQuery.order(sort, { ascending: order === 'asc' })

  const { data, error, count } = await supabaseQuery

  if (error) {
    return createErrorResponse('Failed to fetch expenses', 500)
  }

  const pagination = createPaginationMeta(count ?? 0, page, limit)

  return createSuccessResponse(data, undefined, pagination)
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/expenses',
    querySchema: ExpenseQuerySchema,
  },
  listExpensesHandler
)

// POST /api/expenses - Create expense
async function createExpenseHandler(
  context: RouteContext,
  _query?: never,
  body?: z.infer<typeof ExpenseSchema>
): Promise<NextResponse> {
  const { user, supabase } = context

  if (!body) {
    return createErrorResponse('Request body is required', 400)
  }

  const insertData = {
    ...body,
    user_id: user.id,
    type: 'EXPENSE' as const,
    reference: body.reference || `EXP-${Date.now()}`,
    created_by: user.id,
    updated_by: user.id,
  }

  const { data, error } = await supabase
    .from('financial_records' as never)
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    return createErrorResponse('Failed to create expense', 500)
  }

  return createSuccessResponse(data, 'Expense created successfully', undefined, 201)
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/expenses',
    bodySchema: ExpenseSchema,
  },
  createExpenseHandler
)
