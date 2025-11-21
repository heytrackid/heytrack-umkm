// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards'
import { OperationalCostUpdateSchema } from '@/lib/validations/domains/finance'
import type { Update } from '@/types/database'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createErrorResponse, createSuccessResponse } from '@/lib/api-core/responses'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { createClient } from '@/utils/supabase/server'

// GET /api/operational-costs/[id] - Get single operational cost
async function getHandler(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid operational cost ID format' }, { status: 400 })
    }
    
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const supabase = await createClient()

    // Fetch operational cost (RLS handles user_id filtering)
    const { data, error } = await supabase
      .from('operational_costs')
      .select('id, user_id, name, amount, frequency, category, created_at, updated_at')
      .eq('id', id)
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return createErrorResponse('Operational cost not found', 404)
      }
      apiLogger.error({ error }, 'Error fetching operational cost')
      return createErrorResponse('Failed to fetch operational cost', 500)
    }

    return createSuccessResponse(data)
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/operational-costs/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// PUT /api/operational-costs/[id] - Update operational cost
async function putHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return createErrorResponse('Invalid operational cost ID format', 400)
    }
    
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const supabase = await createClient()

    const body = await request.json() as unknown

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

    const validatedData = validation['data']

    // Build update object
    const updatePayload: Update<'operational_costs'> = {
      ...(validatedData.category !== undefined && { category: validatedData.category }),
      ...(validatedData.amount !== undefined && { amount: validatedData.amount }),
      ...(validatedData.description !== undefined && { description: validatedData.description }),
      ...(validatedData.date !== undefined && { date: validatedData.date }),
      ...(validatedData.recurring !== undefined && { recurring: validatedData.recurring }),
      ...(validatedData.frequency !== undefined && { frequency: validatedData.frequency }),
      ...(validatedData.supplier !== undefined && { supplier: validatedData.supplier }),
      ...(validatedData.reference !== undefined && { reference: validatedData.reference }),
      ...(validatedData.payment_method !== undefined && { payment_method: validatedData.payment_method }),
      ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
      ...(validatedData.is_active !== undefined && { is_active: validatedData.is_active }),
      updated_at: new Date().toISOString()
    }
    const { data, error } = await supabase
      .from('operational_costs')
      .update(updatePayload as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return createErrorResponse('Operational cost not found', 404)
      }
      apiLogger.error({ error }, 'Error updating operational cost')
      return createErrorResponse('Failed to update operational cost', 500)
    }

    return createSuccessResponse(data, SUCCESS_MESSAGES.OPERATIONAL_COST_UPDATED)
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PUT /api/operational-costs/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// DELETE /api/operational-costs/[id] - Delete operational cost
async function deleteHandler(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return createErrorResponse('Invalid operational cost ID format', 400)
    }
    
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const supabase = await createClient()

    // Delete with RLS enforcement
    const { error } = await supabase
      .from('operational_costs')
      .delete()
      .eq('id', id)

    if (error) {
      if (error['code'] === 'PGRST116') {
        return createErrorResponse('Operational cost not found', 404)
      }
      apiLogger.error({ error }, 'Error deleting operational cost')
      return createErrorResponse('Failed to delete operational cost', 500)
    }

    return createSuccessResponse(null, SUCCESS_MESSAGES.OPERATIONAL_COST_DELETED)
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in DELETE /api/operational-costs/[id]')
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/operational-costs/[id]', SecurityPresets.enhanced())
export const PUT = createSecureHandler(putHandler, 'PUT /api/operational-costs/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureHandler(deleteHandler, 'DELETE /api/operational-costs/[id]', SecurityPresets.enhanced())
