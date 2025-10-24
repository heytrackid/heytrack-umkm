import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'
import { automationEngine } from '@/lib/automation-engine'

// GET /api/recipes/[id]/hpp - Calculate HPP and pricing suggestions for a recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = createServerSupabaseAdmin()
    
    // Fetch recipe with ingredients
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          id,
          quantity,
          unit,
          ingredient:ingredients (
            id,
            name,
            price_per_unit,
            unit,
            stock
          )
        )
      `)
      .eq('id', resolvedParams.id)
      .single()
    
    if (error) {
      console.error('Error fetching recipe:', error)
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
      return NextResponse.json({
        recipe_id: resolvedParams.id,
        recipe_name: recipe.name,
        hpp_breakdown: {
          ingredient_cost: 0,
          overhead_cost: 0,
          total_cost: 0,
          cost_per_serving: 0
        },
        pricing_suggestions: {
          economy: { price: 0, margin: 30, positioning: 'No ingredients defined' },
          standard: { price: 0, margin: 60, positioning: 'No ingredients defined' },
          premium: { price: 0, margin: 100, positioning: 'No ingredients defined' }
        },
        availability: {
          can_produce: false,
          missing_ingredients: [],
          stock_warnings: []
        },
        recommendations: ['Add ingredients to calculate HPP accurately']
      })
    }

    // Calculate smart pricing using automation engine
    // const pricingAnalysis = automationEngine.calculateSmartPricing(recipe)
    const pricingAnalysis = { breakdown: { costPerServing: 0 } }
    
    // Check ingredient availability for production
    const availability = checkIngredientAvailability(recipe)
    
    // Generate cost breakdown per serving
    const costPerServing = pricingAnalysis.breakdown.costPerServing
    
    return NextResponse.json({
      recipe_id: resolvedParams.id,
      recipe_name: recipe.name,
      servings: recipe.servings,
      hpp_breakdown: {
        ingredient_cost: 0,
        overhead_cost: 0,
        total_cost: 0,
        cost_per_serving: costPerServing,
        ingredient_details: recipe.recipe_ingredients.map((ri: unknown) => ({
          name: ri.ingredient.name,
          quantity: ri.quantity,
          unit: ri.unit,
          price_per_unit: ri.ingredient.price_per_unit,
          total_cost: ri.ingredient.price_per_unit * ri.quantity
        }))
      },
      pricing_suggestions: {},
      profitability_analysis: {},
      availability,
      recommendations: generateInventoryRecommendations(availability),
      suggested_selling_price: recipe.selling_price,
      margin_analysis: {
        current_margin: recipe.selling_price > costPerServing 
          ? ((recipe.selling_price - costPerServing) / recipe.selling_price * 100).toFixed(1)
          : 0,
        optimal_margin: 30,
        is_profitable: recipe.selling_price > costPerServing
      }
    })
  } catch (error: unknown) {
    console.error('Error calculating HPP:', error)
    return NextResponse.json(
      { error: 'Failed to calculate HPP' },
      { status: 500 }
    )
  }
}

// Helper function to check ingredient availability
function checkIngredientAvailability(recipe: unknown) {
  const stockWarnings: unknown[] = []
  const missingIngredients: unknown[] = []
  let canProduce = true
  
  recipe.recipe_ingredients.forEach((ri: unknown) => {
    const needed = ri.quantity
    const available = ri.ingredient.stock || 0
    const stockDays = available > 0 ? Math.floor(available / needed) : 0
    
    if (available < needed) {
      canProduce = false
      missingIngredients.push({
        name: ri.ingredient.name,
        needed,
        available,
        shortage: needed - available,
        unit: ri.unit
      })
    } else if (stockDays < 7) {
      stockWarnings.push({
        name: ri.ingredient.name,
        available,
        days_remaining: stockDays,
        message: `Stock ${ri.ingredient.name} akan habis dalam ${stockDays} batch produksi`
      })
    }
  })
  
  return {
    can_produce: canProduce,
    missing_ingredients: missingIngredients,
    stock_warnings: stockWarnings,
    production_capacity: canProduce ? Math.min(
      ...recipe.recipe_ingredients.map((ri: unknown) => 
        Math.floor((ri.ingredient.stock || 0) / ri.quantity)
      )
    ) : 0
  }
}

// Helper function to generate inventory recommendations
function generateInventoryRecommendations(availability: unknown): string[] {
  const recommendations = []
  
  if (!availability.can_produce) {
    recommendations.push('🛑 Tidak bisa produksi - stock bahan tidak mencukupi')
    availability.missing_ingredients.forEach((missing: unknown) => {
      recommendations.push(`📦 Butuh tambahan ${missing.shortage.toFixed(2)} ${missing.unit} ${missing.name}`)
    })
  }
  
  if (availability.stock_warnings.length > 0) {
    recommendations.push('⚠️ Ada bahan yang akan habis segera - pertimbangkan restock')
  }
  
  if (availability.production_capacity > 0) {
    recommendations.push(`✅ Dapat memproduksi maksimal ${availability.production_capacity} batch dengan stock saat ini`)
  }
  
  return recommendations
}