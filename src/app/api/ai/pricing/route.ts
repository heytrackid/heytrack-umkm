import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai'
import { AIDataFetcher } from '@/lib/ai/data-fetcher'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      productName,
      ingredients,
      currentPrice,
      competitorPrices,
      location,
      targetMarket,
      recipeId,
      useDatabase = false
    } = body

    let analysisData: any = {}
    let dataSource = 'custom'

    // If useDatabase is true or recipeId is provided, fetch from database
    if (useDatabase || recipeId) {
      const recipes = await AIDataFetcher.getRecipesData({ limit: 50 })

      if (recipes.length === 0) {
        return NextResponse.json(
          { error: 'No recipes found in database' },
          { status: 404 }
        )
      }

      // Find specific recipe or use first one
      let recipe: any = null
      if (recipeId) {
        recipe = recipes.find((r: any) => r.id === recipeId)
      } else if (productName) {
        recipe = recipes.find((r: any) => 
          r.name.toLowerCase().includes(productName.toLowerCase())
        )
      } else {
        recipe = recipes[0]
      }

      if (!recipe) {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        )
      }

      // Build ingredients from database
      const dbIngredients = (recipe.recipe_ingredients || []).map((ri: any) => ({
        name: ri.ingredients?.name || 'Unknown',
        cost: (ri.ingredients?.unit_price || 0) * ri.quantity,
        quantity: ri.quantity,
        unit: ri.unit,
        unitPrice: ri.ingredients?.unit_price || 0
      }))

      const totalHPP = dbIngredients.reduce((sum: number, ing: any) => sum + ing.cost, 0)

      analysisData = {
        productName: recipe.name,
        ingredients: dbIngredients,
        currentPrice: recipe.selling_price || totalHPP * 2,
        location: location || 'Indonesia',
        targetMarket: targetMarket || 'mid-market',
        competitorPrices: competitorPrices || []
      }

      dataSource = 'database'
    } else {
      // Use custom data from request
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

      analysisData = {
        productName,
        ingredients,
        currentPrice,
        competitorPrices,
        location: location || 'Jakarta',
        targetMarket: targetMarket || 'mid-market'
      }
    }

    // Call AI service for pricing analysis
    const analysis = await aiService.pricing.analyzePricing(analysisData)

    if (!analysis) {
      return NextResponse.json(
        { error: 'AI service unavailable', fallback: true },
        { status: 503 }
      )
    }

    // Add metadata
    const result = {
      ...analysis,
      dataSource,
      metadata: {
        analysisType: 'ai-powered-pricing',
        timestamp: new Date().toISOString(),
        model: 'grok-4-fast-free',
        confidence: analysis.marginAnalysis?.optimalMargin ? 'high' : 'medium',
        dataSource
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

// GET endpoint to analyze all recipes from database
export async function GET() {
  try {
    const recipes = await AIDataFetcher.getRecipesData({ limit: 10 })

    if (recipes.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No recipes found in database'
      })
    }

    // Analyze pricing for all recipes
    const analyses = await Promise.all(
      recipes.slice(0, 5).map(async (recipe: any) => {
        const ingredients = (recipe.recipe_ingredients || []).map((ri: any) => ({
          name: ri.ingredients?.name || 'Unknown',
          cost: (ri.ingredients?.unit_price || 0) * ri.quantity,
          quantity: ri.quantity
        }))

        const totalHPP = ingredients.reduce((sum: number, ing: any) => sum + ing.cost, 0)

        try {
          const analysis = await aiService.pricing.analyzePricing({
            productName: recipe.name,
            ingredients,
            currentPrice: recipe.selling_price || totalHPP * 2,
            location: 'Indonesia',
            targetMarket: 'mid-market'
          })

          return {
            recipeId: recipe.id,
            recipeName: recipe.name,
            currentPrice: recipe.selling_price,
            hpp: totalHPP,
            analysis: analysis.marginAnalysis,
            pricingStrategy: analysis.pricingStrategy
          }
        } catch (error) {
          return {
            recipeId: recipe.id,
            recipeName: recipe.name,
            error: 'Failed to analyze'
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      totalRecipes: recipes.length,
      analyzedCount: analyses.length,
      analyses
    })

  } catch (error) {
    console.error('AI Pricing GET API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
