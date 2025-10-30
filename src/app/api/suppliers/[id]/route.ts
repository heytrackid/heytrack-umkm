import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'
import type { Database } from '@/types/supabase-generated'
import { getErrorMessage, isValidUUID } from '@/lib/type-guards'

type SupplierUpdate = Database['public']['Tables']['suppliers']['Update']

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/suppliers/[id] - Get single supplier
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid supplier ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name, contact_person, email, phone, address, notes, is_active, created_at, updated_at, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
      }
      apiLogger.error({ error }, 'Error fetching supplier')
      return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in GET /api/suppliers/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/suppliers/[id] - Update supplier
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid supplier ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updatePayload: SupplierUpdate = body

    const { data, error } = await supabase
      .from('suppliers')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, name, contact_person, email, phone, address, notes, is_active, updated_at')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
      }
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Supplier with this email already exists' }, { status: 409 })
      }
      apiLogger.error({ error }, 'Error updating supplier')
      return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 })
    }

    cacheInvalidation.suppliers()
    return NextResponse.json(data)
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in PUT /api/suppliers/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/suppliers/[id] - Delete supplier
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid supplier ID format' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if supplier is used in ingredients
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('id')
      .eq('supplier_id', id)
      .eq('user_id', user.id)
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
      .eq('user_id', user.id)

    if (error) {
      apiLogger.error({ error }, 'Error deleting supplier')
      return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 })
    }

    cacheInvalidation.suppliers()
    return NextResponse.json({ message: 'Supplier deleted successfully' })
  } catch (error: unknown) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Error in DELETE /api/suppliers/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}