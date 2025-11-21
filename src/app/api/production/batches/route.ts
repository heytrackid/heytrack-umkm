export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-core/responses'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { PRODUCTION_FIELDS } from '@/lib/database/query-fields'
import { ProductionBatchCreateSchema } from '@/lib/validations/domains/production'
import type { ProductionBatchInsert } from '@/types/database'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = await createClient()

    let query = supabase
      .from('production_batches')
      .select(`
        *,
        recipes (
          id,
          name,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return createSuccessResponse(data)
  } catch (error) {
    return handleAPIError(error, 'GET /api/production/batches')
  }
}

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const body = await request.json()

    // Validate input
    const validation = ProductionBatchCreateSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse('Data tidak valid', 400)
    }

    const supabase = await createClient()

    // Create batch
    const insertData: ProductionBatchInsert = {
      ...validation.data,
      user_id: user.id,
    }

    const { data, error } = await supabase
      .from('production_batches')
      .insert(insertData as ProductionBatchInsert)
      .select(PRODUCTION_FIELDS.LIST)
      .single()

    if (error) throw error

    return createSuccessResponse(data, undefined, undefined, 201)
  } catch (error) {
    return handleAPIError(error, 'POST /api/production/batches')
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/production/batches', SecurityPresets.enhanced())
export const POST = createSecureHandler(postHandler, 'POST /api/production/batches', SecurityPresets.enhanced())
