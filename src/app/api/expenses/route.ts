import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { FinancialRecordInsertSchema } from '@/lib/validations/domains/finance'
import { safeParseAmount, safeString } from '@/lib/api-helpers'
import { apiLogger } from '@/lib/logger'
import { PaginationQuerySchema, DateRangeQuerySchema } from '@/lib/validations/api-validations'
import type { Database } from '@/types/supabase-generated'
import { formatCurrency } from '@/lib/currency'
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
    const supabase = await createClient()

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    let query = supabase
      .from('expenses')
      .select('id, description, category, subcategory, amount, expense_date, supplier, payment_method, status, receipt_number, is_recurring, recurring_frequency, created_at, updated_at')
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

    if (error) {throw error}

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
      .select('amount, category')
      .eq('expense_date', today)

    const { data: monthExpenses } = await supabase
      .from('expenses')
      .select('amount, category')
      .gte('expense_date', `${thisMonth}-01`)
      .lte('expense_date', `${thisMonth}-31`)

    type ExpenseRow = Database['public']['Tables']['expenses']['Row']
    
    const todayTotal = todayExpenses?.reduce((sum: number, exp: ExpenseRow) =>
      sum + safeParseAmount(exp.amount), 0) || 0
    const monthTotal = monthExpenses?.reduce((sum: number, exp: ExpenseRow) =>
      sum + safeParseAmount(exp.amount), 0) || 0

    // Category breakdown
    const categoryBreakdown = monthExpenses?.reduce((acc: Record<string, number>, exp: ExpenseRow) => {
      const category = safeString(exp.category, 'Uncategorized')
      acc[category] = (acc[category] || 0) + safeParseAmount(exp.amount)
      return acc
    }, {} as Record<string, number>) || {}

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
  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error fetching expenses:')
    const message = err instanceof Error ? err.message : 'Failed to fetch expenses'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate request body
    const validation = FinancialRecordInsertSchema.safeParse(body)
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

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([insertPayload] as any)
      .select('id, description, category, amount, expense_date, created_at')
      .single()

    if (error) {throw error}

    // Create notification for large expenses
    const expenseAmount = safeParseAmount(validatedData.amount)
    if (expenseAmount > 1000000 && expense) { // More than 1M IDR
      const notificationPayload = {
        type: 'warning' as const,
        category: 'finance',
        title: 'Large Expense Recorded',
        message: `A large expense of ${formatCurrency(expenseAmount, { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 })} has been recorded for ${safeString(validatedData.category)}`,
        entity_type: 'expense' as const,
        entity_id: expense.id,
        priority: 'high' as const
      }
      await supabase.from('notifications').insert([notificationPayload])
    }

    return NextResponse.json(expense, { status: 201 })
  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error creating expense:')
    const message = err instanceof Error ? err.message : 'Failed to create expense'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
