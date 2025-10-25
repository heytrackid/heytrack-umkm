import { hppAutomation, triggerIngredientPriceUpdate, updateOperationalCosts } from '@/lib/automation/hpp-automation'
import { getErrorMessage, isRecord } from '@/lib/type-guards'
import { createServerSupabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { HPPAutomationSchema } from '@/lib/validations/api-schemas'
import { validateRequestOrRespond } from '@/lib/validations/validate-request'

import { apiLogger } from '@/lib/logger'
// POST /api/hpp/automation - Trigger HPP automation events
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validatedData = await validateRequestOrRespond(request, HPPAutomationSchema)
    if (validatedData instanceof NextResponse) return validatedData

    const { action: event, recipe_ids, force } = validatedData
    const data = { recipe_ids, force }

    apiLogger.info(`🧮 HPP Automation triggered: ${event}`)

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

  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error in HPP automation:')
    return NextResponse.json(
      { error: 'HPP automation failed', details: getErrorMessage(error) },
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

    const status: Record<string, unknown> = {
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

  } catch (error: unknown) {
    apiLogger.error({ error: error }, 'Error getting HPP automation status:')
    return NextResponse.json(
      { error: 'Failed to get automation status' },
      { status: 500 }
    )
  }
}

// Handler Functions

async function handleIngredientPriceChange(data: any) {
  if (!isRecord(data)) {
    throw new Error('Invalid data format: expected object')
  }

  const { ingredientId, oldPrice, newPrice } = data

  if (!ingredientId || typeof ingredientId !== 'string') {
    throw new Error('Missing or invalid required field: ingredientId')
  }
  if (typeof oldPrice !== 'number' || typeof newPrice !== 'number') {
    throw new Error('Missing or invalid required fields: oldPrice, newPrice')
  }

  apiLogger.info({ ingredientId, oldPrice, newPrice }, '💰 Processing ingredient price change')

  // Trigger HPP automation
  await triggerIngredientPriceUpdate(ingredientId, oldPrice, newPrice)

  // Update ingredient price in database
  const supabase = createServerSupabaseAdmin()

  // @ts-ignore
    const { error: updateError } = await supabase
    .from('ingredients')
    .update({
      price_per_unit: newPrice,
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', ingredientId)

  if (updateError) {
    apiLogger.error({ error: updateError }, 'Error updating ingredient price in database:')
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
  if (!isRecord(data)) {
    throw new Error('Invalid data format: expected object')
  }

  const { costId, oldAmount, newAmount } = data

  if (!costId || typeof costId !== 'string') {
    throw new Error('Missing or invalid required field: costId')
  }
  if (typeof oldAmount !== 'number' || typeof newAmount !== 'number') {
    throw new Error('Missing or invalid required fields: oldAmount, newAmount')
  }

  apiLogger.info({ costId, oldAmount, newAmount }, '🏭 Processing operational cost change')

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
  if (!isRecord(data)) {
    throw new Error('Invalid data format: expected object')
  }

  const { recipeId } = data

  if (!recipeId || typeof recipeId !== 'string') {
    throw new Error('Missing or invalid required field: recipeId')
  }

  apiLogger.info({ recipeId }, '🧮 Calculating HPP for recipe')

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
  if (!isRecord(data)) {
    throw new Error('Invalid data format: expected object')
  }

  const { reason = 'manual_request' } = data

  if (typeof reason !== 'string') {
    throw new Error('Invalid reason field: must be string')
  }

  apiLogger.info({ reason }, '🔄 Processing batch HPP recalculation')

  // Get all recipe IDs from database
  const supabase = createServerSupabaseAdmin()

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('is_active', true)

  if (error) {
    throw new Error(`Failed to fetch recipes: ${getErrorMessage(error)}`)
  }

  const results = []
  let successCount = 0
  let errorCount = 0

  // Recalculate HPP for each recipe
  for (const recipe of recipes || []) {
    try {
      const recipeHPP = await hppAutomation.calculateSmartHPP((recipe as any).id)

      results.push({
        recipeId: (recipe as any).id,
        recipeName: (recipe as any).nama,
        status: 'success',
        newHPP: recipeHPP.hppPerServing,
        lastCalculated: recipeHPP.lastCalculated
      })

      successCount++
    } catch (error: unknown) {
      results.push({
        recipeId: (recipe as any).id,
        recipeName: (recipe as any).nama,
        status: 'error',
        error: getErrorMessage(error)
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