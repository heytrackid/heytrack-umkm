import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { OperationalCostInsertSchema } from '@/lib/validations/domains/finance'
import type { Database } from '@/types/supabase-generated'
import { getErrorMessage } from '@/lib/type-guards'

import { apiLogger } from '@/lib/logger'

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

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .neq('category', 'Revenue')
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

  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error in GET /api/operational-costs:')
    return NextResponse.json(
      { error: getErrorMessage(err) },
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

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        category: validatedData.category,
        subcategory: validatedData.subcategory,
        amount: validatedData.amount,
        description: validatedData.description,
        expense_date: validatedData.date,
        supplier: validatedData.vendor_name,
        payment_method: 'CASH',
        status: validatedData.is_paid ? 'paid' : 'pending',
        receipt_number: validatedData.invoice_number,
        is_recurring: validatedData.is_recurring,
        recurring_frequency: validatedData.recurring_frequency,
        tags: []
      })
      .select('*')
      .single()

    if (error) {
      apiLogger.error({ error }, 'Error creating operational cost:')
      return NextResponse.json(
        { error: 'Failed to create operational cost' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error in POST /api/operational-costs:')
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/operational-costs
 * 
 * Update an existing operational cost
 */
export async function PUT(request: NextRequest) {
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

    // Validate request body with Zod (excluding id which is in URL)
    const updateValidation = OperationalCostInsertSchema.safeParse(body)
    if (!updateValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: updateValidation.error.issues
        },
        { status: 400 }
      )
    }

    const validatedData = updateValidation.data

    // Validate required fields
    if (!(body).id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Build update object from validated data
    const updateData: ExpensesTable['Update'] = {}
    if (validatedData.category !== undefined) {updateData.category = validatedData.category}
    if (validatedData.subcategory !== undefined) {updateData.subcategory = validatedData.subcategory}
    if (validatedData.amount !== undefined) {updateData.amount = validatedData.amount}
    if (validatedData.description !== undefined) {updateData.description = validatedData.description}
    if (validatedData.date !== undefined) {updateData.expense_date = validatedData.date}
    if (validatedData.is_recurring !== undefined) {updateData.is_recurring = validatedData.is_recurring}
    if (validatedData.recurring_frequency !== undefined) {updateData.recurring_frequency = validatedData.recurring_frequency}
    if (validatedData.vendor_name !== undefined) {updateData.supplier = validatedData.vendor_name}
    if (validatedData.invoice_number !== undefined) {updateData.receipt_number = validatedData.invoice_number}
    if (validatedData.is_paid !== undefined) {updateData.status = validatedData.is_paid ? 'paid' : 'pending'}

    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      apiLogger.error({ error }, 'Error updating operational cost:')
      return NextResponse.json(
        { error: 'Failed to update operational cost' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Operational cost not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)

  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error in PUT /api/operational-costs:')
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/operational-costs
 * 
 * Delete an operational cost
 */
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Delete with safety check: only delete non-Revenue records
    const { data, error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .neq('category', 'Revenue')
      .select('*')
      .single()

    if (error) {
      apiLogger.error({ error }, 'Error deleting operational cost:')
      return NextResponse.json(
        { error: 'Failed to delete operational cost' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Operational cost not found or cannot be deleted' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (err: unknown) {
    apiLogger.error({ err }, 'Error in DELETE /api/operational-costs:')
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    )
  }
}
