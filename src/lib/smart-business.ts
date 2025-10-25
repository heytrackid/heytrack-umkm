/**
 * 🧠 Smart Business Logic for UMKM UMKM Management
 * Advanced automation, recommendations, and intelligent calculations
 */

// ===== SMART PRICING ENGINE =====

export interface PricingAnalysis {
  costPerPortion: number
  recommendedPrice: number
  minimumPrice: number
  competitivePrice: number
  profitMargin: number
  profitAmount: number
  priceRange: {
    low: number
    mid: number
    high: number
  }
  recommendations: string[]
  competitiveAnalysis: {
    position: 'cheap' | 'competitive' | 'premium'
    message: string
  }
}

export interface SmartIngredient {
  id: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  total: number
  // Smart features
  seasonalPricing?: boolean
  volatility: 'low' | 'medium' | 'high'
  alternatives: string[]
  nutritionScore: number
}

export interface SmartRecipe {
  id: string
  name: string
  portions: number
  ingredients: SmartIngredient[]
  // Business intelligence
  totalMaterialCost: number
  overheadCost: number
  laborCost: number
  totalCost: number
  costPerPortion: number
  // Smart pricing
  pricingAnalysis: PricingAnalysis
  // Performance metrics
  popularityScore: number
  profitabilityScore: number
  demandForecast: number
  // Recommendations
  optimizations: RecipeOptimization[]
}

export interface RecipeOptimization {
  type: 'cost_reduction' | 'quality_improvement' | 'time_saving' | 'nutrition_boost'
  title: string
  description: string
  impact: {
    costSaving?: number
    timeReduction?: number
    qualityIncrease?: number
  }
  difficulty: 'easy' | 'medium' | 'hard'
  priority: number
}

// ===== SMART PRICING CALCULATIONS =====

const BUSINESS_CONSTANTS = {
  // Cost structure
  OVERHEAD_PERCENTAGE: 15,      // Utilities, rent, equipment
  LABOR_PERCENTAGE: 25,         // Labor costs including benefits
  PROFIT_MARGIN_MIN: 30,        // Minimum sustainable margin
  PROFIT_MARGIN_RECOMMENDED: 45, // Healthy margin target
  PROFIT_MARGIN_PREMIUM: 60,    // Premium pricing margin
  
  // Market positioning
  COMPETITIVE_RANGE: 0.15,      // ±15% from market average
  
  // Risk factors
  SEASONAL_MARKUP: 1.1,         // 10% markup for seasonal ingredients
  VOLATILITY_BUFFER: {
    low: 1.0,
    medium: 1.05,               // 5% buffer for medium volatility
    high: 1.15                  // 15% buffer for high volatility
  }
}

export function calculateSmartPricing(
  ingredients: SmartIngredient[],
  portions: number,
  marketData?: {
    averagePrice?: number
    competitorPrices?: number[]
    demandLevel?: number
  }
): PricingAnalysis {
  // 1. Calculate base costs
  const materialCost = ingredients.reduce((sum, ing) => {
    let adjustedPrice = ing.total
    
    // Apply volatility buffer
    adjustedPrice *= BUSINESS_CONSTANTS.VOLATILITY_BUFFER[ing.volatility]
    
    // Seasonal pricing adjustment
    if (ing.seasonalPricing) {
      adjustedPrice *= BUSINESS_CONSTANTS.SEASONAL_MARKUP
    }
    
    return sum + adjustedPrice
  }, 0)
  
  const overheadCost = materialCost * (BUSINESS_CONSTANTS.OVERHEAD_PERCENTAGE / 100)
  const laborCost = materialCost * (BUSINESS_CONSTANTS.LABOR_PERCENTAGE / 100)
  const totalCost = materialCost + overheadCost + laborCost
  const costPerPortion = portions > 0 ? totalCost / portions : 0
  
  // 2. Calculate pricing options
  const minimumPrice = Math.ceil(
    costPerPortion * (1 + BUSINESS_CONSTANTS.PROFIT_MARGIN_MIN / 100) / 100
  ) * 100
  
  const recommendedPrice = Math.ceil(
    costPerPortion * (1 + BUSINESS_CONSTANTS.PROFIT_MARGIN_RECOMMENDED / 100) / 100
  ) * 100
  
  const premiumPrice = Math.ceil(
    costPerPortion * (1 + BUSINESS_CONSTANTS.PROFIT_MARGIN_PREMIUM / 100) / 100
  ) * 100
  
  // 3. Market analysis
  let competitivePrice = recommendedPrice
  let competitivePosition: 'cheap' | 'competitive' | 'premium' = 'competitive'
  
  if (marketData?.averagePrice) {
    const marketAvg = marketData.averagePrice
    const range = marketAvg * BUSINESS_CONSTANTS.COMPETITIVE_RANGE
    
    if (recommendedPrice < marketAvg - range) {
      competitivePosition = 'cheap'
      competitivePrice = Math.max(minimumPrice, marketAvg - range)
    } else if (recommendedPrice > marketAvg + range) {
      competitivePosition = 'premium'
      competitivePrice = Math.min(premiumPrice, marketAvg + range)
    }
  }
  
  // 4. Generate recommendations
  const recommendations: string[] = []
  const margin = ((competitivePrice - costPerPortion) / costPerPortion) * 100
  
  if (margin < BUSINESS_CONSTANTS.PROFIT_MARGIN_MIN) {
    recommendations.push("⚠️ Margin terlalu rendah! Pertimbangkan untuk mengurangi biaya atau naikkan harga")
  }
  
  if (margin > BUSINESS_CONSTANTS.PROFIT_MARGIN_PREMIUM) {
    recommendations.push("💎 Margin sangat baik! Produk ini sangat menguntungkan")
  }
  
  // High volatility ingredients warning
  const highVolatilityIngredients = ingredients.filter(ing => ing.volatility === 'high')
  if (highVolatilityIngredients.length > 0) {
    recommendations.push(
      `📈 Perhatikan fluktuasi harga: ${highVolatilityIngredients.map(ing => ing.name).join(', ')}`
    )
  }
  
  // Alternative ingredients suggestion
  const expensiveIngredients = ingredients
    .filter(ing => ing.alternatives.length > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 2)
    
  if (expensiveIngredients.length > 0) {
    recommendations.push(
      `💡 Pertimbangkan alternatif untuk: ${expensiveIngredients.map(ing => ing.name).join(', ')}`
    )
  }
  
  return {
    costPerPortion,
    recommendedPrice,
    minimumPrice,
    competitivePrice,
    profitMargin: margin,
    profitAmount: competitivePrice - costPerPortion,
    priceRange: {
      low: minimumPrice,
      mid: recommendedPrice,
      high: premiumPrice
    },
    recommendations,
    competitiveAnalysis: {
      position: competitivePosition,
      message: getCompetitiveMessage(competitivePosition, margin)
    }
  }
}

function getCompetitiveMessage(position: 'cheap' | 'competitive' | 'premium', margin: number): string {
  switch (position) {
    case 'cheap':
      return `💰 Harga kompetitif - lebih murah dari rata-rata pasar (margin ${margin.toFixed(1)}%)`
    case 'premium':
      return `👑 Posisi premium - harga di atas rata-rata pasar (margin ${margin.toFixed(1)}%)`
    default:
      return `⚖️ Harga seimbang dengan pasar (margin ${margin.toFixed(1)}%)`
  }
}

// ===== SMART INVENTORY MANAGEMENT =====

export interface SmartInventoryItem {
  id: string
  name: string
  currentStock: number
  unit: string
  pricePerUnit: number
  totalValue: number
  
  // Smart features
  minimumStock: number
  maximumStock: number
  reorderPoint: number
  reorderQuantity: number
  
  // Intelligence
  averageUsage: number          // Per week
  usageHistory: number[]        // Last 4 weeks
  demandForecast: number        // Next week prediction
  stockStatus: 'critical' | 'low' | 'optimal' | 'excess'
  
  // Supplier info
  leadTime: number              // Days to get new stock
  supplierReliability: number   // 0-100 score
  priceVolatility: 'low' | 'medium' | 'high'
  alternatives: string[]
  
  // Recommendations
  actions: InventoryAction[]
}

export interface InventoryAction {
  type: 'reorder' | 'reduce_usage' | 'find_alternative' | 'price_alert'
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  estimatedImpact: {
    costSaving?: number
    riskReduction?: number
  }
}

export function analyzeInventoryItem(
  item: Partial<SmartInventoryItem>,
  usageHistory: number[] = []
): SmartInventoryItem {
  const currentStock = item.currentStock || 0
  const minimumStock = item.minimumStock || 5
  
  // Calculate smart metrics
  const averageUsage = usageHistory.length > 0 
    ? usageHistory.reduce((sum, usage) => sum + usage, 0) / usageHistory.length
    : 0
  
  // Simple demand forecasting (moving average with trend)
  const recentUsage = usageHistory.slice(-2)
  const demandForecast = recentUsage.length >= 2
    ? recentUsage[1] + (recentUsage[1] - recentUsage[0]) * 0.5 // Trend adjustment
    : averageUsage
  
  // Calculate optimal stock levels
  const leadTime = item.leadTime || 7 // Default 1 week
  const safetyStock = averageUsage * 0.5 // 50% safety buffer
  const reorderPoint = Math.ceil((averageUsage * leadTime / 7) + safetyStock)
  const reorderQuantity = Math.ceil(averageUsage * 2) // 2 weeks supply
  const maximumStock = reorderPoint + reorderQuantity
  
  // Determine stock status
  let stockStatus: SmartInventoryItem['stockStatus'] = 'optimal'
  if (currentStock === 0) {
    stockStatus = 'critical'
  } else if (currentStock <= reorderPoint) {
    stockStatus = 'low'
  } else if (currentStock > maximumStock) {
    stockStatus = 'excess'
  }
  
  // Generate smart actions
  const actions: InventoryAction[] = []
  
  if (stockStatus === 'critical') {
    actions.push({
      type: 'reorder',
      title: 'URGENT: Stok Habis!',
      description: `Segera pesan ${reorderQuantity} ${item.unit} untuk mencegah kehabisan produksi`,
      urgency: 'critical',
      estimatedImpact: { riskReduction: 90 }
    })
  } else if (stockStatus === 'low') {
    actions.push({
      type: 'reorder',
      title: 'Perlu Restock',
      description: `Disarankan pesan ${reorderQuantity} ${item.unit} dalam ${leadTime} hari ke depan`,
      urgency: 'high',
      estimatedImpact: { riskReduction: 70 }
    })
  }
  
  if (stockStatus === 'excess') {
    actions.push({
      type: 'reduce_usage',
      title: 'Stok Berlebih',
      description: 'Pertimbangkan promosi produk yang menggunakan bahan ini',
      urgency: 'low',
      estimatedImpact: { costSaving: (currentStock - maximumStock) * (item.pricePerUnit || 0) }
    })
  }
  
  if (item.priceVolatility === 'high') {
    actions.push({
      type: 'price_alert',
      title: 'Monitor Harga',
      description: 'Harga bahan ini sering berfluktuasi, pantau tren harga',
      urgency: 'medium',
      estimatedImpact: { costSaving: (item.pricePerUnit || 0) * currentStock * 0.1 }
    })
  }
  
  if (item.alternatives && item.alternatives.length > 0) {
    actions.push({
      type: 'find_alternative',
      title: 'Cek Alternatif',
      description: `Bandingkan dengan: ${item.alternatives.join(', ')}`,
      urgency: 'low',
      estimatedImpact: { costSaving: (item.pricePerUnit || 0) * averageUsage * 0.15 }
    })
  }
  
  return {
    id: item.id || '',
    name: item.name || '',
    currentStock,
    unit: item.unit || '',
    pricePerUnit: item.pricePerUnit || 0,
    totalValue: currentStock * (item.pricePerUnit || 0),
    minimumStock,
    maximumStock,
    reorderPoint,
    reorderQuantity,
    averageUsage,
    usageHistory,
    demandForecast,
    stockStatus,
    leadTime,
    supplierReliability: item.supplierReliability || 80,
    priceVolatility: item.priceVolatility || 'medium',
    alternatives: item.alternatives || [],
    actions
  }
}

// ===== BUSINESS INTELLIGENCE DASHBOARD =====

export interface BusinessInsights {
  profitability: {
    topProducts: Array<{name: string, profit: number, margin: number}>
    leastProfitable: Array<{name: string, profit: number, margin: number}>
    averageMargin: number
  }
  inventory: {
    criticalItems: number
    excessItems: number
    totalValue: number
    turnoverRate: number
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  kpis: {
    grossMargin: number
    inventoryTurnover: number
    wasteReduction: number
    costEfficiency: number
  }
}

export function generateBusinessInsights(
  recipes: SmartRecipe[],
  inventory: SmartInventoryItem[]
): BusinessInsights {
  // Profitability analysis
  const sortedByProfit = recipes
    .map(recipe => ({
      name: recipe.name,
      profit: recipe.pricingAnalysis.profitAmount,
      margin: recipe.pricingAnalysis.profitMargin
    }))
    .sort((a, b) => b.profit - a.profit)
  
  const averageMargin = sortedByProfit.reduce((sum, item) => sum + item.margin, 0) / sortedByProfit.length
  
  // Inventory analysis
  const criticalItems = inventory.filter(item => item.stockStatus === 'critical' || item.stockStatus === 'low').length
  const excessItems = inventory.filter(item => item.stockStatus === 'excess').length
  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0)
  
  // Generate recommendations
  const immediate: string[] = []
  const shortTerm: string[] = []
  const longTerm: string[] = []
  
  // Immediate actions
  if (criticalItems > 0) {
    immediate.push(`🚨 ${criticalItems} bahan membutuhkan restok segera`)
  }
  
  if (averageMargin < BUSINESS_CONSTANTS.PROFIT_MARGIN_MIN) {
    immediate.push("💰 Review pricing - margin rata-rata terlalu rendah")
  }
  
  // Short-term recommendations
  if (excessItems > 0) {
    shortTerm.push(`📦 ${excessItems} bahan overstok - buat promosi untuk menghabiskan`)
  }
  
  const lowMarginProducts = sortedByProfit.filter(p => p.margin < BUSINESS_CONSTANTS.PROFIT_MARGIN_MIN)
  if (lowMarginProducts.length > 0) {
    shortTerm.push(`📊 Review resep dengan margin rendah: ${lowMarginProducts.slice(0, 3).map(p => p.name).join(', ')}`)
  }
  
  // Long-term recommendations
  longTerm.push("📈 Analisis tren pasar bulanan untuk penyesuaian harga")
  longTerm.push("🤝 Evaluasi supplier untuk efisiensi biaya")
  longTerm.push("🧮 Implementasi sistem forecasting untuk demand planning")
  
  return {
    profitability: {
      topProducts: sortedByProfit.slice(0, 5),
      leastProfitable: sortedByProfit.slice(-3),
      averageMargin
    },
    inventory: {
      criticalItems,
      excessItems,
      totalValue,
      turnoverRate: 12 // Placeholder
    },
    recommendations: {
      immediate,
      shortTerm,
      longTerm
    },
    kpis: {
      grossMargin: averageMargin,
      inventoryTurnover: 12, // Placeholder
      wasteReduction: 85, // Placeholder percentage
      costEfficiency: 78 // Placeholder percentage
    }
  }
}