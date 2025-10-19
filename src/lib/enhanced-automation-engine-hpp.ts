// HPP (Harga Pokok Produksi) Calculation Engine
import type { EnhancedAutomationConfig, HPPCalculationResult } from './enhanced-automation-engine-types'
import { supabase } from '@/lib/supabase'

export class HPPEngine {
  constructor(private config: EnhancedAutomationConfig) {}

  async calculateAdvancedHPP(recipeId: string) {
    try {
      // Use database function for core HPP calculation
      const { data: hppResult, error } = await (supabase as any).rpc('calculate_recipe_hpp', {
        recipe_uuid: recipeId
      })

      if (error) throw error
      if (!hppResult || hppResult.length === 0) {
        throw new Error('Recipe not found or has no ingredients')
      }

      const hpp = hppResult[0] as HPPCalculationResult

      // Enhanced cost breakdown with Indonesian F&B standards
      const ingredientCost = hpp.total_ingredient_cost
      const overheadCost = ingredientCost * 0.15 // 15% overhead (utilities, rent, etc)
      const laborCost = ingredientCost * 0.20    // 20% labor cost
      const packagingCost = ingredientCost * 0.05 // 5% packaging
      const totalCost = ingredientCost + overheadCost + laborCost + packagingCost

      // Get current recipe price
      const { data: recipe } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single()

      const currentPrice = (recipe as any)?.selling_price || 0
      const currentMargin = currentPrice > 0 ? ((currentPrice - totalCost) / currentPrice) * 100 : 0

      // Pricing intelligence with market analysis
      const competitorPriceRange = await this.estimateCompetitorPricing(totalCost)
      const pricingSuggestions = this.generateIntelligentPricing(totalCost, competitorPriceRange)

      // Availability analysis with stock warnings
      const stockAnalysis = await this.analyzeStockAvailability(recipeId, hpp.max_possible_batches)

      // Margin analysis and risk assessment
      const marginAnalysis = this.analyzeMarginRisk(currentMargin, totalCost, currentPrice)

      return {
        hpp_breakdown: {
          ingredient_cost: ingredientCost,
          overhead_cost: overheadCost,
          labor_cost: laborCost,
          packaging_cost: packagingCost,
          total_cost: totalCost,
          cost_per_serving: hpp.cost_per_serving
        },
        pricing_analysis: {
          current_price: currentPrice,
          current_margin: currentMargin,
          break_even_price: totalCost * 1.1, // 10% minimum margin
          competitor_price_range: competitorPriceRange
        },
        pricing_suggestions: pricingSuggestions,
        availability: {
          can_produce: hpp.can_produce,
          production_capacity: hpp.max_possible_batches,
          limiting_ingredients: stockAnalysis.limiting_ingredients,
          stock_warnings: stockAnalysis.warnings
        },
        margin_analysis: marginAnalysis
      }
    } catch (error: any) {
      console.error('Advanced HPP calculation error:', error)
      throw error
    }
  }

  private async estimateCompetitorPricing(cost: number): Promise<{min: number, max: number}> {
    // Simplified competitor analysis - in real app, this would use market data
    const buffer = this.config.competitivePricingBuffer / 100
    return {
      min: cost * (1 + 0.3), // 30% minimum margin
      max: cost * (1 + 1.0 + buffer) // 100% + buffer margin
    }
  }

  private generateIntelligentPricing(cost: number, competitorRange: {min: number, max: number}) {
    const targetMargin = this.config.targetProfitMargin / 100

    return {
      economy: {
        price: Math.ceil(cost * 1.4 / 500) * 500, // 40% margin, rounded to 500
        margin: 40,
        rationale: 'Kompetitif untuk volume tinggi dan customer price-sensitive'
      },
      standard: {
        price: Math.ceil(cost * (1 + targetMargin) / 1000) * 1000,
        margin: this.config.targetProfitMargin,
        rationale: 'Harga optimal dengan margin sehat untuk sustainability'
      },
      premium: {
        price: Math.ceil(cost * this.config.premiumPricingMultiplier / 1000) * 1000,
        margin: (this.config.premiumPricingMultiplier - 1) * 100,
        rationale: 'Positioning premium dengan fokus kualitas dan brand value'
      }
    }
  }

  private async analyzeStockAvailability(recipeId: string, maxBatches: number) {
    // Get recipe ingredients and check stock status
    const { data: recipeIngredients } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId)

    const limitingIngredients: string[] = []
    const warnings: string[] = []

    recipeIngredients?.forEach((ri: any) => {
      const ingredient = ri.ingredients as unknown as any
      const needed = ri.quantity * maxBatches

      if (ingredient.current_stock ?? 0 < needed) {
        limitingIngredients.push(ingredient.name)
      }

      // Check if approaching minimum stock
      if (ingredient.current_stock ?? 0 <= ingredient.min_stock) {
        warnings.push(`${ingredient.name} mendekati minimum stock`)
      }
    })

    return {
      limiting_ingredients: limitingIngredients,
      warnings
    }
  }

  private analyzeMarginRisk(currentMargin: number, totalCost: number, currentPrice: number) {
    const targetMargin = this.config.targetProfitMargin
    const minimumMargin = 20 // 20% minimum for sustainability

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    let isProfitable = currentMargin > minimumMargin

    if (currentMargin < minimumMargin) {
      riskLevel = 'HIGH'
      isProfitable = false
    } else if (currentMargin < targetMargin * 0.8) {
      riskLevel = 'MEDIUM'
    } else {
      riskLevel = 'LOW'
    }

    return {
      is_profitable: isProfitable,
      risk_level: riskLevel,
      current_margin: currentMargin,
      recommended_margin: targetMargin
    }
  }
}
