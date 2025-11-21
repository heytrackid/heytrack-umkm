export const runtime = 'nodejs'

import type { NextResponse } from 'next/server'

import { createErrorResponse, createSuccessResponse } from '@/lib/api-core'
import { createGetHandler, createUpdateHandler } from '@/lib/api/crud-helpers'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { cacheInvalidation } from '@/lib/cache'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { apiLogger } from '@/lib/logger'
import { SupplierUpdateSchema } from '@/lib/validations/domains/supplier'



// GET /api/suppliers/[id] - Get single supplier
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/suppliers/[id]',
  },
  createGetHandler({
    table: 'suppliers',
    selectFields: 'id, name, contact_person, email, phone, address, notes, is_active, created_at, updated_at',
  })
)

// PUT /api/suppliers/[id] - Update supplier
export const PUT = createApiRoute(
  {
    method: 'PUT',
    path: '/api/suppliers/[id]',
    bodySchema: SupplierUpdateSchema,
  },
  createUpdateHandler(
    {
      table: 'suppliers',
      selectFields: 'id, name, contact_person, email, phone, address, notes, is_active, updated_at',
    },
    SUCCESS_MESSAGES.SUPPLIER_UPDATED
  )
)

// DELETE /api/suppliers/[id] - Delete supplier with validation
async function deleteSupplierHandler(context: RouteContext): Promise<NextResponse> {
  const { user, supabase, params } = context
  const id = params?.['id']

  if (!id) {
    return createErrorResponse('Supplier ID is required', 400)
  }

  // Check if supplier is used in ingredients
  const { data: ingredients } = await supabase
    .from('ingredients' as never)
    .select('id')
    .eq('supplier_id', id)
    .eq('user_id', user.id)
    .limit(1)

  if (ingredients && ingredients.length > 0) {
    return createErrorResponse('Cannot delete supplier with existing ingredients', 409)
  }

  // Delete supplier
  const { error } = await supabase
    .from('suppliers' as never)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    apiLogger.error({ error, id }, 'Failed to delete supplier')
    return createErrorResponse('Failed to delete supplier', 500)
  }

  cacheInvalidation.suppliers()
  return createSuccessResponse({ id }, SUCCESS_MESSAGES.SUPPLIER_DELETED)
}

export const DELETE = createApiRoute(
  {
    method: 'DELETE',
    path: '/api/suppliers/[id]',
  },
  deleteSupplierHandler
)
