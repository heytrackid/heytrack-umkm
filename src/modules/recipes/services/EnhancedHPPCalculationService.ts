// Types for Ingredient and StockTransaction
interface Ingredient {
  id: string
  name: string
  price_per_unit: number
  [key: string]: unknown
}

interface StockTransaction {
  id: string
  ingredient_id: string
  type: 'purchase' | 'usage' | 'adjustment'
  quantity: number
  unit_price?: number
  total_cost?: number
  transaction_date: string
  [key: string]: unknown
}

interface Recipe {
  id: string
  name: string
  servings?: number
}

interface RecipeIngredient {
  id: string
  recipe_id: string
  ingredient_id: string
  quantity: number
  unit: string
  ingredient?: Ingredient
}

interface OperationalCost {
  id: string
  name: string
  amount: number
  type: 'monthly' | 'daily' | 'per_batch'
}

/**
 * Enhanced HPP Calculation Service dengan Weighted Average Cost
 * 
 * Service yang menghitung HPP (Harga Pokok Produksi) dengan akurasi tinggi
 * menggunakan harga rata-rata tertimbang dari pembelian bahan baku.
 */
export class EnhancedHPPCalculationService {

  /**
   * Calculate HPP untuk recipe dengan berbagai metode pricing
   */
  static async calculateHPP(
    recipe: Recipe,
    recipeIngredients: RecipeIngredient[],
    operationalCosts: OperationalCost[],
    stockTransactions: StockTransaction[],
    options: HPPCalculationOptions = {}
  ): Promise<HPPCalculationResult> {

    const {
      pricingMethod = 'moving',
      includeOperationalCosts = true,
      profitMarginPercent = 30,
      overheadAllocationMethod = 'per_batch'
    } = options

    // 1. Calculate raw material costs dengan pricing method yang dipilih
    const materialCosts = this.calculateMaterialCosts(
      recipeIngredients, 
      stockTransactions, 
      pricingMethod
    )

    // 2. Calculate operational costs allocation
    const operationalCostPerUnit = includeOperationalCosts ? 
      this.calculateOperationalCostPerUnit(operationalCosts, recipe.servings || 1, overheadAllocationMethod) : 0

    // 3. Calculate total HPP
    const totalMaterialCost = materialCosts.totalCost
    const totalOperationalCost = operationalCostPerUnit * (recipe.servings || 1)
    const totalHPP = totalMaterialCost + totalOperationalCost

    // 4. Calculate per unit costs
    const servings = recipe.servings || 1
    const hppPerUnit = totalHPP / servings
    const materialCostPerUnit = totalMaterialCost / servings

    // 5. Calculate suggested selling price dengan profit margin
    const suggestedPrice = hppPerUnit * (1 + (profitMarginPercent / 100))

    // 6. Generate pricing alternatives
    const pricingAlternatives = this.generatePricingAlternatives(
      recipeIngredients,
      stockTransactions,
      operationalCostPerUnit,
      servings
    )

    // 7. Analyze cost components
    const costBreakdown = this.analyzeCostBreakdown(
      materialCosts,
      operationalCostPerUnit,
      servings
    )

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      servings,
      pricingMethod,
      calculations: {
        totalMaterialCost,
        totalOperationalCost,
        totalHPP,
        hppPerUnit,
        materialCostPerUnit,
        operationalCostPerUnit,
        suggestedSellingPrice: suggestedPrice,
        profitMarginPercent
      },
      materialCosts,
      costBreakdown,
      pricingAlternatives,
      recommendations: this.generateHPPRecommendations(
        materialCosts,
        operationalCostPerUnit,
        hppPerUnit,
        suggestedPrice
      ),
      calculatedAt: new Date().toISOString()
    }
  }

  /**
   * Calculate material costs dengan berbagai pricing methods
   */
  private static calculateMaterialCosts(
    recipeIngredients: RecipeIngredient[],
    stockTransactions: StockTransaction[],
    pricingMethod: PricingMethod
  ): MaterialCostCalculation {

    const ingredientCosts: IngredientCost[] = []
    let totalCost = 0

    for (const recipeIngredient of recipeIngredients) {
      if (!recipeIngredient.ingredient) continue

      const ingredient = recipeIngredient.ingredient
      const quantity = recipeIngredient.quantity

      // Get pricing berdasarkan method yang dipilih
      let unitPrice = ingredient.price_per_unit

      if (pricingMethod !== 'list_price') {
        unitPrice = this.calculatePriceWithMethod(
          ingredient,
          stockTransactions,
          pricingMethod
        )
      }

      // Get pricing insights untuk comparison
      const pricingInsights = this.generatePricingInsights(
        ingredient,
        stockTransactions.filter(t => t.ingredient_id === ingredient.id)
      )

      const ingredientTotalCost = quantity * unitPrice

      ingredientCosts.push({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        quantity,
        unit: recipeIngredient.unit,
        unitPrice,
        totalCost: ingredientTotalCost,
        pricingInsights,
        priceComparison: {
          listPrice: ingredient.price_per_unit,
          weightedAverage: pricingInsights.weightedAveragePrice,
          fifoAverage: pricingInsights.fifoAveragePrice,
          movingAverage: pricingInsights.movingAveragePrice,
          usedPrice: unitPrice,
          pricingMethod
        }
      })

      totalCost += ingredientTotalCost
    }

    return {
      ingredientCosts,
      totalCost: Math.round(totalCost * 100) / 100,
      pricingMethod
    }
  }

  /**
   * Calculate operational cost per unit
   */
  private static calculateOperationalCostPerUnit(
    operationalCosts: OperationalCost[],
    servings: number,
    allocationMethod: 'per_batch' | 'per_unit' | 'monthly_allocation'
  ): number {

    if (operationalCosts.length === 0) return 0

    let totalCost = 0

    for (const cost of operationalCosts) {
      switch (cost.type) {
        case 'per_batch':
          totalCost += cost.amount / servings
          break
        case 'daily':
          // Assume 1 batch per day, adjust as needed
          totalCost += cost.amount / servings
          break
        case 'monthly':
          // Assume 30 batches per month, adjust as needed
          totalCost += (cost.amount / 30) / servings
          break
        default:
          totalCost += cost.amount / servings
      }
    }

    return Math.round(totalCost * 100) / 100
  }

  /**
   * Generate pricing alternatives dengan berbagai methods
   */
  private static generatePricingAlternatives(
    recipeIngredients: RecipeIngredient[],
    stockTransactions: StockTransaction[],
    operationalCostPerUnit: number,
    servings: number
  ): PricingAlternative[] {

    const methods: PricingMethod[] = ['list_price', 'weighted', 'fifo', 'moving', 'latest']
    const alternatives: PricingAlternative[] = []

    for (const method of methods) {
      const materialCosts = this.calculateMaterialCosts(recipeIngredients, stockTransactions, method)
      const totalCost = materialCosts.totalCost + (operationalCostPerUnit * servings)
      const costPerUnit = totalCost / servings

      alternatives.push({
        method,
        materialCost: materialCosts.totalCost,
        operationalCost: operationalCostPerUnit * servings,
        totalCost,
        costPerUnit,
        methodDescription: this.getPricingMethodDescription(method)
      })
    }

    return alternatives
  }

  /**
   * Analyze cost breakdown by percentage
   */
  private static analyzeCostBreakdown(
    materialCosts: MaterialCostCalculation,
    operationalCostPerUnit: number,
    servings: number
  ): CostBreakdown {

    const totalOperationalCost = operationalCostPerUnit * servings
    const totalCost = materialCosts.totalCost + totalOperationalCost

    const materialPercentage = totalCost > 0 ? (materialCosts.totalCost / totalCost) * 100 : 0
    const operationalPercentage = totalCost > 0 ? (totalOperationalCost / totalCost) * 100 : 0

    // Break down by ingredient
    const ingredientBreakdown = materialCosts.ingredientCosts.map(ingredient => ({
      ingredientName: ingredient.ingredientName,
      cost: ingredient.totalCost,
      percentage: totalCost > 0 ? (ingredient.totalCost / totalCost) * 100 : 0
    }))

    return {
      totalCost,
      materialCost: materialCosts.totalCost,
      operationalCost: totalOperationalCost,
      materialPercentage: Math.round(materialPercentage * 100) / 100,
      operationalPercentage: Math.round(operationalPercentage * 100) / 100,
      ingredientBreakdown: ingredientBreakdown.sort((a, b) => b.percentage - a.percentage)
    }
  }

  /**
   * Generate HPP recommendations
   */
  private static generateHPPRecommendations(
    materialCosts: MaterialCostCalculation,
    operationalCostPerUnit: number,
    hppPerUnit: number,
    suggestedPrice: number
  ): string[] {

    const recommendations: string[] = []

    // Material cost recommendations
    const highCostIngredients = materialCosts.ingredientCosts
      .filter(ingredient => (ingredient.totalCost / materialCosts.totalCost) > 0.3)

    if (highCostIngredients.length > 0) {
      recommendations.push(
        `💰 Bahan dengan cost tertinggi: ${highCostIngredients[0].ingredientName} (${Math.round((highCostIngredients[0].totalCost / materialCosts.totalCost) * 100)}%)`
      )
    }

    // Pricing method recommendations
    const volatileIngredients = materialCosts.ingredientCosts
      .filter(ingredient => ingredient.pricingInsights.priceVolatility.coefficient > 0.15)

    if (volatileIngredients.length > 0) {
      recommendations.push('📊 Ada bahan dengan harga fluktuatif - pertimbangkan review HPP berkala')
    }

    // Price comparison recommendations
    const priceDifferences = materialCosts.ingredientCosts
      .filter(ingredient => {
        const priceDiff = Math.abs(ingredient.priceComparison.usedPrice - ingredient.priceComparison.listPrice)
        return (priceDiff / ingredient.priceComparison.listPrice) > 0.1
      })

    if (priceDifferences.length > 0) {
      recommendations.push('⚠️ Harga aktual berbeda >10% dari list price - update price list')
    }

    // HPP vs Market recommendations
    if (hppPerUnit < 5000) {
      recommendations.push('✅ HPP rendah - margin profit bisa ditingkatkan')
    } else if (hppPerUnit > 50000) {
      recommendations.push('🎯 HPP tinggi - review efisiensi bahan dan proses')
    }

    // Operational cost recommendations
    const operationalRatio = operationalCostPerUnit / (hppPerUnit + operationalCostPerUnit)
    if (operationalRatio > 0.4) {
      recommendations.push('🏭 Biaya operasional >40% dari HPP - review efisiensi operasional')
    }

    return recommendations
  }

  /**
   * Get pricing method description
   */
  private static getPricingMethodDescription(method: PricingMethod): string {
    const descriptions = {
      'list_price': 'Menggunakan harga list price tetap',
      'weighted': 'Rata-rata tertimbang dari semua pembelian',
      'fifo': 'First In First Out - harga pembelian terakhir keluar lebih dulu',
      'moving': 'Moving average - menyesuaikan setiap transaksi',
      'latest': 'Harga pembelian terakhir'
    }
    return descriptions[method] || method
  }

  /**
   * Calculate price with different pricing methods
   */
  private static calculatePriceWithMethod(
    ingredient: Ingredient,
    stockTransactions: StockTransaction[],
    method: PricingMethod
  ): number {
    const purchases = stockTransactions
      .filter(t => t.ingredient_id === ingredient.id && t.type === 'purchase' && t.unit_price)
      .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())

    if (purchases.length === 0) {
      return ingredient.price_per_unit
    }

    switch (method) {
      case 'weighted':
        const totalCost = purchases.reduce((sum, t) => sum + ((t.total_cost || 0) || (t.quantity * (t.unit_price || 0))), 0)
        const totalQuantity = purchases.reduce((sum, t) => sum + t.quantity, 0)
        return totalQuantity > 0 ? totalCost / totalQuantity : ingredient.price_per_unit

      case 'fifo':
        return purchases[0].unit_price || ingredient.price_per_unit

      case 'latest':
        return purchases[purchases.length - 1].unit_price || ingredient.price_per_unit

      case 'moving':
        const recentPurchases = purchases.slice(-5)
        const avgPrice = recentPurchases.reduce((sum, t) => sum + (t.unit_price || 0), 0) / recentPurchases.length
        return avgPrice || ingredient.price_per_unit

      default:
        return ingredient.price_per_unit
    }
  }

  /**
   * Generate pricing insights
   */
  private static generatePricingInsights(
    ingredient: Ingredient,
    transactions: StockTransaction[]
  ): unknown {
    const purchases = transactions
      .filter(t => t.type === 'purchase' && t.unit_price)
      .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())

    if (purchases.length === 0) {
      return {
        weightedAveragePrice: ingredient.price_per_unit,
        fifoAveragePrice: ingredient.price_per_unit,
        movingAveragePrice: ingredient.price_per_unit,
        latestPrice: ingredient.price_per_unit,
        priceVolatility: { coefficient: 0, trend: 'stable' }
      }
    }

    const totalCost = purchases.reduce((sum, t) => sum + ((t.total_cost || 0) || (t.quantity * (t.unit_price || 0))), 0)
    const totalQuantity = purchases.reduce((sum, t) => sum + t.quantity, 0)
    const weightedAvg = totalQuantity > 0 ? totalCost / totalQuantity : ingredient.price_per_unit

    const prices = purchases.map(t => t.unit_price || 0)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length
    const stdDev = Math.sqrt(variance)
    const coefficient = avgPrice > 0 ? stdDev / avgPrice : 0

    return {
      weightedAveragePrice: weightedAvg,
      fifoAveragePrice: purchases[0].unit_price || ingredient.price_per_unit,
      movingAveragePrice: prices.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, prices.length),
      latestPrice: purchases[purchases.length - 1].unit_price || ingredient.price_per_unit,
      priceVolatility: {
        coefficient,
        trend: coefficient > 0.15 ? 'volatile' : 'stable'
      }
    }
  }
}

// Types dan interfaces
type PricingMethod = 'list_price' | 'weighted' | 'fifo' | 'moving' | 'latest'

interface HPPCalculationOptions {
  pricingMethod?: PricingMethod
  includeOperationalCosts?: boolean
  profitMarginPercent?: number
  overheadAllocationMethod?: 'per_batch' | 'per_unit' | 'monthly_allocation'
}

interface IngredientCost {
  ingredientId: string
  ingredientName: string
  quantity: number
  unit: string
  unitPrice: number
  totalCost: number
  pricingInsights: PricingInsights // Pricing insights data
  priceComparison: {
    listPrice: number
    weightedAverage: number
    fifoAverage: number
    movingAverage: number
    usedPrice: number
    pricingMethod: PricingMethod
  }
}


interface PricingInsights {
  marketRate: number
  competitorPrices: number[]
  suggestedPrice: number
  priceConfidenceScore: number
  seasonalAdjustments: Record<string, number>
  historicalTrends: {
    last30Days: number[]
    last90Days: number[]
    yearOverYear: number
  }
  costBasedRecommendations: {
    breakEvenPrice: number
    targetMarginPrice: number
    premiumPrice: number
  }
  demandFactors: {
    popularityScore: number
    seasonalityImpact: number
    competitionLevel: 'low' | 'medium' | 'high'
  }
}

interface MaterialCostCalculation {
  ingredientCosts: IngredientCost[]
  totalCost: number
  pricingMethod: PricingMethod
}

interface PricingAlternative {
  method: PricingMethod
  materialCost: number
  operationalCost: number
  totalCost: number
  costPerUnit: number
  methodDescription: string
}

interface CostBreakdown {
  totalCost: number
  materialCost: number
  operationalCost: number
  materialPercentage: number
  operationalPercentage: number
  ingredientBreakdown: {
    ingredientName: string
    cost: number
    percentage: number
  }[]
}

interface HPPCalculationResult {
  recipeId: string
  recipeName: string
  servings: number
  pricingMethod: PricingMethod
  calculations: {
    totalMaterialCost: number
    totalOperationalCost: number
    totalHPP: number
    hppPerUnit: number
    materialCostPerUnit: number
    operationalCostPerUnit: number
    suggestedSellingPrice: number
    profitMarginPercent: number
  }
  materialCosts: MaterialCostCalculation
  costBreakdown: CostBreakdown
  pricingAlternatives: PricingAlternative[]
  recommendations: string[]
  calculatedAt: string
}

export type { 
  HPPCalculationOptions, 
  HPPCalculationResult, 
  PricingMethod,
  IngredientCost,
  MaterialCostCalculation,
  PricingAlternative,
  CostBreakdown
}
