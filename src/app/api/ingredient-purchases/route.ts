import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

// GET - List all ingredient purchases
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const ingredientId = searchParams.get('ingredient_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const supplier = searchParams.get('supplier')
    
    // Build query
    let query = supabase
      .from('ingredient_purchases')
      .select(`
        *,
        ingredient:ingredients(
          id,
          name,
          unit,
          category
        )
      `)
      .order('purchase_date', { ascending: false })
    
    // Apply filters
    if (ingredientId) {
      query = query.eq('ingredient_id', ingredientId)
    }
    
    if (startDate) {
      query = query.gte('purchase_date', startDate)
    }
    
    if (endDate) {
      query = query.lte('purchase_date', endDate)
    }
    
    if (supplier) {
      query = query.ilike('supplier', `%${supplier}%`)
    }
    
    const { data: purchases, error } = await query
    
    if (error) {
      console.error('Error fetching purchases:', error)
      return NextResponse.json(
        { error: 'Failed to fetch purchases', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(purchases || [])
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new ingredient purchase with expense tracking and WAC
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['ingredient_id', 'quantity', 'unit_price', 'purchase_date']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Calculate total price if not provided
    const totalPrice = body.total_price || (parseFloat(body.quantity) * parseFloat(body.unit_price))
    const quantity = parseFloat(body.quantity)
    const unitPrice = parseFloat(body.unit_price)
    
    // Get ingredient details
    const { data: ingredient, error: ingredientError } = await supabase
      .from('ingredients')
      .select('id, name, unit, current_stock, category')
      .eq('id', body.ingredient_id)
      .single()
    
    if (ingredientError || !ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found', details: ingredientError?.message },
        { status: 404 }
      )
    }
    
    // 1. Create expense record first
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        category: 'Inventory',
        subcategory: ingredient.category || 'General',
        amount: totalPrice,
        description: `Purchase: ${ingredient.name} (${quantity} ${ingredient.unit})`,
        expense_date: body.purchase_date,
        supplier: body.supplier || null,
        payment_method: 'CASH',
        status: 'paid',
        tags: ['ingredient_purchase', 'inventory'],
        metadata: {
          ingredient_id: body.ingredient_id,
          ingredient_name: ingredient.name,
          quantity: quantity,
          unit: ingredient.unit,
          unit_price: unitPrice
        }
      })
      .select()
      .single()
    
    if (expenseError) {
      console.error('Error creating expense:', expenseError)
      return NextResponse.json(
        { error: 'Failed to create expense record', details: expenseError.message },
        { status: 500 }
      )
    }
    
    // 2. Insert purchase record with expense reference
    const { data: purchase, error: purchaseError } = await supabase
      .from('ingredient_purchases')
      .insert({
        ingredient_id: body.ingredient_id,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        cost_per_unit: unitPrice,
        supplier: body.supplier || null,
        purchase_date: body.purchase_date,
        notes: body.notes || null,
        expense_id: expense.id
      })
      .select(`
        *,
        ingredient:ingredients(
          id,
          name,
          unit,
          category,
          current_stock,
          weighted_average_cost
        ),
        expense:expenses(
          id,
          amount,
          expense_date
        )
      `)
      .single()
    
    if (purchaseError) {
      console.error('Error creating purchase:', purchaseError)
      // Rollback expense if purchase fails
      await supabase.from('expenses').delete().eq('id', expense.id)
      return NextResponse.json(
        { error: 'Failed to create purchase', details: purchaseError.message },
        { status: 500 }
      )
    }
    
    // 3. Update expense with purchase reference
    await supabase
      .from('expenses')
      .update({
        reference_type: 'ingredient_purchase',
        reference_id: purchase.id
      })
      .eq('id', expense.id)
    
    // 4. Update ingredient stock
    const newStock = (ingredient.current_stock || 0) + quantity
    
    const { error: stockError } = await supabase
      .from('ingredients')
      .update({ 
        current_stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.ingredient_id)
    
    if (stockError) {
      console.error('Warning: Failed to update ingredient stock:', stockError)
    }
    
    // Note: WAC is automatically calculated by database trigger
    
    return NextResponse.json(purchase, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a purchase and related expense
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      )
    }
    
    // Get purchase details before deleting (to revert stock and delete expense)
    const { data: purchase, error: fetchError } = await supabase
      .from('ingredient_purchases')
      .select('ingredient_id, quantity, expense_id')
      .eq('id', id)
      .single()
    
    if (fetchError || !purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }
    
    // 1. Delete related expense first
    if (purchase.expense_id) {
      const { error: expenseDeleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', purchase.expense_id)
      
      if (expenseDeleteError) {
        console.error('Warning: Failed to delete expense:', expenseDeleteError)
      }
    }
    
    // 2. Delete the purchase (this will trigger WAC recalculation)
    const { error: deleteError } = await supabase
      .from('ingredient_purchases')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete purchase', details: deleteError.message },
        { status: 500 }
      )
    }
    
    // 3. Revert ingredient stock
    const { data: ingredient } = await supabase
      .from('ingredients')
      .select('current_stock')
      .eq('id', purchase.ingredient_id)
      .single()
    
    if (ingredient) {
      const newStock = Math.max(0, (ingredient.current_stock || 0) - purchase.quantity)
      
      await supabase
        .from('ingredients')
        .update({ 
          current_stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchase.ingredient_id)
    }
    
    // Note: WAC is automatically recalculated by database trigger
    
    return NextResponse.json({ 
      success: true, 
      message: 'Purchase and related expense deleted successfully' 
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
