export const runtime = 'nodejs'

import { isLowStock, validateStockAvailability } from '@/lib/business-rules/inventory'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ValidateStockItemSchema = z.object({
  ingredientId: z.string().uuid(),
  requiredQuantity: z.number().min(0),
})

const ValidateStockSchema = z.object({
  items: z.array(ValidateStockItemSchema).min(1, 'At least one item is required'),
})

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/ingredients/validate-stock',
    bodySchema: ValidateStockSchema,
    securityPreset: SecurityPresets.enhanced(),
  },
  async (context: RouteContext, _query, body) => {
    const { user, supabase } = context
    const { items } = body!

    // Get all ingredients
    const ingredientIds = items.map((item) => item.ingredientId)
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
    const validationResults = items.map((item) => {
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
  }
)
