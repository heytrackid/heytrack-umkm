import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      productName,
      ingredients,
      currentPrice,
      competitorPrices,
      location,
      targetMarket
    } = body

    // Validate required fields
    if (!productName || !ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Missing required fields: productName, ingredients' },
        { status: 400 }
      )
    }

    if (!ingredients.every(ing => ing.name && typeof ing.cost === 'number')) {
      return NextResponse.json(
        { error: 'Invalid ingredients format. Each ingredient must have name and cost' },
        { status: 400 }
      )
    }

    // Call AI service for pricing analysis
    const analysis = await aiService.analyzePricing({
      productName,
      ingredients,
      currentPrice,
      competitorPrices,
      location: location || 'Jakarta',
      targetMarket: targetMarket || 'mid-market'
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'AI service unavailable', fallback: true },
        { status: 503 }
      )
    }

    if (analysis.error) {
      return NextResponse.json(
        { error: 'AI analysis failed', details: analysis.error, fallback: true },
        { status: 500 }
      )
    }

    // Add metadata
    const result = {
      ...analysis,
      metadata: {
        analysisType: 'ai-powered-pricing',
        timestamp: new Date().toISOString(),
        model: 'grok-4-fast-free',
        confidence: analysis.marginAnalysis?.optimalMargin ? 'high' : 'medium'
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('AI Pricing API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      },
      { status: 500 }
    )
  }
}