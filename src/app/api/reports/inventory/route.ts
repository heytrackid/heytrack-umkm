export const runtime = 'nodejs'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getHandler(_request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('id, name, category, current_stock, reorder_point, price_per_unit, unit')
      .eq('user_id', user.id)
      .order('name')

    if (error) throw error

    type IngredientData = {
      id: string
      name: string
      category: string | null
      current_stock: number | null
      reorder_point: number | null
      price_per_unit: number
      unit: string
    }
    const ingredientsList = (ingredients || []) as IngredientData[]

    // Calculate summary
    const totalItems = ingredientsList.length
    const totalValue = ingredientsList.reduce(
      (sum, item) => sum + ((item.current_stock || 0) * item.price_per_unit),
      0
    )
    const lowStockItems = ingredientsList.filter(
      (item) => (item.current_stock || 0) <= (item.reorder_point || 0)
    )
    const outOfStockItems = ingredientsList.filter((item) => (item.current_stock || 0) === 0)

    // Group by category
    const byCategory: Record<string, { category: string; items: number; value: number }> = {}

    ingredientsList.forEach((item) => {
      const category = item.category || 'Uncategorized'
      if (!byCategory[category]) {
        byCategory[category] = { category, items: 0, value: 0 }
      }
      byCategory[category].items += 1
      byCategory[category].value += (item.current_stock || 0) * item.price_per_unit
    })

    const report = {
      summary: {
        totalItems,
        totalValue,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
      },
      lowStockItems: lowStockItems.map((item) => ({
        id: item.id,
        name: item.name,
        currentStock: item.current_stock || 0,
        reorderPoint: item.reorder_point || 0,
        unit: item.unit,
      })),
      outOfStockItems: outOfStockItems.map((item) => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
      })),
      byCategory: Object.values(byCategory).sort((a, b) => b.value - a.value),
      topValueItems: ingredientsList
        .map((item) => ({
          id: item.id,
          name: item.name,
          stock: item.current_stock || 0,
          value: (item.current_stock || 0) * item.price_per_unit,
          unit: item.unit,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10),
    }

    return NextResponse.json({ data: report })
  } catch (error) {
    return handleAPIError(error, 'GET /api/reports/inventory')
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/reports/inventory', SecurityPresets.enhanced())
