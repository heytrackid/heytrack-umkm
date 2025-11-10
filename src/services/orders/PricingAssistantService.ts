import { dbLogger } from '@/lib/logger'
import type { Row } from '@/types/database'
import { createClient } from '@/utils/supabase/client'


type RecipeRow = Row<'recipes'>
type RecipeIngredientRow = Row<'recipe_ingredients'>
type IngredientRow = Row<'ingredients'>

type RecipeWithIngredients = RecipeRow & {
  recipe_ingredients?: Array<RecipeIngredientRow & {
    ingredient?: IngredientRow | null
  }>
}

const normalizeError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error))

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
    demandLevel: 'high' | 'low' | 'medium'
    seasonality: 'low' | 'normal' | 'peak'
    category: string
  }
  riskAssessment: {
    riskLevel: 'high' | 'low' | 'medium'
    riskFactors: string[]
  }
}

interface PricingStrategy {
  strategy: 'competition' | 'cost_plus' | 'market_based' | 'value_based'
  targetMargin: number
  reasoning: string
}

export class PricingAssistantService {
  /**
   * Generate pricing recommendation for a recipe
  */
  static async generatePricingRecommendation(recipeId: string, userId: string): Promise<PricingRecommendation> {
    try {
      const supabase = await createClient()
      dbLogger.info(`Generating pricing recommendation for recipe ${recipeId}`)

      // Get recipe details
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            *,
            ingredient:ingredients (*)
          )
        `)
        .eq('id', recipeId)
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        throw new Error(`Recipe not found: ${recipeId}`)
      }
      
      const recipe = data as RecipeWithIngredients

      const sanitizedIngredients: Array<RecipeIngredientRow & { ingredient: IngredientRow }> =
        (recipe.recipe_ingredients ?? [])
          .filter((ri): ri is RecipeIngredientRow & { ingredient: IngredientRow } => Boolean(ri.ingredient))
          .map(ri => ({
            ...ri,
            ingredient: ri.ingredient
          }))

      const recipeRow = recipe as RecipeRow
      const ingredientCostBase = sanitizedIngredients.reduce((total, ri) => {
        const price = ri.ingredient.price_per_unit ?? ri.ingredient.weighted_average_cost ?? 0
        return total + price * (ri.quantity ?? 0)
      }, 0)
      const hppValue = ingredientCostBase > 0 ? ingredientCostBase : (recipeRow.selling_price ?? 0) * 0.7

      // Analyze market factors
      const marketFactors = await this.analyzeMarketFactors(recipeRow)

      // Determine pricing strategy
      const strategy = this.determinePricingStrategy(recipeRow, marketFactors)

      // Calculate price recommendations
      const recommendations = this.calculatePriceRecommendations(
        hppValue,
        strategy,
        marketFactors
      )

      // Assess risks
      const riskAssessment = this.assessPricingRisks(recommendations, marketFactors)

      const result: PricingRecommendation = {
        recipeId,
        currentPrice: recipeRow.selling_price ?? 0,
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

    } catch (error) {
      const normalizedError = normalizeError(error)
      dbLogger.error({ error: normalizedError, recipeId }, 'Failed to generate pricing recommendation')
      throw normalizedError
    }
  }

  /**
   * Analyze market factors for pricing
   */
  private static async analyzeMarketFactors(recipe: RecipeRow): Promise<PricingRecommendation['marketFactors']> {
    try {
      const supabase = await createClient()
      
      // Get competitor prices from similar recipes in same category
      const { data: similarRecipes } = await supabase
        .from('recipes')
        .select('selling_price')
        .eq('category', recipe.category ?? '')
        .eq('user_id', recipe.user_id)
        .neq('id', recipe['id'])
        .not('selling_price', 'is', null)
        .limit(10)

      const competitorPrices = (similarRecipes as Array<{ selling_price: number | null }> || [])
        .map(r => r.selling_price ?? 0)
        .filter(price => price > 0)

      // Determine demand level based on recipe usage
      const demandLevel = this.calculateDemandLevel(recipe.times_made ?? 0)

      // Determine seasonality based on category and current month
      const seasonality = this.calculateSeasonality(recipe.category)

      return {
        competitorPrices,
        demandLevel,
        seasonality,
        category: recipe.category ?? 'General'
      }

    } catch (error) {
      const normalizedError = normalizeError(error)
      dbLogger.warn({ error: normalizedError }, 'Failed to analyze market factors, using defaults')
      return {
        competitorPrices: [],
        demandLevel: 'medium',
        seasonality: 'normal',
        category: recipe.category ?? 'General'
      }
    }
  }

  /**
   * Determine pricing strategy based on recipe and market factors
   */
  private static determinePricingStrategy(
    recipe: RecipeRow,
    marketFactors: PricingRecommendation['marketFactors']
  ): PricingStrategy {
    const hppMargin = recipe.margin_percentage ?? 30

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
    strategy: PricingStrategy,
    marketFactors: PricingRecommendation['marketFactors']
  ): Pick<PricingRecommendation, 'recommendedPrice' | 'minPrice' | 'maxPrice' | 'optimalMargin' | 'reasoning' | 'confidence'> {
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

      case 'cost_plus':
      case 'value_based':
      default:
        reasoning.push('Cost-plus pricing baseline applied')
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

    let riskLevel: 'high' | 'low' | 'medium' = 'low'
    if (riskFactors.length > 2) {
      riskLevel = 'high'
    } else if (riskFactors.length > 0) {
      riskLevel = 'medium'
    }

    return {
      riskLevel,
      riskFactors
    }
  }

  /**
   * Calculate demand level based on usage
   */
  private static calculateDemandLevel(timesMade: number): 'high' | 'low' | 'medium' {
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
  static generateBulkPricingRecommendations(recipeIds: string[], userId: string): Promise<PricingRecommendation[]> {
    return Promise.all(recipeIds.map(id => this.generatePricingRecommendation(id, userId)))
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
      const supabase = await createClient()

      interface RecipePricingRow { id: string; name: string | null; selling_price: number | null }

      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, selling_price')
        .eq('user_id', userId)
        .not('selling_price', 'is', null)

      if (error) {throw error}

      const recipeRows: RecipePricingRow[] = recipes ?? []

      const totalRecipes = recipeRows.length
      const recipesWithPricing = recipeRows.filter((r) => (r.selling_price ?? 0) > 0).length

      // Calculate margins (simplified - would need HPP data)
      const margins = recipeRows.map(() => 30) // Default 30% margin
      const averageMargin = margins.length > 0
        ? margins.reduce((sum, margin) => sum + margin, 0) / margins.length
        : 0

      // Margin distribution
      const marginDistribution = {
        low: margins.filter(m => m < 20).length,
        medium: margins.filter(m => m >= 20 && m < 40).length,
        high: margins.filter(m => m >= 40).length
      }

      // Pricing opportunities (recipes with low margins that could be optimized)
      const pricingOpportunities = recipeRows
        .filter((r): r is RecipePricingRow & { selling_price: number } => typeof r.selling_price === 'number' && r.selling_price < 50000)
        .map((r) => ({
          recipeId: r['id'],
          recipeName: r.name ?? 'Unknown recipe',
          currentMargin: 25,
          potentialMargin: 35, // Target margin
          savings: 0 // Would need HPP calculation
        }))

      return {
        totalRecipes,
        recipesWithPricing,
        averageMargin: Math.round(averageMargin * 10) / 10,
        marginDistribution,
        pricingOpportunities
      }

    } catch (error) {
      const normalizedError = normalizeError(error)
      dbLogger.error({ error: normalizedError }, 'Failed to get pricing insights')
      throw normalizedError
    }
  }
}
