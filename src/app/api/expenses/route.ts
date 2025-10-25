import { formatCurrency } from '@/shared/utils/currency'
import { getErrorMessage } from '@/lib/type-guards'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { PaginationQuerySchema, DateRangeQuerySchema, ExpenseInsertSchema } from '@/lib/validations'

import { apiLogger } from '@/lib/logger'
import { typedInsert, typedUpdate, castRow, castRows } from '@/lib/supabase-client-typed'
import { createTypedClient, hasData, hasArrayData, isQueryError } from '@/lib/supabase-typed-client'
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Validate query parameters
  const paginationValidation = PaginationQuerySchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    search: searchParams.get('search'),
    sort_by: searchParams.get('sort_by'),
    sort_order: searchParams.get('sort_order'),
  })

  if (!paginationValidation.success) {
    return NextResponse.json(
      { error: 'Invalid pagination parameters', details: paginationValidation.error.issues },
      { status: 400 }
    )
  }

  // Validate date range if provided
  const dateRangeValidation = DateRangeQuerySchema.safeParse({
    start_date: searchParams.get('startDate'),
    end_date: searchParams.get('endDate'),
  })

  if (!dateRangeValidation.success) {
    return NextResponse.json(
      { error: 'Invalid date parameters', details: dateRangeValidation.error.issues },
      { status: 400 }
    )
  }

  const { page, limit, search, sort_by, sort_order } = paginationValidation.data
  const { start_date, end_date } = dateRangeValidation.data
  const category = searchParams.get('category')

  try {
    const supabase = createSupabaseClient()

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    let query = supabase
      .from('expenses')
      .select('*')
      .range(offset, offset + limit - 1)

    // Add search filter
    if (search) {
      query = query.or(`description.ilike.%${search}%,category.ilike.%${search}%`)
    }

    // Add category filter
    if (category) {
      query = query.eq('category', category)
    }

    // Add date range filter
    if (start_date) {
      query = query.gte('expense_date', start_date)
    }

    if (end_date) {
      query = query.lte('expense_date', end_date)
    }

    // Add sorting
    const sortField = sort_by || 'expense_date'
    const sortDirection = sort_order === 'asc'
    query = query.order(sortField, { ascending: sortDirection })

    const { data: expenses, error } = await query

    if (error) throw error

    // Get total count for pagination
    let countQuery = supabase.from('expenses').select('*', { count: 'exact', head: true })

    // Apply same filters to count query
    if (search) {
      countQuery = countQuery.or(`description.ilike.%${search}%,category.ilike.%${search}%`)
    }
    if (category) {
      countQuery = countQuery.eq('category', category)
    }
    if (start_date) {
      countQuery = countQuery.gte('expense_date', start_date)
    }
    if (end_date) {
      countQuery = countQuery.lte('expense_date', end_date)
    }

    const { count } = await countQuery

    // Get summary stats for dashboard
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().slice(0, 7)
    
    const { data: todayExpenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('expense_date', today)

    const { data: monthExpenses } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', `${thisMonth}-01`)
      .lte('expense_date', `${thisMonth}-31`)

    const todayTotal = todayExpenses?.reduce((sum: number, exp: { amount?: string | number }) =>
      sum + parseFloat(String((exp as any).amount || '0')), 0) || 0
    const monthTotal = monthExpenses?.reduce((sum: number, exp: { amount?: string | number }) =>
      sum + parseFloat(String((exp as any).amount || '0')), 0) || 0

    // Category breakdown
    const categoryBreakdown = monthExpenses?.reduce((acc: Record<string, number>, exp: { category?: string; amount?: string | number }) => {
      const category = (exp as any).category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + parseFloat(String((exp as any).amount || '0'))
      return acc
    }, {}) || {}

    return NextResponse.json({ 
      data: expenses, 
      count,
      pagination: {
        limit: parseInt(String(limit)),
        offset: parseInt(String(offset)),
        total: count
      },
      summary: {
        today: todayTotal,
        thisMonth: monthTotal,
        categoryBreakdown
      }
    })
  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error fetching expenses:')
    const message = error instanceof Error ? (error as any).message : 'Failed to fetch expenses'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()

    // Validate request body
    const validation = ExpenseInsertSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const validatedData = validation.data

    const insertPayload = {
      ...validatedData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // @ts-ignore
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([insertPayload] as any)
      .select('*')
      .single()

    if (error) throw error

    // Create notification for large expenses
    if ((validatedData as any).amount > 1000000) { // More than 1M IDR
      const notificationPayload = {
        type: 'warning',
        category: 'finance',
        title: 'Large Expense Recorded',
        message: `A large expense of ${formatCurrency((validatedData as any).amount, { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 })} has been recorded for ${(validatedData as any).category}`,
        entity_type: 'expense',
        entity_id: (expense as any).id,
        priority: 'high'
      }
      await supabase.from('notifications').insert([notificationPayload] as any)
    }

    return NextResponse.json(expense, { status: 201 })
  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error creating expense:')
    const message = error instanceof Error ? (error as any).message : 'Failed to create expense'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
