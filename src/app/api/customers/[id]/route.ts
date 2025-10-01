import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'

// GET /api/customers/[id] - Get single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServerSupabaseAdmin()
    const { data, error } = await (supabase as any)
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching customer:', error)
      return NextResponse.json(
        { error: 'Failed to fetch customer' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in GET /api/customers/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServerSupabaseAdmin()
    const body = await request.json()
    
    // Validate email format if provided
    if (body.email && !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    const { data, error } = await (supabase as any)
      .from('customers')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
      console.error('Error updating customer:', error)
      return NextResponse.json(
        { error: 'Failed to update customer' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in PUT /api/customers/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServerSupabaseAdmin()
    
    // Check if customer has orders
    const { data: orders } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq('customer_id', id)
      .limit(1)
    
    if (orders && orders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders' },
        { status: 409 }
      )
    }
    
    const { error } = await (supabase as any)
      .from('customers')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting customer:', error)
      return NextResponse.json(
        { error: 'Failed to delete customer' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error: any) {
    console.error('Error in DELETE /api/customers/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}