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

    // Check if user has data
    const [ingredients, recipes, orders, customers] = await Promise.all([
      supabase.from('ingredients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    const hasIngredients = (ingredients.count || 0) > 0
    const hasRecipes = (recipes.count || 0) > 0
    const hasOrders = (orders.count || 0) > 0
    const hasCustomers = (customers.count || 0) > 0

    const completedSteps = {
      welcome: true, // Always true after first login
      ingredients: hasIngredients,
      recipes: hasRecipes,
      customers: hasCustomers,
      orders: hasOrders,
    }

    const totalSteps = Object.keys(completedSteps).length
    const completed = Object.values(completedSteps).filter(Boolean).length
    const progress = (completed / totalSteps) * 100

    const needsOnboarding = progress < 100

    return NextResponse.json({
      data: {
        needsOnboarding,
        progress,
        completedSteps,
        currentStep: needsOnboarding
          ? Object.entries(completedSteps).find(([_, done]) => !done)?.[0] || 'welcome'
          : 'complete',
      },
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/onboarding/status')
  }
}

export const GET = createSecureHandler(getHandler, 'GET /api/onboarding/status', SecurityPresets.enhanced())
