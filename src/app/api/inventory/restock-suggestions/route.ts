// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'


import { type NextRequest, NextResponse } from 'next/server'

import { apiLogger, logError } from '@/lib/logger'
import { RecipeAvailabilityService } from '@/services/recipes/RecipeAvailabilityService'
import { withSecurity, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'


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
async function getHandler(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'GET /api/inventory/restock-suggestions')
    
    const client = await createClient()

    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const suggestions = await RecipeAvailabilityService.getRestockSuggestions(user['id'])

    apiLogger.info({
      userId: user['id'],
      suggestionsCount: suggestions.length,
      criticalCount: suggestions.filter((s: RestockSuggestion) => s.urgency === 'CRITICAL').length
    }, 'Restock suggestions fetched')

    return NextResponse.json({
      data: suggestions,
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withSecurity(getHandler, SecurityPresets.enhanced())
