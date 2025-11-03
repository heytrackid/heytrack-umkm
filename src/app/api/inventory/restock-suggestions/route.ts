import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger, logError } from '@/lib/logger'
import { RecipeAvailabilityService } from '@/services/recipes/RecipeAvailabilityService'


export const runtime = 'nodejs'

// GET /api/inventory/restock-suggestions
export async function GET(request: NextRequest) {
  try {
    apiLogger.info({ url: request.url }, 'GET /api/inventory/restock-suggestions')
    
    const client = await createClient()

    const { data: { user }, error: authError } = await client.auth.getUser()

    if (authError || !user) {
      logError(apiLogger, authError, 'Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const suggestions = await RecipeAvailabilityService.getRestockSuggestions(user.id)

    apiLogger.info({ 
      userId: user.id,
      suggestionsCount: suggestions.length,
      criticalCount: suggestions.filter(s => s.urgency === 'CRITICAL').length
    }, 'Restock suggestions fetched')

    return NextResponse.json({
      data: suggestions,
      summary: {
        total: suggestions.length,
        critical: suggestions.filter(s => s.urgency === 'CRITICAL').length,
        high: suggestions.filter(s => s.urgency === 'HIGH').length,
        medium: suggestions.filter(s => s.urgency === 'MEDIUM').length,
        low: suggestions.filter(s => s.urgency === 'LOW').length,
        total_suggested_cost: suggestions.reduce((sum, s) => 
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
