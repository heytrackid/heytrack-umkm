// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { cacheInvalidation } from '@/lib/cache'
import { apiLogger } from '@/lib/logger'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards'
import type { Update } from '@/types/database'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'



interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/suppliers/[id] - Get single supplier
async function getSupplier(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid supplier ID format' }, { status: 400 })
    }
    
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name, contact_person, email, phone, address, notes, is_active, created_at, updated_at, user_id')
      .eq('id', id)
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error fetching supplier')
      return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/suppliers/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/suppliers/[id] - Update supplier
async function updateSupplier(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid supplier ID format' }, { status: 400 })
    }
    
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const supabase = await createClient()
    const body = await request.json() as Update<'suppliers'>
    const updatePayload = body

    const { data, error } = await supabase
      .from('suppliers')
      .update(updatePayload as never)
      .eq('id', id)
      .select('id, name, contact_person, email, phone, address, notes, is_active, updated_at')
      .single()

    if (error) {
      if (error['code'] === 'PGRST116') {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
      }
      if (error['code'] === '23505') {
        return NextResponse.json({ error: 'Supplier with this email already exists' }, { status: 409 })
      }
      apiLogger.error({ error }, 'Error updating supplier')
      return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 })
    }
    cacheInvalidation.suppliers()

    return NextResponse.json(data)
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PUT /api/suppliers/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/suppliers/[id] - Delete supplier
async function deleteSupplier(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context['params']
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid supplier ID format' }, { status: 400 })
    }
    
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const _user = authResult

    const supabase = await createClient()
    // Check if supplier is used in ingredients (RLS handles user_id filtering)
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('id')
      .eq('supplier_id', id)
      .limit(1)
    
    if (ingredients && ingredients.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier with existing ingredients' },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)

    if (error) {
      apiLogger.error({ error }, 'Error deleting supplier')
      return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 })
    }

    cacheInvalidation.suppliers()
    return NextResponse.json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in DELETE /api/suppliers/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Apply security middleware
export const GET = withSecurity(getSupplier, SecurityPresets.enhanced())
export const PUT = withSecurity(updateSupplier, SecurityPresets.enhanced())
export const DELETE = withSecurity(deleteSupplier, SecurityPresets.enhanced())
