import { dbLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'
import { HppCalculatorService } from '@/services/hpp/HppCalculatorService'

type Recipe = Database['public']['Tables']['recipes']['Row']

interface PricingRecommendation {
  recipeId: string
  currentPrice: number
  recommendedPrice: number
  hppValue: number
  minPrice: number
  maxPrice: number
  optimalMargin: number
  reasoning: string[]
  confidence: number
  marketFactors: {
    competitorPrices: number[]
    demandLevel: 'low' | 'medium' | 'high'
    seasonality: 'low' | 'normal' | 'peak'
    category: string
  }
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high'
    riskFactors: string[]
  }
}

interface PricingStrategy {
  strategy: 'cost_plus' | 'market_based' | 'competition' | 'value_based'
  targetMargin: number
  reasoning: string
}

export class PricingAssistantService {
  /**
   * Generate pricing recommendation for a recipe
   */
  static async generatePricingRecommendation(recipeId: string, userId: string): Promise<PricingRecommendation> {
    try {
      const supabase = createClient()
      dbLogger.info(`Generating pricing recommendation for recipe ${recipeId}`)

      // Get recipe details
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        throw new Error(`Recipe not found: ${recipeId}`)
      }
      
      const recipe = data as Recipe

      // Get HPP calculation - simplified for now
      const hppValue = (recipe.selling_price ?? 0) * 0.7 // Estimate 70% cost

      // Analyze market factors
      const marketFactors = await this.analyzeMarketFactors(recipe)

      // Determine pricing strategy
      const strategy = this.determinePricingStrategy(recipe, marketFactors)

      // Calculate price recommendations
      const recommendations = this.calculatePriceRecommendations(
        hppValue,
        recipe.selling_price ?? 0,
        strategy,
        marketFactors
      )

      // Assess risks
      const riskAssessment = this.assessPricingRisks(recommendations, marketFactors)

      const result: PricingRecommendation = {
        recipeId,
        currentPrice: recipe.selling_price ?? 0,
        recommendedPrice: recommendations.recommendedPrice,
        hppValue,
        minPrice: recommendations.minPrice,
        maxPrice: recommendations.maxPrice,
        optimalMargin: recommendations.optimalMargin,
        reasoning: recommendations.reasoning,
        confidence: recommendations.confidence,
        marketFactors,
        riskAssessment
      }

      dbLogger.info(`Pricing recommendation generated for recipe ${recipeId}: ${result.recommendedPrice}`)
      return result

    } catch (err: unknown) {
      dbLogger.error({ error: err }, `Failed to generate pricing recommendation for recipe ${recipeId}`)
      throw err
    }
  }

  /**
   * Analyze market factors for pricing
   */
  private static async analyzeMarketFactors(recipe: Recipe): Promise<PricingRecommendation['marketFactors']> {
    try {
      const supabase = createClient()
      
      // Get competitor prices from similar recipes in same category
      const { data: similarRecipes, error } = await supabase
        .from('recipes')
        .select('selling_price')
        .eq('category', recipe.category ?? '')
        .eq('user_id', recipe.user_id)
        .neq('id', recipe.id)
        .not('selling_price', 'is', null)
        .limit(10)

      const competitorPrices = similarRecipes?.map((r: Recipe) => r.selling_price ?? 0) || []

      // Determine demand level based on recipe usage
      const demandLevel = this.calculateDemandLevel(recipe.times_made || 0)

      // Determine seasonality based on category and current month
      const seasonality = this.calculateSeasonality(recipe.category)

      return {
        competitorPrices,
        demandLevel,
        seasonality,
        category: recipe.category || 'General'
      }

    } catch (err: unknown) {
      dbLogger.warn({ error: err }, 'Failed to analyze market factors, using defaults')
      return {
        competitorPrices: [],
        demandLevel: 'medium',
        seasonality: 'normal',
        category: recipe.category || 'General'
      }
    }
  }

  /**
   * Determine pricing strategy based on recipe and market factors
   */
  private static determinePricingStrategy(
    recipe: Recipe,
    marketFactors: PricingRecommendation['marketFactors']
  ): PricingStrategy {
    const hppMargin = recipe.margin_percentage || 30

    // High demand + high seasonality = market-based pricing
    if (marketFactors.demandLevel === 'high' && marketFactors.seasonality === 'peak') {
      return {
        strategy: 'market_based',
        targetMargin: Math.max(hppMargin, 40),
        reasoning: 'High demand and peak season allow for premium pricing'
      }
    }

    // Competitive market with many competitors = competition-based
    if (marketFactors.competitorPrices.length > 5) {
      const avgCompetitorPrice = marketFactors.competitorPrices.reduce((sum, price) => sum + price, 0) / marketFactors.competitorPrices.length
      return {
        strategy: 'competition',
        targetMargin: hppMargin,
        reasoning: `Competitive market with ${marketFactors.competitorPrices.length} competitors, price aligned with market average of ${avgCompetitorPrice.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`
      }
    }

    // Default to cost-plus with optimal margin
    return {
      strategy: 'cost_plus',
      targetMargin: Math.max(hppMargin, 25),
      reasoning: 'Standard cost-plus pricing with healthy margin'
    }
  }

  /**
   * Calculate price recommendations
   */
  private static calculatePriceRecommendations(
    hppValue: number,
    currentPrice: number,
    strategy: PricingStrategy,
    marketFactors: PricingRecommendation['marketFactors']
  ) {
    const reasoning: string[] = []
    let recommendedPrice = hppValue * (1 + strategy.targetMargin / 100)
    let confidence = 0.8

    // Adjust based on strategy
    switch (strategy.strategy) {
      case 'market_based':
        if (marketFactors.competitorPrices.length > 0) {
          const avgMarketPrice = marketFactors.competitorPrices.reduce((sum, price) => sum + price, 0) / marketFactors.competitorPrices.length
          recommendedPrice = Math.max(recommendedPrice, avgMarketPrice * 0.95)
          reasoning.push(`Market-based pricing: Adjusted to compete with average market price`)
        }
        break

      case 'competition':
        if (marketFactors.competitorPrices.length > 0) {
          const avgCompetitorPrice = marketFactors.competitorPrices.reduce((sum, price) => sum + price, 0) / marketFactors.competitorPrices.length
          recommendedPrice = avgCompetitorPrice
          confidence = 0.9
          reasoning.push(`Competition-based pricing: Matched competitor average price`)
        }
        break
    }

    // Adjust for demand level
    if (marketFactors.demandLevel === 'high') {
      recommendedPrice *= 1.1
      reasoning.push('High demand allows 10% price premium')
    } else if (marketFactors.demandLevel === 'low') {
      recommendedPrice *= 0.95
      confidence *= 0.9
      reasoning.push('Low demand requires 5% price discount')
    }

    // Adjust for seasonality
    if (marketFactors.seasonality === 'peak') {
      recommendedPrice *= 1.15
      reasoning.push('Peak season pricing with 15% premium')
    } else if (marketFactors.seasonality === 'low') {
      recommendedPrice *= 0.9
      confidence *= 0.95
      reasoning.push('Low season pricing with 10% discount')
    }

    // Calculate price range
    const minPrice = hppValue * 1.1 // Minimum 10% margin
    const maxPrice = hppValue * 2.0 // Maximum 100% margin

    // Ensure recommended price is within reasonable bounds
    recommendedPrice = Math.max(minPrice, Math.min(maxPrice, recommendedPrice))

    const optimalMargin = ((recommendedPrice - hppValue) / hppValue) * 100

    reasoning.unshift(`Base HPP: ${hppValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`)
    reasoning.push(`Recommended margin: ${optimalMargin.toFixed(1)}%`)
    reasoning.push(`Pricing strategy: ${strategy.strategy} (${strategy.reasoning})`)

    return {
      recommendedPrice: Math.round(recommendedPrice),
      minPrice: Math.round(minPrice),
      maxPrice: Math.round(maxPrice),
      optimalMargin: Math.round(optimalMargin * 10) / 10,
      reasoning,
      confidence
    }
  }

  /**
   * Assess pricing risks
   */
  private static assessPricingRisks(
    recommendations: {
      recommendedPrice: number
      minPrice: number
      maxPrice: number
      optimalMargin: number
      reasoning: string[]
      confidence: number
    },
    marketFactors: PricingRecommendation['marketFactors']
  ): PricingRecommendation['riskAssessment'] {
    const riskFactors: string[] = []

    if (recommendations.recommendedPrice > recommendations.maxPrice) {
      riskFactors.push('Recommended price exceeds maximum reasonable price')
    }

    if (recommendations.recommendedPrice < recommendations.minPrice) {
      riskFactors.push('Recommended price below minimum viable price')
    }

    if (marketFactors.demandLevel === 'low') {
      riskFactors.push('Low demand may reduce sales volume')
    }

    if (marketFactors.seasonality === 'low') {
      riskFactors.push('Off-season may reduce customer willingness to pay')
    }

    if (marketFactors.competitorPrices.length === 0) {
      riskFactors.push('Limited competitor data, pricing based on assumptions')
    }

    const riskLevel = riskFactors.length === 0 ? 'low' :
                     riskFactors.length <= 2 ? 'medium' : 'high'

    return {
      riskLevel,
      riskFactors
    }
  }

  /**
   * Calculate demand level based on usage
   */
  private static calculateDemandLevel(timesMade: number): 'low' | 'medium' | 'high' {
    if (timesMade > 50) {return 'high'}
    if (timesMade > 20) {return 'medium'}
    return 'low'
  }

  /**
   * Calculate seasonality based on category and current month
   */
  private static calculateSeasonality(category: string | null): 'low' | 'normal' | 'peak' {
    const currentMonth = new Date().getMonth() + 1 // 1-12

    // Food categories often have seasonal demand
    if (category?.toLowerCase().includes('ice') || category?.toLowerCase().includes('cold')) {
      // Summer months (Dec-Feb in Indonesia)
      if ([12, 1, 2].includes(currentMonth)) {return 'peak'}
      if ([6, 7, 8].includes(currentMonth)) {return 'low'}
    }

    if (category?.toLowerCase().includes('grill') || category?.toLowerCase().includes('bbq')) {
      // Dry season (Jun-Sep)
      if ([6, 7, 8, 9].includes(currentMonth)) {return 'peak'}
    }

    return 'normal'
  }

  /**
   * Bulk pricing recommendations for multiple recipes
   */
  static async generateBulkPricingRecommendations(recipeIds: string[], userId: string): Promise<PricingRecommendation[]> {
    const promises = recipeIds.map(id => this.generatePricingRecommendation(id, userId))
    return Promise.all(promises)
  }

  /**
   * Get pricing insights and analytics
   */
  static async getPricingInsights(userId: string): Promise<{
    totalRecipes: number
    recipesWithPricing: number
    averageMargin: number
    marginDistribution: { low: number; medium: number; high: number }
    pricingOpportunities: Array<{
      recipeId: string
      recipeName: string
      currentMargin: number
      potentialMargin: number
      savings: number
    }>
  }> {
    try {
      const supabase = createClient()
      
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, selling_price')
        .eq('user_id', userId)
        .not('selling_price', 'is', null)

      if (error) {throw error}

      const totalRecipes = recipes?.length || 0
      const recipesWithPricing = recipes?.filter((r: Recipe) => r.selling_price && r.selling_price > 0).length || 0

      // Calculate margins (simplified - would need HPP data)
      const margins = recipes?.map((r: Recipe) => 30) || [] // Default 30% margin
      const averageMargin = margins.length > 0
        ? margins.reduce((sum: number, margin: number) => sum + margin, 0) / margins.length
        : 0

      // Margin distribution
      const marginDistribution = {
        low: margins.filter((m: number) => m < 20).length,
        medium: margins.filter((m: number) => m >= 20 && m < 40).length,
        high: margins.filter((m: number) => m >= 40).length
      }

      // Pricing opportunities (recipes with low margins that could be optimized)
      const pricingOpportunities = recipes
        ?.filter((r: Recipe) => (r.selling_price ?? 0) < 50000)
        .map((r: Recipe) => ({
          recipeId: r.id,
          recipeName: r.name,
          currentMargin: 25,
          potentialMargin: 35, // Target margin
          savings: 0 // Would need HPP calculation
        })) || []

      return {
        totalRecipes,
        recipesWithPricing,
        averageMargin: Math.round(averageMargin * 10) / 10,
        marginDistribution,
        pricingOpportunities
      }

    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Failed to get pricing insights')
      throw err
    }
  }
}
