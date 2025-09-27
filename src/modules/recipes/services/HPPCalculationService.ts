import { supabase } from '@/lib/supabase'

interface HPPCalculationOptions {
  overheadRate: number
  laborCostPerHour: number
  targetMargin: number
}

interface HPPCalculationResult {
  totalCost: number
  costPerServing: number
  breakdown: {
    ingredientCost: number
    laborCost: number
    overheadCost: number
    packagingCost: number
  }
  suggestedPricing: {
    economy: { price: number; margin: number }
    standard: { price: number; margin: number }
    premium: { price: number; margin: number }
  }
  profitability: {
    isViable: boolean
    breakEvenQuantity: number
    recommendedMargin: number
  }
}

export class HPPCalculationService {
  static async calculateAdvancedHPP(
    recipeId: string, 
    options: HPPCalculationOptions
  ): Promise<HPPCalculationResult> {
    try {
      // Fetch recipe with ingredients
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            quantity,
            unit,
            ingredient:ingredients (
              id,
              name,
              unit_cost,
              unit_type
            )
          )
        `)
        .eq('id', recipeId)
        .single()

      if (recipeError) throw recipeError
      if (!recipe) throw new Error('Recipe not found')

      // Calculate ingredient costs
      let ingredientCost = 0
      for (const recipeIngredient of recipe.recipe_ingredients || []) {
        const ingredient = recipeIngredient.ingredient
        if (ingredient) {
          // Convert units and calculate cost
          const cost = this.calculateIngredientCost(
            recipeIngredient.quantity,
            recipeIngredient.unit,
            ingredient.unit_cost,
            ingredient.unit_type
          )
          ingredientCost += cost
        }
      }

      // Calculate labor cost based on total preparation and cooking time
      const totalTimeHours = (recipe.prep_time + recipe.cook_time) / 60
      const laborCost = totalTimeHours * options.laborCostPerHour

      // Calculate overhead cost
      const overheadCost = ingredientCost * options.overheadRate

      // Estimate packaging cost (could be made more sophisticated)
      const packagingCost = Math.max(1000, ingredientCost * 0.05) // Min Rp 1k or 5% of ingredient cost

      // Total cost calculations
      const totalCost = ingredientCost + laborCost + overheadCost + packagingCost
      const costPerServing = totalCost / recipe.servings

      // Generate pricing suggestions
      const suggestedPricing = this.generatePricingSuggestions(totalCost, options.targetMargin)

      // Profitability analysis
      const profitability = this.analyzeProfitability(
        totalCost, 
        suggestedPricing.standard.price,
        recipe.servings
      )

      return {
        totalCost,
        costPerServing,
        breakdown: {
          ingredientCost,
          laborCost,
          overheadCost,
          packagingCost
        },
        suggestedPricing,
        profitability
      }
    } catch (error) {
      console.error('HPP Calculation Service Error:', error)
      throw new Error(`Failed to calculate HPP: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private static calculateIngredientCost(
    quantity: number,
    unit: string,
    unitCost: number,
    ingredientUnitType: string
  ): number {
    // Unit conversion logic - simplified for demo
    // In production, this would have comprehensive unit conversion
    const conversionFactor = this.getUnitConversionFactor(unit, ingredientUnitType)
    return quantity * conversionFactor * unitCost
  }

  private static getUnitConversionFactor(fromUnit: string, toUnit: string): number {
    // Simplified unit conversion - in production this would be more comprehensive
    if (fromUnit === toUnit) return 1
    
    // Common conversions for Indonesian F&B
    const conversions: Record<string, Record<string, number>> = {
      'g': { 'kg': 0.001, 'gram': 1 },
      'kg': { 'g': 1000, 'gram': 1000 },
      'ml': { 'l': 0.001, 'liter': 0.001 },
      'l': { 'ml': 1000, 'liter': 1 },
      'pcs': { 'pieces': 1, 'buah': 1 },
      'tbsp': { 'ml': 15, 'tsp': 3 },
      'tsp': { 'ml': 5, 'tbsp': 0.33 }
    }

    return conversions[fromUnit]?.[toUnit] || 1
  }

  private static generatePricingSuggestions(
    totalCost: number, 
    targetMargin: number
  ) {
    const basePrice = totalCost / (1 - targetMargin)

    return {
      economy: {
        price: Math.ceil(basePrice * 0.85 / 500) * 500, // Round to nearest 500
        margin: Math.round(((basePrice * 0.85 - totalCost) / (basePrice * 0.85)) * 100)
      },
      standard: {
        price: Math.ceil(basePrice / 500) * 500,
        margin: Math.round(((basePrice - totalCost) / basePrice) * 100)
      },
      premium: {
        price: Math.ceil(basePrice * 1.2 / 500) * 500,
        margin: Math.round(((basePrice * 1.2 - totalCost) / (basePrice * 1.2)) * 100)
      }
    }
  }

  private static analyzeProfitability(
    totalCost: number,
    sellingPrice: number,
    servings: number
  ) {
    const profitPerUnit = sellingPrice - totalCost
    const margin = (profitPerUnit / sellingPrice) * 100

    return {
      isViable: margin >= 25, // Minimum 25% margin for viability
      breakEvenQuantity: Math.ceil(10000 / profitPerUnit), // Break-even for Rp 10k fixed costs
      recommendedMargin: Math.max(30, margin) // Recommend at least 30% margin
    }
  }

  static async updateRecipePrice(recipeId: string, price: number, margin: number) {
    try {
      const { error } = await supabase
        .from('recipes')
        .update({ 
          price, 
          margin,
          updated_at: new Date().toISOString() 
        })
        .eq('id', recipeId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Update recipe price error:', error)
      throw error
    }
  }

  static async getRecipeAnalytics(recipeId: string) {
    try {
      // Fetch sales data, production data, and cost trends
      const [salesData, productionData, costHistory] = await Promise.all([
        this.getRecipeSalesData(recipeId),
        this.getRecipeProductionData(recipeId),
        this.getRecipeCostHistory(recipeId)
      ])

      return {
        sales: salesData,
        production: productionData,
        costTrends: costHistory,
        performance: this.calculateRecipePerformance(salesData, productionData)
      }
    } catch (error) {
      console.error('Recipe analytics error:', error)
      throw error
    }
  }

  private static async getRecipeSalesData(recipeId: string) {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        created_at,
        order:orders(status, created_at)
      `)
      .eq('recipe_id', recipeId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  private static async getRecipeProductionData(recipeId: string) {
    const { data, error } = await supabase
      .from('productions')
      .select(`
        batch_size,
        production_cost,
        created_at,
        status
      `)
      .eq('recipe_id', recipeId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  private static async getRecipeCostHistory(recipeId: string) {
    // This would track historical cost changes
    // For now, return mock data
    return []
  }

  private static calculateRecipePerformance(salesData: any[], productionData: any[]) {
    const totalRevenue = salesData.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const totalQuantitySold = salesData.reduce((sum, item) => sum + item.quantity, 0)
    const totalProduced = productionData.reduce((sum, batch) => sum + batch.batch_size, 0)

    return {
      revenue: totalRevenue,
      quantitySold: totalQuantitySold,
      quantityProduced: totalProduced,
      sellThroughRate: totalProduced > 0 ? (totalQuantitySold / totalProduced) * 100 : 0,
      avgSellingPrice: totalQuantitySold > 0 ? totalRevenue / totalQuantitySold : 0
    }
  }
}