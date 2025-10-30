import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { OperationalCostUpdateSchema } from '@/lib/validations/domains/finance'
import type { Database } from '@/types/supabase-generated'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards'

// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/operational-costs/[id] - Get single operational cost
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid operational cost ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch operational cost
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Operational cost not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error fetching operational cost')
      return NextResponse.json({ error: 'Failed to fetch operational cost' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/operational-costs/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// PUT /api/operational-costs/[id] - Update operational cost
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid operational cost ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validation = OperationalCostUpdateSchema.safeParse(body)
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

    // Build update object
    const updatePayload: Database['public']['Tables']['expenses']['Update'] = {
      category: validatedData.category,
      subcategory: validatedData.subcategory,
      amount: validatedData.amount,
      description: validatedData.description,
      expense_date: validatedData.date,
      is_recurring: validatedData.is_recurring,
      recurring_frequency: validatedData.recurring_frequency || undefined,
      supplier: validatedData.vendor_name ?? undefined,
      receipt_number: validatedData.invoice_number !== null ? validatedData.invoice_number : undefined,
      status: validatedData.is_paid ? 'paid' : 'pending',
      updated_at: new Date().toISOString()
    }

    // Update with RLS enforcement
    const { data, error } = await supabase
      .from('expenses')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Operational cost not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error updating operational cost')
      return NextResponse.json({ error: 'Failed to update operational cost' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PUT /api/operational-costs/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// DELETE /api/operational-costs/[id] - Delete operational cost
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid operational cost ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete with RLS enforcement
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Operational cost not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error deleting operational cost')
      return NextResponse.json({ error: 'Failed to delete operational cost' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Operational cost deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in DELETE /api/operational-costs/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
