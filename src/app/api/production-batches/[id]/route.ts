// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'

import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { isValidUUID, isProductionBatch, extractFirst, isRecord, safeString } from '@/lib/type-guards'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createClient } from '@/utils/supabase/server'

async function putHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params
  
  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid production batch ID format' }, { status: 400 })
  }
  
  try {
    const supabase = await createClient()
    
    // ✅ Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
    }

    const body = await request.json() as Record<string, unknown>

    // ✅ Update with RLS (user_id filter)
    const { data: batch, error } = await supabase
      .from('productions')
      .update(body)
      .eq('id', id)
      .eq('user_id', user['id'])
      .select(`
        *,
        recipe:recipes(name)
      `)
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        throw new APIError('Production batch not found', { status: 404, code: 'NOT_FOUND' })
      }
      apiLogger.error({ error, userId: user['id'], batchId: id }, 'Failed to update production batch')
      throw error
    }

    // ✅ V2: Validate production batch with type guard
    if (!isProductionBatch(batch)) {
      apiLogger.error({ batch }, 'Invalid production batch structure')
      throw new APIError('Invalid data structure', { status: 500, code: 'INVALID_DATA' })
    }

    // ✅ V2: Safe extraction of joined recipe data
    const recipe = extractFirst(batch.recipe)
    const recipeName = recipe && isRecord(recipe) ? safeString(recipe.name, 'Unknown') : 'Unknown'

    // ✅ Map database columns to expected format
    const mappedBatch = {
      ...batch,
      batch_number: batch['id'].slice(0, 8).toUpperCase(),
      planned_date: batch.created_at,
      actual_cost: batch.total_cost,
      recipe_name: recipeName,
      unit: 'pcs' // Default unit since recipes table doesn't have unit field
    }

    return NextResponse.json(mappedBatch)
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

async function deleteHandler(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid production batch ID format' }, { status: 400 })
  }
  
  try {
    const supabase = await createClient()
    
    // ✅ Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new APIError('Unauthorized', { status: 401, code: 'AUTH_REQUIRED' })
    }

    // ✅ Delete with RLS (user_id filter)
    const { error } = await supabase
      .from('productions')
      .delete()
      .eq('id', id)
      .eq('user_id', user['id'])

    if (error) {
      apiLogger.error({ error, userId: user['id'], batchId: id }, 'Failed to delete production batch')
      throw error
    }

    return NextResponse.json({ message: 'Production batch deleted successfully' })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

export const PUT = createSecureHandler(putHandler, 'PUT /api/production-batches/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureHandler(deleteHandler, 'DELETE /api/production-batches/[id]', SecurityPresets.enhanced())
