export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-core/responses'
import { triggerWorkflow } from '@/lib/automation/workflows/index'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import {
    ProductionBatchUpdateSchema,
    VALID_PRODUCTION_STATUS_TRANSITIONS,
} from '@/lib/validations/domains/production'
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
        return createErrorResponse(ERROR_MESSAGES.PRODUCTION_BATCH_NOT_FOUND, 404)
      }
      throw error
    }

    return createSuccessResponse(data)
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
      return createErrorResponse('Data tidak valid', 400, validation.error.issues.map(i => i.message))
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
          return createErrorResponse(ERROR_MESSAGES.PRODUCTION_BATCH_NOT_FOUND, 404)
        }
        throw fetchError
      }

      const batchData = currentBatch as { status: string }
      const allowedTransitions = VALID_PRODUCTION_STATUS_TRANSITIONS[batchData.status]
      if (!allowedTransitions.includes(validation.data.status)) {
        return createErrorResponse(
          `Tidak dapat mengubah status dari "${batchData.status}" ke "${validation.data.status}"`,
          400
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
        return createErrorResponse(ERROR_MESSAGES.PRODUCTION_BATCH_NOT_FOUND, 404)
      }
      throw error
    }

    // Trigger workflow if status changed to completed
    if (validation.data.status === 'completed') {
      try {
        await triggerWorkflow('production.completed', id)
      } catch (workflowError) {
        // Log but don't fail the main operation
        apiLogger.error({ error: workflowError, batchId: id }, 'Failed to trigger production completion workflow')
      }
    }

    return createSuccessResponse(data, SUCCESS_MESSAGES.PRODUCTION_BATCH_UPDATED)
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
        return createErrorResponse(ERROR_MESSAGES.PRODUCTION_BATCH_NOT_FOUND, 404)
      }
      throw fetchError
    }

    const batchData = batch as { status: string }
    if (batchData.status === 'in_progress' || batchData.status === 'completed') {
      return createErrorResponse(
        `Tidak dapat menghapus batch dengan status "${batchData.status}"`,
        400
      )
    }

    // Delete batch
    const { error } = await supabase
      .from('production_batches')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return createSuccessResponse(null, SUCCESS_MESSAGES.PRODUCTION_BATCH_DELETED)
  } catch (error) {
    return handleAPIError(error, 'DELETE /api/production/batches/[id]')
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/production/batches/[id]', SecurityPresets.enhanced())
export const PUT = createSecureHandler(putHandler, 'PUT /api/production/batches/[id]', SecurityPresets.enhanced())
export const DELETE = createSecureHandler(deleteHandler, 'DELETE /api/production/batches/[id]', SecurityPresets.enhanced())
