// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { apiLogger } from '@/lib/logger'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { PricingAssistantService } from '@/services/orders/PricingAssistantService'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'

const GeneratePricingRecommendationSchema = z.object({
  recipeId: z.string().uuid('Recipe ID harus valid'),
}).strict()

interface PricingRecommendation {
  recommendedPrice: number
  confidence: number
}

// POST /api/hpp/pricing-assistant - Generate pricing recommendation
async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const body = await request.json() as Record<string, unknown>
    const validatedData = GeneratePricingRecommendationSchema.parse(body)
    const { recipeId } = validatedData

    // Generate pricing recommendation using service
    const recommendation = await PricingAssistantService.generatePricingRecommendation(recipeId, user.id) as PricingRecommendation

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

  } catch (error) {
    apiLogger.error({ error }, 'Error generating pricing recommendation')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = createSecureHandler(postHandler, 'POST /api/hpp/pricing-assistant', SecurityPresets.enhanced())
