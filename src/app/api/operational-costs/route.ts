import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'

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
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    const supabase = createServerSupabaseAdmin()
    
    let query = (supabase as any)
      .from('expenses')
      .select('*')
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
    const costs = data?.map((expense: any) => ({
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
    
    return NextResponse.json({
      costs,
      total: costs.length,
      summary: {
        total_amount: costs.reduce((sum, c) => sum + c.amount, 0),
        total_monthly: costs
          .filter((c: any) => c.frequency === 'monthly')
          .reduce((sum, c) => sum + c.amount, 0),
        fixed_costs: costs.filter((c: any) => c.isFixed).length,
        variable_costs: costs.filter((c: any) => !c.isFixed).length
      }
    })
    
  } catch (error: any) {
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
 * Create a new operational cost
 * 
 * Body:
 * - name: string (description)
 * - category: string
 * - amount: number
 * - frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
 * - description: string (optional)
 * - isFixed: boolean (is_recurring)
 * - supplier: string (optional)
 * - expense_date: date (optional, defaults to today)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      category,
      subcategory,
      amount,
      frequency,
      description,
      isFixed,
      supplier,
      expense_date,
      payment_method,
      receipt_number
    } = body
    
    // Validate required fields
    if (!name || !category || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, amount' },
        { status: 400 }
      )
    }
    
    // Prevent creating Revenue entries through this endpoint
    if (category === 'Revenue') {
      return NextResponse.json(
        { error: 'Cannot create Revenue entries through operational costs API' },
        { status: 400 }
      )
    }
    
    const supabase = createServerSupabaseAdmin()
    
    const { data, error } = await (supabase as any)
      .from('expenses')
      .insert({
        category: category,
        subcategory: subcategory || null,
        amount: amount,
        description: description || name,
        expense_date: expense_date || new Date().toISOString().split('T')[0],
        supplier: supplier || null,
        is_recurring: isFixed || false,
        recurring_frequency: frequency || 'monthly',
        payment_method: payment_method || 'CASH',
        status: 'paid',
        receipt_number: receipt_number || null,
        metadata: {
          source: 'operational_costs_page',
          original_name: name
        }
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating operational cost:', error)
      return NextResponse.json(
        { error: 'Failed to create operational cost' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      cost: {
        id: data.id,
        name: data.description,
        category: data.category,
        subcategory: data.subcategory,
        amount: Number(data.amount),
        frequency: data.recurring_frequency,
        description: data.description,
        isFixed: data.is_recurring,
        expense_date: data.expense_date,
        supplier: data.supplier,
        created_at: data.created_at
      }
    }, { status: 201 })
    
  } catch (error: any) {
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
 * 
 * Body:
 * - id: string (required)
 * - ... other fields to update
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }
    
    // Prevent updating to Revenue category
    if (updates.category === 'Revenue') {
      return NextResponse.json(
        { error: 'Cannot change category to Revenue through operational costs API' },
        { status: 400 }
      )
    }
    
    const supabase = createServerSupabaseAdmin()
    
    // Build update object
    const updateData: any = {}
    if (updates.name) updateData.description = updates.name
    if (updates.category) updateData.category = updates.category
    if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.frequency) updateData.recurring_frequency = updates.frequency
    if (updates.description !== undefined) updateData.description = updates.description || updates.name
    if (updates.isFixed !== undefined) updateData.is_recurring = updates.isFixed
    if (updates.supplier !== undefined) updateData.supplier = updates.supplier
    if (updates.expense_date) updateData.expense_date = updates.expense_date
    if (updates.payment_method) updateData.payment_method = updates.payment_method
    if (updates.receipt_number !== undefined) updateData.receipt_number = updates.receipt_number
    
    updateData.updated_at = new Date().toISOString()
    
    const { data, error } = await (supabase as any)
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .neq('category', 'Revenue') // Extra safety: only update non-Revenue records
      .select()
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
        { error: 'Operational cost not found or cannot be updated' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      cost: {
        id: data.id,
        name: data.description,
        category: data.category,
        subcategory: data.subcategory,
        amount: Number(data.amount),
        frequency: data.recurring_frequency,
        description: data.description,
        isFixed: data.is_recurring,
        expense_date: data.expense_date,
        supplier: data.supplier,
        updated_at: data.updated_at
      }
    })
    
  } catch (error: any) {
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
 * Delete one or more operational costs
 * 
 * Body:
 * - ids: string[] (array of IDs to delete)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid field: ids (must be a non-empty array)' },
        { status: 400 }
      )
    }
    
    const supabase = createServerSupabaseAdmin()
    
    // Delete with safety check: only delete non-Revenue records
    const { error } = await (supabase as any)
      .from('expenses')
      .delete()
      .in('id', ids)
      .neq('category', 'Revenue')
    
    if (error) {
      console.error('Error deleting operational costs:', error)
      return NextResponse.json(
        { error: 'Failed to delete operational costs' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      deleted_count: ids.length,
      message: `Successfully deleted ${ids.length} operational cost(s)`
    })
    
  } catch (error: any) {
    console.error('Error in DELETE /api/operational-costs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
