import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { FinancialRecordUpdateSchema } from '@/lib/validations/domains/finance'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/financial/records/[id] - Get single financial record
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch financial record
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Financial record not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error fetching financial record')
      return NextResponse.json({ error: 'Failed to fetch financial record' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/financial/records/[id]')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/financial/records/[id] - Update financial record
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validation = FinancialRecordUpdateSchema.safeParse(body)
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

    // Build update object (only fields that exist in financial_records table)
    const updatePayload: Database['public']['Tables']['financial_records']['Update'] = {
      date: validatedData.date,
      type: validatedData.type,
      category: validatedData.category,
      amount: validatedData.amount,
      description: validatedData.description || undefined,
      reference: validatedData.reference_id || undefined
    }

    // Update with RLS enforcement
    const { data, error } = await supabase
      .from('financial_records')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Financial record not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error updating financial record')
      return NextResponse.json({ error: 'Failed to update financial record' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in PUT /api/financial/records/[id]')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/financial/records/[id] - Delete financial record
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if record is linked to orders or other entities
    const { data: linkedOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('financial_record_id', id)
      .eq('user_id', user.id)
      .limit(1)

    if (linkedOrders && linkedOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete financial record linked to orders. Please delete the order first.' },
        { status: 409 }
      )
    }

    // Delete with RLS enforcement
    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Financial record not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error deleting financial record')
      return NextResponse.json({ error: 'Failed to delete financial record' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Financial record deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in DELETE /api/financial/records/[id]')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
