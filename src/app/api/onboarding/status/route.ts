export const runtime = 'nodejs'
import { handleAPIError } from '@/lib/errors/api-error-handler'

import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'

// GET /api/onboarding/status - Get onboarding status
async function getOnboardingStatusHandler(context: RouteContext) {
  const { user, supabase } = context

  try {

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

    return createSuccessResponse({
      needsOnboarding,
      progress,
      completedSteps,
      currentStep: needsOnboarding
        ? Object.entries(completedSteps).find(([_, done]) => !done)?.[0] || 'welcome'
        : 'complete',
    })
  } catch (error) {
    return handleAPIError(error, 'GET /api/onboarding/status')
  }
}

export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/onboarding/status',
    securityPreset: SecurityPresets.basic(),
  },
  getOnboardingStatusHandler
)
