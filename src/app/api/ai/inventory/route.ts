import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      ingredients,
      seasonality,
      upcomingEvents,
      weatherForecast
    } = body

    // Validate required fields
    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Missing required field: ingredients (array)' },
        { status: 400 }
      )
    }

    const requiredFields = ['name', 'currentStock', 'minStock', 'price']
    if (!ingredients.every(ing => requiredFields.every(field => ing[field] !== undefined))) {
      return NextResponse.json(
        { error: `Invalid ingredients format. Each ingredient must have: ${requiredFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Call AI service for inventory optimization
    const optimization = await aiService.optimizeInventory({
      ingredients: ingredients.map(ing => ({
        name: ing.name,
        currentStock: ing.currentStock,
        minStock: ing.minStock,
        usagePerWeek: ing.usagePerWeek || 0,
        price: ing.price,
        supplier: ing.supplier || 'Unknown',
        leadTime: ing.leadTime || 3
      })),
      seasonality: seasonality || 'normal',
      upcomingEvents,
      weatherForecast
    })

    if (!optimization) {
      return NextResponse.json(
        { error: 'AI service unavailable', fallback: true },
        { status: 503 }
      )
    }

    if (optimization.error) {
      return NextResponse.json(
        { error: 'AI optimization failed', details: optimization.error, fallback: true },
        { status: 500 }
      )
    }

    // Add metadata
    const result = {
      ...optimization,
      metadata: {
        analysisType: 'ai-powered-inventory',
        timestamp: new Date().toISOString(),
        model: 'grok-4-fast-free',
        confidence: optimization.demandForecast?.confidence || 0.7
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('AI Inventory API error:', error)
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