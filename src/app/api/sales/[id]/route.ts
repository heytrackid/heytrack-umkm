// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextResponse } from 'next/server'

import { apiLogger, logError } from '@/lib/logger'
import { prepareUpdate } from '@/lib/supabase/insert-helpers'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'





async function getSale(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid sale ID format' }, { status: 400 })
  }

  try {
    apiLogger.info({ saleId: id }, 'GET /api/sales/[id] - Request received')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'GET /api/sales/[id] - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: sale, error } = await supabase
      .from('financial_records')
      .select(`
        *
      `)
      .eq('id', id)
      .eq('user_id', user['id'])
      .eq('record_type', 'INCOME')
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sale record not found' },
          { status: 404 }
        )
      }
      logError(apiLogger, error, 'GET /api/sales/[id] - Database error')
      return NextResponse.json(
        { error: error.message || 'Failed to fetch sale record' },
        { status: 500 }
      )
    }

    apiLogger.info({ saleId: id, userId: user['id'] }, 'GET /api/sales/[id] - Success')
    return NextResponse.json(sale)
  } catch (error: unknown) {
    logError(apiLogger, error, 'GET /api/sales/[id] - Unexpected error')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

async function updateSale(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid sale ID format' }, { status: 400 })
  }

  try {
    apiLogger.info({ saleId: id }, 'PUT /api/sales/[id] - Request received')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'PUT /api/sales/[id] - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as Record<string, unknown>
    const updatePayload = prepareUpdate('financial_records', body)

    const { data: sale, error } = await supabase
      .from('financial_records')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user['id'])
      .eq('record_type', 'INCOME')
      .select(`
        *
      `)
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sale record not found' },
          { status: 404 }
        )
      }
      logError(apiLogger, error, 'PUT /api/sales/[id] - Database error')
      return NextResponse.json(
        { error: error.message || 'Failed to update sale record' },
        { status: 500 }
      )
    }

    apiLogger.info({ saleId: id, userId: user['id'] }, 'PUT /api/sales/[id] - Success')
    return NextResponse.json(sale)
  } catch (error: unknown) {
    logError(apiLogger, error, 'PUT /api/sales/[id] - Unexpected error')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

async function deleteSale(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Validate UUID format
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Invalid sale ID format' }, { status: 400 })
  }

  try {
    apiLogger.info({ saleId: id }, 'DELETE /api/sales/[id] - Request received')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'DELETE /api/sales/[id] - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id)
      .eq('user_id', user['id'])
      .eq('record_type', 'INCOME')

    if (error) {
      logError(apiLogger, error, 'DELETE /api/sales/[id] - Database error')
      return NextResponse.json(
        { error: error.message || 'Failed to delete sale record' },
        { status: 500 }
      )
    }

    apiLogger.info({ saleId: id, userId: user['id'] }, 'DELETE /api/sales/[id] - Success')
    return NextResponse.json({ message: 'Sale deleted successfully' })
  } catch (error) {
    logError(apiLogger, error, 'DELETE /api/sales/[id] - Unexpected error')
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// Apply security middleware
export const GET = withSecurity(getSale, SecurityPresets.enhanced())
export const PUT = withSecurity(updateSale, SecurityPresets.enhanced())
export const DELETE = withSecurity(deleteSale, SecurityPresets.enhanced())
