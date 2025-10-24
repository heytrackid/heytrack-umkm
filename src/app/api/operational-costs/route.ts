import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { ExpensesTable } from '@/types'
import { OperationalCostInsertSchema, OperationalCostUpdateSchema } from '@/lib/validations/database-validations'
import { getErrorMessage } from '@/lib/type-guards'

import { apiLogger } from '@/lib/logger'
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
      apiLogger.error({ error: error }, 'Error fetching operational costs:')
      return NextResponse.json(
        { error: 'Failed to fetch operational costs' },
        { status: 500 }
      )
    }

    // Transform to match frontend interface
    const costs = data?.map((expense: ExpensesTable['Row']) => ({
      id: expense.id,
      name: expense.description,
      category: expense.category,
      subcategory: expense.subcategory,
      amount: Number(expense.amount),
      frequency: expense.recurring_frequency || 'monthly',
      description: expense.description,
      isFixed: expense.is_recurring || false,
      expense_date: expense.expense_date,
      supplier: expense.supplier,
      payment_method: expense.payment_method,
      status: expense.status,
      receipt_number: expense.receipt_number,
      created_at: expense.created_at,
      updated_at: expense.updated_at
    })) || []

    interface CostSummary {
      id: string
      name: string
      category: string
      subcategory: string
      amount: number
      frequency: string
      description: string
      isFixed: boolean
      expense_date: string
      supplier: string | null
      payment_method: string | null
      status: string
      receipt_number: string | null
      created_at: string | null
      updated_at: string | null
    }

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
    apiLogger.error({ error: error }, 'Error in GET /api/operational-costs:')
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

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        category: validatedData.category,
        subcategory: validatedData.subcategory,
        amount: validatedData.amount,
        description: validatedData.description,
        expense_date: validatedData.cost_date,
        supplier: null,
        payment_method: 'CASH',
        status: 'paid',
        receipt_number: null,
        is_recurring: validatedData.is_recurring,
        recurring_frequency: validatedData.frequency,
        tags: []
      })
      .select('*')
      .single()

    if (error) {
      apiLogger.error({ error: error }, 'Error creating operational cost:')
      return NextResponse.json(
        { error: 'Failed to create operational cost' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error in POST /api/operational-costs:')
    return NextResponse.json(
      { error: getErrorMessage(error) },
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
    const updateValidation = OperationalCostUpdateSchema.safeParse(body)
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
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Build update object from validated data
    const updateData: ExpensesTable['Update'] = {}
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.subcategory !== undefined) updateData.subcategory = validatedData.subcategory
    if (validatedData.amount !== undefined) updateData.amount = validatedData.amount
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.cost_date !== undefined) updateData.expense_date = validatedData.cost_date
    if (validatedData.is_recurring !== undefined) updateData.is_recurring = validatedData.is_recurring
    if (validatedData.frequency !== undefined) updateData.recurring_frequency = validatedData.frequency

    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      apiLogger.error({ error: error }, 'Error updating operational cost:')
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

  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error in PUT /api/operational-costs:')
    return NextResponse.json(
      { error: getErrorMessage(error) },
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
      apiLogger.error({ error: error }, 'Error deleting operational cost:')
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

  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error in DELETE /api/operational-costs:')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
