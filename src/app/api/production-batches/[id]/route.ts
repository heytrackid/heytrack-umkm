import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { isValidUUID, isProductionBatch, extractFirst, isRecord, safeString } from '@/lib/type-guards'

export async function PUT(
  request: NextRequest,
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
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const body = await request.json()

    // ✅ Update with RLS (user_id filter)
    const { data: batch, error } = await supabase
      .from('productions')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        recipe:recipes(name)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new APIError('Production batch not found', 404, 'NOT_FOUND')
      }
      apiLogger.error({ error, userId: user.id, batchId: id }, 'Failed to update production batch')
      throw error
    }

    // ✅ V2: Validate production batch with type guard
    if (!isProductionBatch(batch)) {
      apiLogger.error({ batch }, 'Invalid production batch structure')
      throw new APIError('Invalid data structure', 500, 'INVALID_DATA')
    }

    // ✅ V2: Safe extraction of joined recipe data
    const recipe = extractFirst(batch.recipe)
    const recipeName = recipe && isRecord(recipe) ? safeString(recipe.name, 'Unknown') : 'Unknown'

    // ✅ Map database columns to expected format
    const mappedBatch = {
      ...batch,
      batch_number: batch.id.slice(0, 8).toUpperCase(),
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

export async function DELETE(
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
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    // ✅ Delete with RLS (user_id filter)
    const { error } = await supabase
      .from('productions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      apiLogger.error({ error, userId: user.id, batchId: id }, 'Failed to delete production batch')
      throw error
    }

    return NextResponse.json({ message: 'Production batch deleted successfully' })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
