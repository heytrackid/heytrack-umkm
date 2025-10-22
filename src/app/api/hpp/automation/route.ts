import { hppAutomation, triggerIngredientPriceUpdate, updateOperationalCosts } from '@/lib/automation/hpp-automation'
import { createServerSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/hpp/automation - Trigger HPP automation events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data } = body

    console.log(`🧮 HPP Automation triggered: ${event}`)

    let result = null

    switch (event) {
      case 'ingredient_price_changed':
        result = await handleIngredientPriceChange(data)
        break

      case 'operational_cost_changed':
        result = await handleOperationalCostChange(data)
        break

      case 'recipe_hpp_calculate':
        result = await handleRecipeHPPCalculation(data)
        break

      case 'batch_hpp_recalculate':
        result = await handleBatchHPPRecalculation(data)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid automation event' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      event,
      result,
      message: 'HPP automation executed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error in HPP automation:', error)
    return NextResponse.json(
      { error: 'HPP automation failed', details: error.message },
      { status: 500 }
    )
  }
}

// GET /api/hpp/automation - Get HPP automation status and cached results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('param')
    const includeOperationalCosts = searchParams.get('param') === 'true'

    const status = {
      hppAutomationEnabled: true,
      lastMonitoringCheck: new Date().toISOString(),
      cachedRecipes: 'Available'
    }

    // Get specific recipe HPP if requested
    if (recipeId) {
      const recipeHPP = hppAutomation.getRecipeHPP(recipeId)
      status.recipeHPP = recipeHPP
    }

    // Include operational costs if requested
    if (includeOperationalCosts) {
      status.operationalCosts = hppAutomation.getOperationalCosts()
    }

    return NextResponse.json({
      status: 'active',
      automation: status,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error getting HPP automation status:', error)
    return NextResponse.json(
      { error: 'Failed to get automation status' },
      { status: 500 }
    )
  }
}

// Handler Functions

async function handleIngredientPriceChange(data: any) {
  const { ingredientId, oldPrice, newPrice } = data

  if (!ingredientId || oldPrice === undefined || newPrice === undefined) {
    throw new Error('Missing required fields: ingredientId, oldPrice, newPrice')
  }

  console.log(`💰 Processing ingredient price change: ${ingredientId} (${oldPrice} → ${newPrice})`)

  // Trigger HPP automation
  await triggerIngredientPriceUpdate(ingredientId, oldPrice, newPrice)

  // Update ingredient price in database
  const supabase = createServerSupabaseAdmin()

  const { error: updateError } = await (supabase as any)
    .from('ingredients')
    .update({
      price_per_unit: newPrice,
      updated_at: new Date().toISOString()
    })
    .eq('id', ingredientId)

  if (updateError) {
    console.error('Error updating ingredient price in database:', updateError)
  }

  return {
    ingredientId,
    priceChange: {
      from: oldPrice,
      to: newPrice,
      percentage: ((newPrice - oldPrice) / oldPrice) * 100
    },
    automationTriggered: true,
    databaseUpdated: !updateError
  }
}

async function handleOperationalCostChange(data: any) {
  const { costId, oldAmount, newAmount } = data

  if (!costId || oldAmount === undefined || newAmount === undefined) {
    throw new Error('Missing required fields: costId, oldAmount, newAmount')
  }

  console.log(`🏭 Processing operational cost change: ${costId} (${oldAmount} → ${newAmount})`)

  // Trigger HPP automation
  updateOperationalCosts(costId, newAmount)

  return {
    costId,
    costChange: {
      from: oldAmount,
      to: newAmount,
      percentage: ((newAmount - oldAmount) / oldAmount) * 100
    },
    automationTriggered: true,
    allRecipesRecalculated: true
  }
}

async function handleRecipeHPPCalculation(data: any) {
  const { recipeId } = data

  if (!recipeId) {
    throw new Error('Missing required field: recipeId')
  }

  console.log(`🧮 Calculating HPP for recipe: ${recipeId}`)

  // Calculate smart HPP
  const recipeHPP = await hppAutomation.calculateSmartHPP(recipeId)

  return {
    recipeId,
    hpp: {
      totalHPP: recipeHPP.totalHPP,
      hppPerServing: recipeHPP.hppPerServing,
      components: {
        directCost: recipeHPP.totalDirectCost,
        indirectCost: recipeHPP.totalIndirectCost,
        ingredients: recipeHPP.components.ingredients.length,
        labor: recipeHPP.components.labor.totalLaborCost,
        overhead: recipeHPP.components.overhead.totalOverheadCost,
        packaging: recipeHPP.components.packaging.reduce((sum, p) => sum + p.totalCost, 0)
      },
      suggestedPricing: recipeHPP.suggestedSellingPrice
    },
    calculationCompleted: true,
    lastCalculated: recipeHPP.lastCalculated
  }
}

async function handleBatchHPPRecalculation(data: any) {
  const { reason = 'manual_request' } = data

  console.log(`🔄 Processing batch HPP recalculation: ${reason}`)

  // Get all recipe IDs from database
  const supabase = createServerSupabaseAdmin()

  const { data: recipes, error } = await (supabase as any)
    .from('recipes')
    .select('*')
    .eq('is_active', true)

  if (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`)
  }

  const results = []
  let successCount = 0
  let errorCount = 0

  // Recalculate HPP for each recipe
  for (const recipe of recipes || []) {
    try {
      const recipeHPP = await hppAutomation.calculateSmartHPP(recipe.id)

      results.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        status: 'success',
        newHPP: recipeHPP.hppPerServing,
        lastCalculated: recipeHPP.lastCalculated
      })

      successCount++
    } catch (error: any) {
      results.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        status: 'error',
        error: error.message
      })

      errorCount++
    }
  }

  return {
    reason,
    summary: {
      totalRecipes: recipes?.length || 0,
      successCount,
      errorCount,
      successRate: recipes?.length ? (successCount / recipes.length) * 100 : 0
    },
    results: results.slice(0, 10), // Limit to first 10 for response size
    batchCompleted: true,
    completedAt: new Date().toISOString()
  }
}