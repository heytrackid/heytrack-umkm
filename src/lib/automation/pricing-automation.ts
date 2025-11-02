import { formatCurrentCurrency } from '@/shared'
import type {


  AutomationConfig,
  Recipe,
  RecipeIngredient,
  Ingredient,
  SmartPricingResult,
  CompetitivePricing,
  ProfitabilityAnalysis
} from './types'

export class PricingAutomation {
  constructor(private config: AutomationConfig) {}

  /**
   * 🧮 AUTO-CALCULATION: Smart HPP & Pricing
   * Automatically calculates cost and suggests optimal pricing
   */
  calculateSmartPricing(
    recipe: Recipe & { recipe_ingredients: Array<RecipeIngredient & { ingredient: Ingredient }> }
  ): SmartPricingResult {
    // 1. Calculate exact HPP from ingredients
    const ingredientCost = recipe.recipe_ingredients.reduce((total: number, ri: RecipeIngredient & { ingredient: Ingredient }) => total + (ri.ingredient.price_per_unit * ri.quantity), 0)

    // 2. Add overhead costs (utilities, labor, packaging, etc.)
    const overheadPercentage = 15 // 15% overhead
    const overheadCost = ingredientCost * (overheadPercentage / 100)
    const totalCost = ingredientCost + overheadCost

    // 3. Smart pricing based on market positioning
    const competitivePricing = this.calculateCompetitivePricing(totalCost)
    const profitabilityAnalysis = this.analyzeProfitability(totalCost, competitivePricing)

    return {
      breakdown: {
        ingredientCost,
        overheadCost,
        totalCost,
        costPerServing: totalCost / (recipe.servings ?? 1)
      },
      pricing: competitivePricing,
      analysis: profitabilityAnalysis,
      recommendations: this.generatePricingRecommendations(totalCost, competitivePricing)
    }
  }

  /**
   * Calculate competitive pricing options
   */
  private calculateCompetitivePricing(totalCost: number): CompetitivePricing {
    const economyPrice = totalCost * (1 + this.config.minimumProfitMargin / 100)
    const standardPrice = totalCost * (1 + this.config.defaultProfitMargin / 100)
    const premiumPrice = totalCost * (1 + 100 / 100) // 100% margin for premium

    return {
      economy: {
        price: Math.ceil(economyPrice / 500) * 500, // Round to nearest 500
        margin: this.config.minimumProfitMargin,
        positioning: 'Harga Ekonomis - Kompetitif untuk volume tinggi'
      },
      standard: {
        price: Math.ceil(standardPrice / 1000) * 1000, // Round to nearest 1000
        margin: this.config.defaultProfitMargin,
        positioning: 'Harga Standar - Balance antara profit dan kompetitif'
      },
      premium: {
        price: Math.ceil(premiumPrice / 1000) * 1000,
        margin: 100,
        positioning: 'Harga Premium - Fokus kualitas dan brand'
      }
    }
  }

  /**
   * Analyze profitability for each pricing tier
   */
  private analyzeProfitability(cost: number, pricing: CompetitivePricing): ProfitabilityAnalysis[] {
    return Object.entries(pricing).map(([tier, data]) => {
      const pricingData = data as { price: number; margin: number; positioning: string }
      return {
        tier,
        profitAmount: pricingData.price - cost,
        profitMargin: ((pricingData.price - cost) / pricingData.price) * 100,
        breakEvenVolume: Math.ceil(1000 / (pricingData.price - cost)) // Assuming 1000 fixed costs
      }
    })
  }

  /**
   * Generate pricing recommendations
   */
  private generatePricingRecommendations(cost: number, pricing: CompetitivePricing): string[] {
    const recommendations: string[] = []
    
    if (cost > pricing.standard.price * 0.7) {
      recommendations.push('⚠️ Cost terlalu tinggi, pertimbangkan optimasi ingredient atau supplier')
    }
    
    recommendations.push(`💡 Harga optimal: ${formatCurrentCurrency(pricing.standard.price)} untuk margin sehat`)
    recommendations.push(`🎯 Break-even minimum: ${formatCurrentCurrency(Math.ceil(cost * 1.3))}`)
    
    if (pricing.economy.price < cost * 1.2) {
      recommendations.push('⚠️ Harga ekonomi terlalu rendah, risiko rugi tinggi')
    }
    
    if (pricing.premium.price > cost * 2.5) {
      recommendations.push('💰 Harga premium sangat menguntungkan jika market menerima')
    }
    
    return recommendations
  }

  /**
   * Calculate dynamic pricing based on demand and competition
   */
  calculateDynamicPricing(
    basePricing: CompetitivePricing,
    demandFactor: number, // 0.5 = low demand, 1.0 = normal, 1.5 = high demand
    competitionFactor: number, // 0.8 = high competition, 1.0 = normal, 1.2 = low competition
    seasonFactor = 1.0 // seasonal adjustment
  ): CompetitivePricing {
    const adjustmentMultiplier = demandFactor * competitionFactor * seasonFactor

    return {
      economy: {
        ...basePricing.economy,
        price: Math.ceil(basePricing.economy.price * adjustmentMultiplier / 500) * 500
      },
      standard: {
        ...basePricing.standard,
        price: Math.ceil(basePricing.standard.price * adjustmentMultiplier / 1000) * 1000
      },
      premium: {
        ...basePricing.premium,
        price: Math.ceil(basePricing.premium.price * adjustmentMultiplier / 1000) * 1000
      }
    }
  }

  /**
   * Analyze price sensitivity and recommend optimal price point
   */
  analyzePriceSensitivity(
    salesHistory: Array<{ price: number; quantity: number; date: string }>,
    _currentPricing: CompetitivePricing
  ) {
    // Simple price elasticity analysis
    const avgQuantityByPrice = salesHistory.reduce<Record<number, { totalQty: number; count: number }>>((acc, sale) => {
      const priceRange = Math.floor(sale.price / 5000) * 5000 // Group by 5k ranges
      if (!acc[priceRange]) {
        acc[priceRange] = { totalQty: 0, count: 0 }
      }
      acc[priceRange].totalQty += sale.quantity
      acc[priceRange].count += 1
      return acc
    }, {})

    const priceElasticityEntries = Object.entries(avgQuantityByPrice) as Array<[string, { totalQty: number; count: number }]>

    const priceElasticity = priceElasticityEntries.map(([price, data]) => ({
      price: parseInt(price),
      avgQuantity: data.totalQty / data.count,
      totalRevenue: parseInt(price) * (data.totalQty / data.count)
    })).sort((a, b) => b.totalRevenue - a.totalRevenue)

    const optimalPrice = priceElasticity[0] || { price: 0, avgQuantity: 0, totalRevenue: 0 }

    return {
      elasticity: priceElasticity,
      recommendation: {
        optimalPrice: optimalPrice.price,
        expectedQuantity: optimalPrice.avgQuantity,
        projectedRevenue: optimalPrice.totalRevenue,
        reasoning: `Harga ${formatCurrentCurrency(optimalPrice.price)} memberikan revenue tertinggi`
      }
    }
  }

  /**
   * Bulk pricing calculator for wholesale orders
   */
  calculateBulkPricing(basePrice: number, quantity: number): { price: number; discount: number; tier: string } {
    let discount = 0
    let tier = 'retail'

    if (quantity >= 100) {
      discount = 20 // 20% discount for 100+ items
      tier = 'wholesale'
    } else if (quantity >= 50) {
      discount = 15 // 15% discount for 50+ items
      tier = 'bulk'
    } else if (quantity >= 20) {
      discount = 10 // 10% discount for 20+ items
      tier = 'volume'
    } else if (quantity >= 10) {
      discount = 5 // 5% discount for 10+ items
      tier = 'small-bulk'
    }

    const finalPrice = basePrice * (1 - discount / 100)

    return {
      price: Math.ceil(finalPrice / 100) * 100, // Round to nearest 100
      discount,
      tier
    }
  }
}
