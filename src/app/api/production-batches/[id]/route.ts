// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { APIError, handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { extractFirst, isProductionBatch, isRecord, isValidUUID, safeString } from '@/lib/type-guards'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

async function putHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  
  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid production batch ID format' }, { status: 400 })
  }
  
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    const body = await request.json() as Record<string, unknown>

    // ✅ Update with RLS (user_id filter automatically applied)
    const { data: batch, error } = await supabase
      .from('productions')
      .update(body as never)
      .eq('id', id)
      .select(`
        *,
        recipe:recipes(name)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new APIError('Production batch not found', { status: 404, code: 'NOT_FOUND' })
      }
      apiLogger.error({ error, userId: user.id, batchId: id }, 'Failed to update production batch')
      throw error
    }

    // ✅ V2: Validate production batch with type guard
    if (!isProductionBatch(batch)) {
      apiLogger.error({ batch }, 'Invalid production batch structure')
      throw new APIError('Invalid data structure', { status: 500, code: 'INVALID_DATA' })
    }

    // ✅ V2: Safe extraction of joined recipe data
    const recipe = extractFirst((batch as { recipe?: unknown }).recipe)
    const recipeName = recipe && isRecord(recipe) ? safeString(recipe['name'] as string, 'Unknown') : 'Unknown'

    // ✅ Map database columns to expected format
    const typedBatch = batch as any // Type assertion to fix RLS inference
    const mappedBatch = {
      ...typedBatch,
      batch_number: typedBatch.id.slice(0, 8).toUpperCase(),
      planned_date: typedBatch.created_at,
      actual_cost: typedBatch.total_cost,
      recipe_name: recipeName,
      unit: 'pcs' // Default unit since recipes table doesn't have unit field
    }

    return NextResponse.json(mappedBatch)
  } catch (error) {
    return handleAPIError(error)
  }
}

async function deleteHandler(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid production batch ID format' }, { status: 400 })
  }
  
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    // ✅ Fetch batch first to check if it exists
    const { data: batch } = await supabase
      .from('productions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user['id'])
      .single()

    if (!batch) {
      throw new APIError('Production batch not found', { status: 404, code: 'NOT_FOUND' })
    }

    // ✅ Delete with RLS (user_id filter)
    const { error } = await supabase
      .from('productions')
      .delete()
      .eq('id', id)
      .eq('user_id', user['id'])

    if (error) {
      apiLogger.error({ error, userId: user.id, batchId: id }, 'Failed to delete production batch')
      throw error
    }

    return NextResponse.json({ message: 'Production batch deleted successfully' })
  } catch (error) {
    return handleAPIError(error)
  }
}

export const PUT = createSecureHandler(putHandler, 'PUT /api/production-batches/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureHandler(deleteHandler, 'DELETE /api/production-batches/[id]', SecurityPresets.enhanced())
