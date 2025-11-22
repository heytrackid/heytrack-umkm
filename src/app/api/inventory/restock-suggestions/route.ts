// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { createSuccessResponse } from '@/lib/api-core/responses'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { apiLogger, logError } from '@/lib/logger'
import { RecipeAvailabilityService } from '@/services/recipes/RecipeAvailabilityService'


interface RestockSuggestion {
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  reorder_point: number
  suggested_order_quantity: number
  lead_time_days: number | null
  urgency: 'CRITICAL' | 'HIGH' | 'LOW' | 'MEDIUM'
  reason: string
}

// GET /api/inventory/restock-suggestions
async function getRestockSuggestionsHandler(context: RouteContext) {
  const { user } = context

  try {
    const suggestions = await RecipeAvailabilityService.getRestockSuggestions(user.id)

    apiLogger.info({
      userId: user.id,
      suggestionsCount: suggestions.length,
      criticalCount: suggestions.filter((s: RestockSuggestion) => s.urgency === 'CRITICAL').length
    }, 'Restock suggestions fetched')

    return createSuccessResponse({
      suggestions,
      summary: {
        total: suggestions.length,
        critical: suggestions.filter((s: RestockSuggestion) => s.urgency === 'CRITICAL').length,
        high: suggestions.filter((s: RestockSuggestion) => s.urgency === 'HIGH').length,
        medium: suggestions.filter((s: RestockSuggestion) => s.urgency === 'MEDIUM').length,
        low: suggestions.filter((s: RestockSuggestion) => s.urgency === 'LOW').length,
        total_suggested_cost: suggestions.reduce((sum: number, s: RestockSuggestion) =>
          // Estimate cost - would need ingredient price
           sum + s.suggested_order_quantity
        , 0)
      }
    })
  } catch (error) {
    logError(apiLogger, error, 'Failed to get restock suggestions')
    return handleAPIError(new Error('Internal server error'), 'API Route')
  }
}

export const GET = createApiRoute(
  { method: 'GET', path: '/api/inventory/restock-suggestions' },
  getRestockSuggestionsHandler
)
