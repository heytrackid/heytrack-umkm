import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'
import { AIDataFetcher } from '@/lib/ai/data-fetcher'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      ingredients,
      seasonality,
      upcomingEvents,
      weatherForecast,
      useDatabase = false
    } = body

    let inventoryData: any = {}
    let dataSource = 'custom'

    // If useDatabase is true, fetch from database
    if (useDatabase) {
      const dbIngredients = await AIDataFetcher.getIngredientsData({ limit: 100 })

      if (dbIngredients.length === 0) {
        return NextResponse.json(
          { error: 'No ingredients found in database' },
          { status: 404 }
        )
      }

      inventoryData = {
        ingredients: dbIngredients.map((ing: any) => ({
          name: ing.name,
          currentStock: ing.current_stock,
          minStock: ing.min_stock,
          usagePerWeek: ing.usage_per_week || 0,
          price: ing.unit_price,
          supplier: ing.supplier || 'Unknown',
          leadTime: ing.lead_time_days || 3,
          category: ing.category,
          unit: ing.unit
        })),
        seasonality: seasonality || 'normal',
        upcomingEvents,
        weatherForecast
      }

      dataSource = 'database'
    } else {
      // Use custom data from request
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

      inventoryData = {
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
      }
    }

    // Call AI service for inventory optimization
    const optimization = await aiService.optimizeInventory(inventoryData)

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
      dataSource,
      metadata: {
        analysisType: 'ai-powered-inventory',
        timestamp: new Date().toISOString(),
        model: 'grok-4-fast-free',
        confidence: optimization.demandForecast?.confidence || 0.7,
        dataSource
      }
    }

    return NextResponse.json(result)

  } catch (error: any) {
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