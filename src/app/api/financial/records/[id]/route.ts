import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'

type FinancialRecord = Database['public']['Tables']['financial_records']['Row']

/**
 * DELETE /api/financial/records/[id]
 * Delete a financial record
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Check if record exists and belongs to user
    const { data: record, error: fetchError } = await supabase
      .from('financial_records')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !record) {
      return NextResponse.json(
        { error: 'Financial record not found' },
        { status: 404 }
      )
    }

    // Note: 'source' field removed from schema
    // TODO: Re-implement source tracking if needed for auto-sync prevention

    // Delete the record
    const { error: deleteError } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      apiLogger.error({ error: deleteError }, 'Error deleting financial record')
      return NextResponse.json(
        { error: 'Failed to delete financial record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Financial record deleted successfully'
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in DELETE /api/financial/records/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/financial/records/[id]
 * Update a financial record
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { description, category, amount, date } = body

    // Check if record exists and belongs to user
    const { data: record, error: fetchError } = await supabase
      .from('financial_records')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !record) {
      return NextResponse.json(
        { error: 'Financial record not found' },
        { status: 404 }
      )
    }

    // Note: 'source' field removed from schema
    // TODO: Re-implement source tracking if needed for auto-sync prevention

    // Build update object with proper typing
    const updates: Partial<FinancialRecord> = {}
    if (description !== undefined) updates.description = description
    if (category !== undefined) updates.category = category
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount' },
          { status: 400 }
        )
      }
      updates.amount = amount
    }
    if (date !== undefined) updates.date = date

    // Update the record - Workaround: Supabase SSR type inference issue
    const { data: updatedRecord, error: updateError } = await supabase
      .from('financial_records')
      .update(updates as any)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      apiLogger.error({ error: updateError }, 'Error updating financial record')
      return NextResponse.json(
        { error: 'Failed to update financial record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedRecord
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in PATCH /api/financial/records/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
