// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { apiLogger } from '@/lib/logger'
import type { Insert } from '@/types/database'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

import { createSuccessResponse } from '@/lib/api-core/responses'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

type IngredientInsert = Insert<'ingredients'>

const sanitizeString = (value?: string | null, fallback?: string | null): string | null => {
  const trimmed = value?.trim()
  if (trimmed && trimmed.length > 0) {
    return trimmed
  }

  if (fallback !== undefined) {
    return fallback
  }

  return null
}

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = createServiceRoleClient()

    // 2. Parse CSV data from request
    const body = await request.json() as { ingredients: Array<Partial<IngredientInsert>> }
    const { ingredients } = body

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_DATA },
        { status: 400 }
      )
    }

    // 3. Validate and prepare data
    const validIngredients: IngredientInsert[] = []
    const errors: Array<{ row: number; error: string }> = []

    ingredients.forEach((ing, index) => {
      const rowNum = index + 2 // +2 because row 1 is header, array is 0-indexed

      // Required fields validation
      if (!ing.name || typeof ing.name !== 'string' || ing.name.trim() === '') {
        errors.push({ row: rowNum, error: 'Nama bahan wajib diisi' })
        return
      }

      if (!ing.unit || typeof ing.unit !== 'string') {
        errors.push({ row: rowNum, error: 'Satuan wajib diisi' })
        return
      }

      if (ing.price_per_unit === undefined || ing.price_per_unit === null) {
        errors.push({ row: rowNum, error: 'Harga per satuan wajib diisi' })
        return
      }

      const pricePerUnit = Number(ing.price_per_unit)
      if (isNaN(pricePerUnit) || pricePerUnit < 0) {
        errors.push({ row: rowNum, error: 'Harga per satuan harus angka positif' })
        return
      }

      // Prepare ingredient data
      const currentStock = ing.current_stock !== undefined ? Number(ing.current_stock) : 0
      const minStock = ing.min_stock !== undefined ? Number(ing.min_stock) : 0

      validIngredients.push({
        name: ing.name.trim(),
        unit: ing.unit.trim(),
        price_per_unit: pricePerUnit,
        current_stock: isNaN(currentStock) ? 0 : currentStock,
        min_stock: isNaN(minStock) ? 0 : minStock,
        weighted_average_cost: pricePerUnit, // Initial WAC = price_per_unit
        description: sanitizeString(ing.description),
        category: sanitizeString(ing.category, 'General'),
        supplier: sanitizeString(ing.supplier),
        user_id: user['id'],
        is_active: true
      })
    })

    // 4. Return validation errors if any
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.VALIDATION_FAILED,
          details: errors,
          validCount: validIngredients.length,
          errorCount: errors.length
        },
        { status: 400 }
      )
    }

    // 5. Insert ingredients in batch
    const { data, error } = await supabase
      .from('ingredients')
      .insert(validIngredients as never)
      .select()

    if (error) {
      apiLogger.error({ error, userId: user['id'] }, 'Failed to import ingredients')
      return NextResponse.json(
        { error: ERROR_MESSAGES.SAVE_FAILED },
        { status: 500 }
      )
    }

    apiLogger.info(
      { userId: user['id'], count: data.length },
      'Ingredients imported successfully'
    )

    return createSuccessResponse({ count: data.length, data }, SUCCESS_MESSAGES.INGREDIENT_IMPORTED, undefined, 201)

  } catch (error) {
    apiLogger.error({ error }, 'Error in POST /api/ingredients/import')
    return NextResponse.json(
      { error: ERROR_MESSAGES.IMPORT_ERROR },
      { status: 500 }
    )
  }
}

export const POST = createSecureHandler(postHandler, 'POST /api/ingredients/import', SecurityPresets.enhanced())
