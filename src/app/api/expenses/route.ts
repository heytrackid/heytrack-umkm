import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { FinancialRecordInsertSchema } from '@/lib/validations/domains/finance'
import { safeParseAmount, safeString } from '@/lib/api-helpers'
import { apiLogger } from '@/lib/logger'
import { PaginationQuerySchema, DateRangeQuerySchema } from '@/lib/validations/domains/common'
import type { FinancialRecordsInsert, NotificationsInsert } from '@/types/database'
import { formatCurrency } from '@/lib/currency'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { getErrorMessage } from '@/lib/type-guards'
import { checkBotId } from 'botid/server'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

// Define the original GET function
async function GET(request: NextRequest) {
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
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    let query = supabase
      .from('expenses')
      .select('id, description, category, subcategory, amount, expense_date, supplier, payment_method, status, receipt_number, is_recurring, recurring_frequency, created_at, updated_at')
      .eq('user_id', user.id)
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
    const sortField = sort_by ?? 'expense_date'
    const sortDirection = sort_order === 'asc'
    query = query.order(sortField, { ascending: sortDirection })

    const { data: expenses, error } = await query

    if (error) {throw error}

    // Get total count for pagination
    let countQuery = supabase.from('expenses').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

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
      .eq('user_id', user.id)
      .eq('expense_date', today)

    const { data: monthExpenses } = await supabase
      .from('expenses')
      .select('amount, category')
      .eq('user_id', user.id)
      .gte('expense_date', `${thisMonth}-01`)
      .lte('expense_date', `${thisMonth}-31`)

    interface ExpensePartial { amount: number; category: string }
    
    const todayTotal = (todayExpenses ?? []).reduce((sum: number, exp: ExpensePartial) =>
      sum + safeParseAmount(exp.amount), 0)
    const monthTotal = (monthExpenses ?? []).reduce((sum: number, exp: ExpensePartial) =>
      sum + safeParseAmount(exp.amount), 0)

    // Category breakdown
    const categoryBreakdown = monthExpenses?.reduce((acc: Record<string, number>, exp: ExpensePartial) => {
      const category = safeString(exp.category, 'Uncategorized')
      acc[category] = (acc[category] || 0) + safeParseAmount(exp.amount)
      return acc
    }, {} as Record<string, number>) ?? {}

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
    apiLogger.error({ error: getErrorMessage(error) }, 'Error fetching expenses:')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// Define the original POST function
async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the request is from a bot
    const verification = await checkBotId()
    if (verification.isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // The request body is already sanitized by the security middleware
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

    const insertPayload: FinancialRecordsInsert = {
      ...validatedData,
      user_id: user.id,
      description: validatedData.description ?? '',
    }

    // Insert financial record with proper typing
    const { data: expense, error } = await supabase
      .from('financial_records')
      .insert(insertPayload)
      .select('id, description, category, amount, date, created_at, user_id')
      .single()

    if (error) {throw error}

    // Create notification for large expenses
    const expenseAmount = safeParseAmount(validatedData.amount)
    if (expenseAmount > 1000000 && expense) { // More than 1M IDR
      const notificationPayload: NotificationsInsert = {
        user_id: expense.user_id,
        type: 'warning',
        category: 'finance',
        title: 'Large Expense Recorded',
        message: `A large expense of ${formatCurrency(expenseAmount, { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 })} has been recorded for ${safeString(validatedData.category)}`,
        entity_type: 'expense',
        entity_id: expense.id,
        priority: 'high'
      }
      await supabase
        .from('notifications')
        .insert(notificationPayload)
        .select()
    }

    return NextResponse.json(expense, { status: 201 })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error creating expense:')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// Apply security middleware with enhanced security configuration
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

// Export secured handlers
export { securedGET as GET, securedPOST as POST }
