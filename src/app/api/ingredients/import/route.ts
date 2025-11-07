// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'

import type { Insert } from '@/types/database'


type IngredientInsert = Insert<'ingredients'>

const sanitizeString = (value?: string | null, fallback?: string | null) => {
  const trimmed = value?.trim()
  if (trimmed && trimmed.length > 0) {
    return trimmed
  }

  if (fallback !== undefined) {
    return fallback
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }    // 2. Parse CSV data from request
    const body = await request.json() as { ingredients: Array<Partial<IngredientInsert>> }
    const { ingredients } = body

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Data bahan baku tidak valid' },
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
          error: 'Validasi gagal',
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
      .insert(validIngredients)
      .select()

    if (error) {
      apiLogger.error({ error, userId: user['id'] }, 'Failed to import ingredients')
      return NextResponse.json(
        { error: 'Gagal menyimpan data bahan baku' },
        { status: 500 }
      )
    }

    apiLogger.info(
      { userId: user['id'], count: data.length },
      'Ingredients imported successfully'
    )

    return NextResponse.json({
      success: true,
      count: data.length,
      data
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/ingredients/import')
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat import' },
      { status: 500 }
    )
  }
}
