// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { NextRequest, NextResponse } from 'next/server'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import type { HppAlert } from '@/types/database'




// GET /api/hpp/overview - Get comprehensive HPP overview data in one request
async function getHandler(_request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()

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
          .limit(100)
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
       
      const alertsData = alertsRaw.map((alert: Record<string, unknown>) => {
        const alertWithRecipes = alert as { recipes: unknown }
        return {
          ...alert,
          recipes: Array.isArray(alertWithRecipes.recipes) ? alertWithRecipes.recipes[0] as { name: string } | null : alertWithRecipes.recipes as { name: string } | null
        } as Record<string, unknown>
      })

      const totalAlerts = alertsData.length
      const unreadAlerts = alertsData.filter((alert: Record<string, unknown>) => !(alert as { is_read: boolean }).is_read).length

      const recentAlerts = alertsData.map((alert: Record<string, unknown>) => ({
        id: alert['id'] as string,
        recipe_id: alert['recipe_id'] as string,
        recipe_name: ((alert['recipes'] as { name: string } | null)?.name) ?? 'Unknown Recipe',
        alert_type: alert['alert_type'] as string,
        title: alert['title'] as string,
        message: alert['message'] as string,
        severity: alert['severity'] as string,
        is_read: alert['is_read'] as boolean | null,
        new_value: alert['new_value'] as number | null,
        created_at: alert['created_at'] as string | null
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
  } catch (error) {
    return handleAPIError(error, 'GET /api/hpp/overview')
  }
}

// Apply security middleware
export const GET = createSecureHandler(getHandler, 'GET /api/hpp/overview', SecurityPresets.enhanced())
