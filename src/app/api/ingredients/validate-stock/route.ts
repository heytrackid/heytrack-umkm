export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { isLowStock, validateStockAvailability } from '@/lib/business-rules/inventory'
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
    const { items } = body // Array of { ingredientId, requiredQuantity }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get all ingredients
    const ingredientIds = items.map((item: { ingredientId: string }) => item.ingredientId)
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('id, name, current_stock, reorder_point, unit')
      .in('id', ingredientIds)
      .eq('user_id', user.id)

    if (ingredientsError) throw ingredientsError

    type IngredientData = { id: string; name: string; current_stock: number | null; reorder_point: number | null; unit: string }
    const ingredientMap = new Map(
      ((ingredients || []) as IngredientData[]).map((ing) => [ing.id, ing])
    )

    // Validate each item
    const validationResults = items.map((item: { ingredientId: string; requiredQuantity: number }) => {
      const ingredient = ingredientMap.get(item.ingredientId)

      if (!ingredient) {
        return {
          ingredientId: item.ingredientId,
          valid: false,
          error: 'Ingredient not found',
        }
      }

      const stockValidation = validateStockAvailability(
        item.requiredQuantity,
        ingredient.current_stock || 0,
        0 // No reserved stock for now
      )

      const lowStock = isLowStock(ingredient.current_stock || 0, ingredient.reorder_point || 0)

      return {
        ingredientId: item.ingredientId,
        ingredientName: ingredient.name,
        requiredQuantity: item.requiredQuantity,
        currentStock: ingredient.current_stock || 0,
        unit: ingredient.unit,
        available: stockValidation.available,
        availableQuantity: stockValidation.availableQuantity,
        shortfall: stockValidation.shortfall,
        lowStock,
        reorderPoint: ingredient.reorder_point || 0,
      }
    })

    const allValid = validationResults.every((result) => result.available)
    const lowStockItems = validationResults.filter((result) => result.lowStock)

    return NextResponse.json({
      data: {
        valid: allValid,
        items: validationResults,
        lowStockWarning: lowStockItems.length > 0,
        lowStockItems,
      },
    })
  } catch (error) {
    return handleAPIError(error, 'POST /api/ingredients/validate-stock')
  }
}

const securedPOST = withSecurity(POST, SecurityPresets.enhanced())
export { securedPOST as POST }
