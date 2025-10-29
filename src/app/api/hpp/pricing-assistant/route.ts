import { createClient } from '@/utils/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'
import { PricingAssistantService } from '@/modules/orders/services/PricingAssistantService'

// POST /api/hpp/pricing-assistant - Generate pricing recommendation
export async function POST(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'Auth error:')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipeId } = body

    if (!recipeId) {
      return NextResponse.json(
        { error: 'recipeId is required' },
        { status: 400 }
      )
    }

    // Generate pricing recommendation using service
    const pricingService = new PricingAssistantService()
    const recommendation = await pricingService.generatePricingRecommendation(recipeId)

    apiLogger.info({
      userId: user.id,
      recipeId,
      recommendedPrice: recommendation.recommendedPrice,
      confidence: recommendation.confidence
    }, 'Pricing recommendation generated successfully')

    return NextResponse.json({
      success: true,
      recommendation
    })

  } catch (err: unknown) {
    apiLogger.error({ error: err }, 'Error generating pricing recommendation')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
