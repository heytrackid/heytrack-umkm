export const runtime = 'nodejs'

import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'


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

    // Use typed supabase client to avoid type inference issues
    const typedSupabase = supabase

    // Fetch ingredient purchases over time
    const { data: purchases, error: purchasesError } = await typedSupabase
      .from('ingredient_purchases')
      .select('purchase_date, quantity, total_price, ingredient:ingredients(name)')
      .eq('user_id', user.id)
      .gte('purchase_date', startDate.toISOString().split('T')[0])
      .lte('purchase_date', endDate.toISOString().split('T')[0])
      .order('purchase_date', { ascending: true })

    if (purchasesError) throw purchasesError

    // Fetch current stock levels
    const { data: ingredients, error: ingredientsError } = await typedSupabase
      .from('ingredients')
      .select('id, name, current_stock, reorder_point')
      .eq('user_id', user.id)

    if (ingredientsError) throw ingredientsError

    const rawPurchases = purchases as unknown as Array<{
      purchase_date: string | null
      quantity: number | null
      total_price: number | null
      ingredient: { name: string | null } | null
    } | null> | null
    const rawIngredients = ingredients as Array<{
      id: string
      name: string | null
      current_stock: number | null
      reorder_point: number | null
    } | null> | null

    // Group purchases by date
    const purchasesByDate = new Map<string, { purchases: number; cost: number }>()

    rawPurchases?.forEach((purchase) => {
      if (!purchase) return
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
    const lowStockCount = rawIngredients?.filter(
      (ing) => ing && Number(ing.current_stock) <= Number(ing.reorder_point)
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
  } catch (error: unknown) {
    return handleAPIError(error, 'GET /api/charts/inventory-trends')
  }
}

const SECURED_GET = withSecurity(GET, SecurityPresets.basic())
export { SECURED_GET as GET }
export const GET_SECURED = withSecurity(GET, SecurityPresets.enhanced())
