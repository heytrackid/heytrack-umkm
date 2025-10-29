import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // ✅ Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const body = await request.json()
    const { id } = params

    // ✅ Update with RLS (user_id filter)
    const { data: batch, error } = await supabase
      .from('productions')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        recipe:recipes(name, unit)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new APIError('Production batch not found', 404, 'NOT_FOUND')
      }
      apiLogger.error({ error, userId: user.id, batchId: id }, 'Failed to update production batch')
      throw error
    }

    // ✅ Map database columns to expected format
    const mappedBatch = {
      ...batch,
      batch_number: batch.id.slice(0, 8).toUpperCase(),
      planned_date: batch.created_at,
      actual_cost: batch.total_cost,
      unit: Array.isArray(batch.recipe) ? batch.recipe[0]?.unit : batch.recipe?.unit || 'pcs'
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
  try {
    const supabase = await createClient()
    
    // ✅ Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const { id } = params

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
