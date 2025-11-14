export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const body = await request.json()
    const { ingredients } = body

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingredients array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Limit to 1000 rows per import
    if (ingredients.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 ingredients per import' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Prepare data for insertion
    const ingredientsToInsert = ingredients.map((ing: {
      name: string
      category?: string
      unit: string
      price_per_unit: number
      current_stock: number
      reorder_point: number
      supplier?: string
    }) => ({
      name: ing.name,
      category: ing.category || null,
      unit: ing.unit,
      price_per_unit: ing.price_per_unit,
      current_stock: ing.current_stock,
      reorder_point: ing.reorder_point,
      min_stock: ing.reorder_point, // Use reorder_point as min_stock
      supplier: ing.supplier || null,
      user_id: user.id,
    }))

    // Insert in batches of 100
    const batchSize = 100
    const results: unknown[] = []
    const errors: Array<{ batch: number; error: string }> = []

    for (let i = 0; i < ingredientsToInsert.length; i += batchSize) {
      const batch = ingredientsToInsert.slice(i, i + batchSize)

      const { data, error } = await supabase
        .from('ingredients')
        .insert(batch as never[])
        .select()

      if (error) {
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: error.message,
        })
      } else {
        results.push(...(data || []))
      }
    }

    return NextResponse.json({
      data: {
        imported: results.length,
        total: ingredients.length,
        failed: ingredients.length - results.length,
        errors,
      },
    })
  } catch (error) {
    return handleAPIError(error, 'POST /api/import/ingredients')
  }
}

const securedPOST = withSecurity(POST, SecurityPresets.enhanced())
export { securedPOST as POST }
