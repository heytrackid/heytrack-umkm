// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { SecurityPresets, withSecurity } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'


// Type for alerts with recipe relation
interface AlertWithRecipe {
  id: string
  recipe_id: string
  alert_type: string
  title: string
  message: string
  severity: string
  is_read: boolean | null
  new_value: number | null
  created_at: string | null
  recipes: { name: string } | null
}

// GET /api/hpp/overview - Get comprehensive HPP overview data in one request
async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const getOverviewData = async (): Promise<{
      totalRecipes: number
      recipesWithHpp: number
      averageHpp: number
      totalAlerts: number
      unreadAlerts: number
      recentAlerts: Array<{
        id: string
        recipe_id: string
        recipe_name: string
        alert_type: string
        title: string
        message: string
        severity: string
        is_read: boolean | null
        new_value: number | null
        created_at: string | null
      }>
    }> => {
      // Parallel queries for better performance
      const [recipesResult, calculationsResult, alertsResult] = await Promise.all([
        // Get recipes count
        supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', (user as { id: string }).id)
          .eq('is_active', true),

        // Get recipes with their costs
        supabase
          .from('recipes')
          .select('id, cost_per_unit, selling_price, margin_percentage')
          .eq('user_id', (user as { id: string }).id)
          .eq('is_active', true)
          .gt('cost_per_unit', 0),

        // Get alerts data
        supabase
          .from('hpp_alerts')
          .select(`
            id,
            recipe_id,
            alert_type,
            title,
            message,
            severity,
            is_read,
            new_value,
            created_at,
            recipes:recipe_id (
              name
            )
          `)
          .eq('user_id', (user as { id: string }).id)
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      const totalRecipes = recipesResult.count ?? 0
      const recipesWithCost = calculationsResult['data'] ?? []
      const alertsRaw = alertsResult['data'] ?? []

      // Calculate average HPP
      const averageHpp = recipesWithCost.length > 0
        ? recipesWithCost.reduce((sum, r) => sum + (Number((r as { cost_per_unit: number | null }).cost_per_unit) || 0), 0) / recipesWithCost.length
        : 0

      const recipesWithHpp = recipesWithCost.length

      // Process alerts data - handle Supabase join structure
      const alertsData: AlertWithRecipe[] = alertsRaw.map((alert) => {
        const alertWithRecipes = alert as { recipes: unknown }
        return {
          ...alert,
          recipes: Array.isArray(alertWithRecipes.recipes) ? alertWithRecipes.recipes[0] as { name: string } | null : alertWithRecipes.recipes as { name: string } | null
        }
      })

      const totalAlerts = alertsData.length
      const unreadAlerts = alertsData.filter(alert => !alert.is_read).length

      const recentAlerts = alertsData.map(alert => ({
        id: alert['id'],
        recipe_id: alert.recipe_id,
        recipe_name: alert.recipes?.name ?? 'Unknown Recipe',
        alert_type: alert.alert_type,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        is_read: alert.is_read,
        new_value: alert.new_value,
        created_at: alert.created_at
      }))

      return {
        totalRecipes,
        recipesWithHpp,
        averageHpp,
        totalAlerts,
        unreadAlerts,
        recentAlerts
      }
    }

    // Execute the query directly (cache can be added later with proper typing)
    const result = await getOverviewData()

    apiLogger.info({
      userId: user['id'],
      totalRecipes: result.totalRecipes,
      recipesWithHpp: result.recipesWithHpp
    }, 'HPP overview retrieved successfully')

    return NextResponse.json(result)

  } catch (error: unknown) {
    return handleAPIError(error, 'GET /api/hpp/overview')
  }
}

// Apply security middleware
const securedGET = withSecurity(GET, SecurityPresets.enhanced())

// Export secured handlers
export { securedGET as GET }
