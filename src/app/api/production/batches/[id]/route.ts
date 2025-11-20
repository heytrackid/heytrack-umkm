export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import {
  ProductionBatchUpdateSchema,
  VALID_PRODUCTION_STATUS_TRANSITIONS,
} from '@/lib/validations/domains/production'
import { triggerWorkflow } from '@/lib/automation/workflows/index'
import type { ProductionBatchUpdate } from '@/types/database'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type _ProductionBatchUpdate = ProductionBatchUpdate

async function getHandler(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { id } = params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('production_batches')
      .select(
        `
        *,
        recipes (
          id,
          name,
          category,
          serving_size
        )
      `
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Batch produksi tidak ditemukan' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    return handleAPIError(error, 'GET /api/production/batches/[id]')
  }
}

async function putHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { id } = params
    const body = await request.json()

    // Validate input
    const validation = ProductionBatchUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Data tidak valid',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // If status is being updated, validate transition
    if (validation.data.status) {
      const { data: currentBatch, error: fetchError } = await supabase
        .from('production_batches')
        .select('status')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return NextResponse.json({ error: 'Batch produksi tidak ditemukan' }, { status: 404 })
        }
        throw fetchError
      }

      const batchData = currentBatch as { status: string }
      const allowedTransitions = VALID_PRODUCTION_STATUS_TRANSITIONS[batchData.status]
      if (!allowedTransitions.includes(validation.data.status)) {
        return NextResponse.json(
          {
            error: `Tidak dapat mengubah status dari "${batchData.status}" ke "${validation.data.status}"`,
            current_status: batchData.status,
            allowed_transitions: allowedTransitions,
          },
          { status: 400 }
        )
      }
    }

    // Update batch
    const { data, error } = await supabase
      .from('production_batches')
      .update(validation.data as never)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Batch produksi tidak ditemukan' }, { status: 404 })
      }
      throw error
    }

    // Trigger workflow if status changed to completed
    if (validation.data.status === 'completed') {
      try {
        await triggerWorkflow('production.completed', id)
      } catch (workflowError) {
        // Log but don't fail the main operation
        console.error('Failed to trigger production completion workflow:', workflowError)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleAPIError(error, 'PUT /api/production/batches/[id]')
  }
}

async function deleteHandler(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { id } = params
    const supabase = await createClient()

    // Check if batch can be deleted (only planned or cancelled batches)
    const { data: batch, error: fetchError } = await supabase
      .from('production_batches')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Batch produksi tidak ditemukan' }, { status: 404 })
      }
      throw fetchError
    }

    const batchData = batch as { status: string }
    if (batchData.status === 'in_progress' || batchData.status === 'completed') {
      return NextResponse.json(
        {
          error: `Tidak dapat menghapus batch dengan status "${batchData.status}"`,
          hint: 'Hanya batch dengan status "planned" atau "cancelled" yang dapat dihapus',
        },
        { status: 400 }
      )
    }

    // Delete batch
    const { error } = await supabase
      .from('production_batches')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ message: 'Batch produksi berhasil dihapus' })
  } catch (error) {
    return handleAPIError(error, 'DELETE /api/production/batches/[id]')
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/production/batches/[id]', SecurityPresets.enhanced())
export const PUT = createSecureHandler(putHandler, 'PUT /api/production/batches/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureHandler(deleteHandler, 'DELETE /api/production/batches/[id]', SecurityPresets.enhanced())
