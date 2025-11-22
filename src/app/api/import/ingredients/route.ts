export const runtime = 'nodejs'
import { handleAPIError } from '@/lib/errors/api-error-handler'

import { SecurityPresets } from '@/utils/security/api-middleware'

import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { INGREDIENT_FIELDS } from '@/lib/database/query-fields'
import { apiLogger } from '@/lib/logger'
import { typed } from '@/types/type-utilities'
import type { BulkImport } from '@/lib/validations/domains/ingredient'

import type { NextResponse } from 'next/server'

type BulkImportBody = BulkImport

// POST /api/import/ingredients - Bulk import ingredients
async function importIngredientsHandler(
  context: RouteContext,
  _query?: never,
  body?: BulkImportBody
): Promise<NextResponse> {
  const { user, supabase } = context

  if (!body) {
    return handleAPIError(new Error('Request body is required'), 'API Route')
  }

  const { ingredients } = body

  // Prepare data for insertion with user context
  const ingredientsToInsert = ingredients.map((ing) => ({
    name: ing.name,
    category: ing.category || null,
    unit: ing.unit,
    price_per_unit: ing.price_per_unit,
    current_stock: ing.current_stock,
    reorder_point: ing.reorder_point,
    min_stock: ing.reorder_point,
    supplier: ing.supplier || null,
    user_id: user.id,
    created_by: user.id,
    updated_by: user.id,
  }))

  // Insert in batches of 100
  const batchSize = 100
  const results: unknown[] = []
  const errors: Array<{ batch: number; error: string }> = []

  for (let i = 0; i < ingredientsToInsert.length; i += batchSize) {
    const batch = ingredientsToInsert.slice(i, i + batchSize)

    const { data, error } = await typed(supabase)
      .from('ingredients')
      .insert(batch as never[])
      .select(INGREDIENT_FIELDS.LIST)

    if (error) {
      apiLogger.error({ error, batchIndex: i }, 'Failed to insert ingredient batch')
      errors.push({
        batch: Math.floor(i / batchSize) + 1,
        error: error.message,
      })
    } else {
      results.push(...(data || []))
    }
  }

  return createSuccessResponse({
    imported: results.length,
    total: ingredients.length,
    failed: ingredients.length - results.length,
    errors,
  }, SUCCESS_MESSAGES.INGREDIENT_IMPORTED)
}

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/import/ingredients',
    securityPreset: SecurityPresets.basic(),
  },
  importIngredientsHandler
)
