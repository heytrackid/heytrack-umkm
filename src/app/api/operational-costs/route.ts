import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { ExpensesTable } from '@/types'

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
      console.error('Auth error:', authError)
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
      console.error('Error fetching operational costs:', error)
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
    console.error('Error in GET /api/operational-costs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.category || !body.amount || !body.expense_date) {
      return NextResponse.json(
        { error: 'Category, amount, and expense_date are required' },
        { status: 400 }
      )
    }

    // Prevent creating Revenue records through this endpoint
    if (body.category === 'Revenue') {
      return NextResponse.json(
        { error: 'Cannot create Revenue records through this endpoint' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        category: body.category,
        subcategory: body.subcategory,
        amount: body.amount,
        description: body.description || body.name,
        expense_date: body.expense_date,
        supplier: body.supplier,
        payment_method: body.payment_method || 'CASH',
        status: body.status || 'paid',
        receipt_number: body.receipt_number,
        is_recurring: body.isFixed || false,
        recurring_frequency: body.frequency || 'monthly',
        tags: body.tags || []
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating operational cost:', error)
      return NextResponse.json(
        { error: 'Failed to create operational cost' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    console.error('Error in POST /api/operational-costs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: ExpensesTable['Update'] = {}
    if (body.category !== undefined) updateData.category = body.category
    if (body.subcategory !== undefined) updateData.subcategory = body.subcategory
    if (body.amount !== undefined) updateData.amount = body.amount
    if (body.description !== undefined) updateData.description = body.description
    if (body.name !== undefined) updateData.description = body.name
    if (body.expense_date !== undefined) updateData.expense_date = body.expense_date
    if (body.supplier !== undefined) updateData.supplier = body.supplier
    if (body.payment_method !== undefined) updateData.payment_method = body.payment_method
    if (body.status !== undefined) updateData.status = body.status
    if (body.receipt_number !== undefined) updateData.receipt_number = body.receipt_number
    if (body.isFixed !== undefined) updateData.is_recurring = body.isFixed
    if (body.frequency !== undefined) updateData.recurring_frequency = body.frequency
    if (body.tags !== undefined) updateData.tags = body.tags

    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating operational cost:', error)
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
    console.error('Error in PUT /api/operational-costs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
      console.error('Auth error:', authError)
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
      console.error('Error deleting operational cost:', error)
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
    console.error('Error in DELETE /api/operational-costs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
