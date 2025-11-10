export const runtime = 'nodejs'

import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch ingredient purchases over time
    const { data: purchases, error: purchasesError } = await supabase
      .from('ingredient_purchases')
      .select('purchase_date, quantity, total_price, ingredient:ingredients(name)')
      .eq('user_id', user.id)
      .gte('purchase_date', startDate.toISOString().split('T')[0])
      .lte('purchase_date', endDate.toISOString().split('T')[0])
      .order('purchase_date', { ascending: true })

    if (purchasesError) throw purchasesError

    // Fetch current stock levels
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('id, name, current_stock, unit, reorder_point')
      .eq('user_id', user.id)

    if (ingredientsError) throw ingredientsError

    // Group purchases by date
    const purchasesByDate = new Map<string, { purchases: number; cost: number }>()

    purchases?.forEach((purchase) => {
      const date = purchase.purchase_date || ''
      const current = purchasesByDate.get(date) || { purchases: 0, cost: 0 }
      current.purchases += 1
      current.cost += Number(purchase.total_price) || 0
      purchasesByDate.set(date, current)
    })

    // Convert to chart data
    const chartData = Array.from(purchasesByDate.entries())
      .map(([date, values]) => ({
        date,
        purchases: values.purchases,
        cost: values.cost,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate stock status
    const lowStockCount = ingredients?.filter(
      (ing) => Number(ing.current_stock) <= Number(ing.reorder_point)
    ).length || 0

    apiLogger.info(
      { userId: user.id, dataPoints: chartData.length, lowStockCount },
      'Inventory trends data fetched'
    )

    return NextResponse.json({
      success: true,
      data: {
        trends: chartData,
        summary: {
          totalIngredients: ingredients?.length || 0,
          lowStockCount,
          totalPurchases: purchases?.length || 0,
        },
      },
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/charts/inventory-trends')
  }
}

const SECURED_GET = withSecurity(GET, SecurityPresets.basic())
export { SECURED_GET as GET }
export const GET_SECURED = withSecurity(GET, SecurityPresets.enhanced())
