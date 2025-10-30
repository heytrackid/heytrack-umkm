import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { OperationalCostInsertSchema } from '@/lib/validations/domains/finance'
import type { Database } from '@/types/supabase-generated'
import { getErrorMessage } from '@/lib/type-guards'
import { apiLogger } from '@/lib/logger'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

type ExpensesTable = Database['public']['Tables']['expenses']
/**
 * GET /api/operational-costs
 * 
 * Fetch all operational costs (expenses where category != 'Revenue')
 * 
 * Query Parameters:
 * - start_date: Filter by start date (optional)
 * - end_date: Filter by end date (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Query expenses table (operational costs)
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false })

    if (startDate) {
      query = query.gte('expense_date', startDate)
    }
    if (endDate) {
      query = query.lte('expense_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      apiLogger.error({ error }, 'Error fetching operational costs:')
      return NextResponse.json(
        { error: 'Failed to fetch operational costs' },
        { status: 500 }
      )
    }

    interface CostSummary {
      id: string
      name: string
      category: string
      subcategory: string | null
      amount: number
      frequency: string
      description: string
      isFixed: boolean
      expense_date: string | null
      supplier: string | null
      payment_method: string | null
      status: string | null
      receipt_number: string | null
      created_at: string | null
      updated_at: string | null
    }

    // Transform to match frontend interface
    const costs: CostSummary[] = data?.map((expense: ExpensesTable['Row']) => ({
      id: expense.id,
      name: expense.description,
      category: expense.category,
      subcategory: expense.subcategory || null,
      amount: Number(expense.amount),
      frequency: expense.recurring_frequency || 'monthly',
      description: expense.description,
      isFixed: expense.is_recurring || false,
      expense_date: expense.expense_date || null,
      supplier: expense.supplier || null,
      payment_method: expense.payment_method || null,
      status: expense.status || null,
      receipt_number: expense.receipt_number || null,
      created_at: expense.created_at || null,
      updated_at: expense.updated_at || null
    })) || []

    return NextResponse.json({
      costs,
      total: costs.length,
      summary: {
        total_amount: costs.reduce((sum: number, c: CostSummary) => sum + c.amount, 0),
        total_monthly: costs
          .filter((c: CostSummary) => c.frequency === 'monthly')
          .reduce((sum: number, c: CostSummary) => sum + c.amount, 0),
        fixed_costs: costs.filter((c: CostSummary) => c.isFixed).length,
        variable_costs: costs.filter((c: CostSummary) => !c.isFixed).length
      }
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/operational-costs:')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/operational-costs
 * 
 * Create a new operational cost (expense record)
 */
export async function POST(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body with Zod
    const validation = OperationalCostInsertSchema.safeParse(body)
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

    const insertPayload: Database['public']['Tables']['expenses']['Insert'] = {
      user_id: user.id,
      category: validatedData.category,
      subcategory: validatedData.subcategory,
      amount: validatedData.amount,
      description: validatedData.description || '',
      expense_date: validatedData.date,
      supplier: validatedData.vendor_name ?? undefined,
      payment_method: 'CASH',
      status: validatedData.is_paid ? 'paid' : 'pending',
      receipt_number: validatedData.invoice_number,
      is_recurring: validatedData.is_recurring,
      recurring_frequency: validatedData.recurring_frequency ?? undefined,
      tags: []
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert(insertPayload)
      .select('id, description, category, subcategory, amount, expense_date, supplier, payment_method, status, receipt_number, is_recurring, recurring_frequency, created_at, updated_at')
      .single()

    if (error) {
      apiLogger.error({ error }, 'Error creating operational cost:')
      return NextResponse.json(
        { error: 'Failed to create operational cost' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/operational-costs:')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// PUT and DELETE moved to /api/operational-costs/[id]/route.ts
