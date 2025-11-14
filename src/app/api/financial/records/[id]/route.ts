// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { apiLogger } from '@/lib/logger'
import { FinancialRecordUpdateSchema, type FinancialRecordUpdate } from '@/lib/validations/domains/finance'
import type { Update } from '@/types/database'
import { createSecureRouteHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

// GET /api/financial/records/[id] - Get single financial record
async function getHandler(
  _request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  try {
    // Authenticate
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const awaitedParams = await params
    const id = awaitedParams['id']
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Fetch financial record (RLS will filter by user_id automatically)
    const { data, error } = await supabase
      .from('financial_records')
      .select('id, user_id, date, description, category, amount, reference, type, created_at, created_by')
      .eq('id', id)
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json({ error: 'Financial record not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error fetching financial record')
      return NextResponse.json({ error: 'Failed to fetch financial record' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    apiLogger.error({ error }, 'Error in GET /api/financial/records/[id]')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/financial/records/[id] - Update financial record
async function putHandler(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  try {
    // Authenticate
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const awaitedParams = await params
    const id = awaitedParams['id']
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    
    const supabase = await createClient()
    const body = await request.json() as FinancialRecordUpdate

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

    const validatedData = validation['data']

    // Build update object (only fields that exist in financial_records table)
    const updatePayload: Update<'financial_records'> = {
      ...(validatedData.date !== undefined && { date: validatedData.date || null }),
      ...(validatedData['type'] !== undefined && { type: validatedData['type'] }),
      ...(validatedData.category !== undefined && { category: validatedData.category }),
      ...(validatedData.amount !== undefined && { amount: validatedData.amount }),
      ...(validatedData.description !== undefined && { description: validatedData.description ?? '' }),
      ...(validatedData.reference_id !== undefined && { reference: validatedData.reference_id ?? null })
    }

    // Update with RLS enforcement (RLS will filter by user_id automatically)
     
    const { data, error } = await (supabase
      .from('financial_records') as any)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json({ error: 'Financial record not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error updating financial record')
      return NextResponse.json({ error: 'Failed to update financial record' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    apiLogger.error({ error }, 'Error in PUT /api/financial/records/[id]')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/financial/records/[id] - Delete financial record
async function deleteHandler(
  _request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
): Promise<NextResponse> {
  try {
    // Authenticate
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const awaitedParams = await params
    const id = awaitedParams['id']
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    
    const supabase = await createClient()

    // Check if record is linked to orders or other entities (RLS will filter by user_id)
    const { data: linkedOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('financial_record_id', id)
      .limit(1)

    if (linkedOrders && linkedOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete financial record linked to orders. Please delete the order first.' },
        { status: 409 }
      )
    }

    // Delete with RLS enforcement (RLS will filter by user_id automatically)
    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id)

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json({ error: 'Financial record not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error deleting financial record')
      return NextResponse.json({ error: 'Failed to delete financial record' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Financial record deleted successfully' })
  } catch (error) {
    apiLogger.error({ error }, 'Error in DELETE /api/financial/records/[id]')
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = createSecureRouteHandler(getHandler, 'GET /api/financial/records/[id]', SecurityPresets.enhanced())
export const PUT = createSecureRouteHandler(putHandler, 'PUT /api/financial/records/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureRouteHandler(deleteHandler, 'DELETE /api/financial/records/[id]', SecurityPresets.enhanced())
