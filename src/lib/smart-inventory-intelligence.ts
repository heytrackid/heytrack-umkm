/**
 * 🧠 Smart Inventory Intelligence 
 * Converts basic inventory data to intelligent insights with forecasting
 */

interface BasicIngredient {
  id: string
  nama: string
  stok: number
  satuan: string
  harga: number
  stokMinimal: number
  total: number
  statusStok: 'aman' | 'rendah' | 'habis'
}

interface SmartIngredientItem extends BasicIngredient {
  // Smart features
  averageUsage: number        // Per week
  usageHistory: number[]      // Last 4 weeks
  demandForecast: number      // Next week prediction
  reorderPoint: number
  reorderQuantity: number
  leadTime: number            // Days to get new stock
  volatility: 'low' | 'medium' | 'high'
  alternatives: string[]
  seasonality: boolean
  supplierReliability: number // 0-100 score
  priceHistory: number[]      // Last 4 weeks prices
  
  // Smart recommendations
  actions: SmartAction[]
}

interface SmartAction {
  type: 'reorder' | 'reduce_usage' | 'find_alternative' | 'price_alert' | 'seasonal_prep'
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  estimatedImpact: {
    costSaving?: number
    riskReduction?: number
    efficiency?: number
  }
  actionButton?: {
    label: string
    onClick: () => void
  }
}

// Smart ingredient database with usage patterns and market intelligence
const SMART_INGREDIENT_DB: Record<string, Partial<SmartIngredientItem>> = {
  'tepung terigu': {
    averageUsage: 15,
    usageHistory: [12, 18, 16, 14],
    volatility: 'medium',
    alternatives: ['tepung tapioka', 'tepung beras', 'tepung jagung'],
    seasonality: false,
    supplierReliability: 85,
    priceHistory: [11500, 12000, 12200, 12000],
    leadTime: 3
  },
  'mentega': {
    averageUsage: 5,
    usageHistory: [4, 6, 7, 3],
    volatility: 'high',
    alternatives: ['margarin', 'minyak kelapa', 'butter imported'],
    seasonality: true,
    supplierReliability: 75,
    priceHistory: [43000, 45000, 47000, 45000],
    leadTime: 5
  },
  'telur': {
    averageUsage: 8,
    usageHistory: [6, 10, 9, 7],
    volatility: 'high',
    alternatives: ['telur bebek', 'egg substitute powder'],
    seasonality: true,
    supplierReliability: 70,
    priceHistory: [26000, 28000, 30000, 28000],
    leadTime: 2
  },
  'gula': {
    averageUsage: 10,
    usageHistory: [9, 12, 10, 8],
    volatility: 'medium',
    alternatives: ['gula aren', 'gula kelapa', 'madu'],
    seasonality: false,
    supplierReliability: 90,
    priceHistory: [13000, 13500, 13200, 13000],
    leadTime: 4
  },
  'susu': {
    averageUsage: 6,
    usageHistory: [5, 7, 6, 6],
    volatility: 'low',
    alternatives: ['susu kental manis', 'santan', 'susu bubuk'],
    seasonality: false,
    supplierReliability: 88,
    priceHistory: [15000, 15200, 15100, 15000],
    leadTime: 3
  },
  'ragi': {
    averageUsage: 2,
    usageHistory: [1.5, 2.5, 2, 1.8],
    volatility: 'low',
    alternatives: ['baking soda', 'cream of tartar'],
    seasonality: false,
    supplierReliability: 95,
    priceHistory: [8000, 8200, 8100, 8000],
    leadTime: 7
  },
  'cokelat': {
    averageUsage: 4,
    usageHistory: [3, 5, 4.5, 3.5],
    volatility: 'high',
    alternatives: ['cokelat bubuk', 'cocoa powder imported'],
    seasonality: true,
    supplierReliability: 80,
    priceHistory: [35000, 38000, 36000, 35000],
    leadTime: 6
  },
  'vanilla': {
    averageUsage: 1,
    usageHistory: [0.8, 1.2, 1, 1.1],
    volatility: 'medium',
    alternatives: ['vanilla extract', 'vanilla paste'],
    seasonality: false,
    supplierReliability: 85,
    priceHistory: [25000, 26000, 25500, 25000],
    leadTime: 8
  }
}

/**
 * Convert basic ingredient to smart ingredient with intelligence
 */
export function enhanceIngredientWithIntelligence(
  basicIngredient: BasicIngredient, 
  historicalData?: Partial<SmartIngredientItem>
): SmartIngredientItem {
  const ingredientKey = basicIngredient.nama.toLowerCase()
  const smartData = SMART_INGREDIENT_DB[ingredientKey] || {}
  
  // Merge with historical data if provided
  const merged = { ...smartData, ...historicalData }
  
  // Calculate smart metrics
  const averageUsage = merged.averageUsage || estimateUsageFromStock(basicIngredient)
  const usageHistory = merged.usageHistory || generateMockUsageHistory(averageUsage)
  const demandForecast = calculateDemandForecast(usageHistory)
  const leadTime = merged.leadTime || 5 // Default 5 days
  const volatility = merged.volatility || determineVolatility(basicIngredient.nama)
  const alternatives = merged.alternatives || []
  const seasonality = merged.seasonality || false
  const supplierReliability = merged.supplierReliability || 80
  const priceHistory = merged.priceHistory || generateMockPriceHistory(basicIngredient.harga)
  
  // Calculate reorder metrics
  const safetyStock = averageUsage * 0.5 // 50% safety buffer
  const reorderPoint = Math.ceil((averageUsage * leadTime / 7) + safetyStock)
  const reorderQuantity = Math.ceil(averageUsage * 2) // 2 weeks supply
  
  // Generate smart actions
  const actions = generateSmartActions({
    ...basicIngredient,
    averageUsage,
    demandForecast,
    reorderPoint,
    reorderQuantity,
    leadTime,
    volatility,
    alternatives,
    supplierReliability,
    priceHistory
  })
  
  return {
    ...basicIngredient,
    averageUsage,
    usageHistory,
    demandForecast,
    reorderPoint,
    reorderQuantity,
    leadTime,
    volatility,
    alternatives,
    seasonality,
    supplierReliability,
    priceHistory,
    actions
  }
}

/**
 * Estimate usage from current stock levels and status
 */
function estimateUsageFromStock(ingredient: BasicIngredient): number {
  if (ingredient.statusStok === 'habis') return ingredient.stokMinimal * 2
  if (ingredient.statusStok === 'rendah') return ingredient.stok * 1.5
  return ingredient.stok * 0.3 // Conservative estimate for healthy stock
}

/**
 * Generate mock usage history for forecasting
 */
function generateMockUsageHistory(averageUsage: number): number[] {
  const variance = averageUsage * 0.3 // 30% variance
  return Array.from({ length: 4 }, () => {
    const random = (Math.random() - 0.5) * 2 * variance
    return Math.max(0, averageUsage + random)
  })
}

/**
 * Calculate demand forecast using simple moving average with trend
 */
function calculateDemandForecast(usageHistory: number[]): number {
  if (usageHistory.length < 2) return usageHistory[0] || 0
  
  const recent = usageHistory.slice(-2)
  const trend = recent.length >= 2 ? (recent[1] - recent[0]) * 0.5 : 0
  const average = usageHistory.reduce((sum, usage) => sum + usage, 0) / usageHistory.length
  
  return Math.max(0, average + trend)
}

/**
 * Determine price volatility based on ingredient type
 */
function determineVolatility(ingredientName: string): 'low' | 'medium' | 'high' {
  const name = ingredientName.toLowerCase()
  
  // High volatility ingredients
  if (name.includes('telur') || name.includes('mentega') || name.includes('cokelat')) {
    return 'high'
  }
  
  // Low volatility ingredients
  if (name.includes('tepung') || name.includes('gula') || name.includes('susu')) {
    return 'medium'
  }
  
  // Default medium volatility
  return 'medium'
}

/**
 * Generate mock price history
 */
function generateMockPriceHistory(currentPrice: number): number[] {
  const variance = currentPrice * 0.1 // 10% price variance
  return Array.from({ length: 4 }, (_, index) => {
    const random = (Math.random() - 0.5) * 2 * variance
    // Trend slightly toward current price
    const trendFactor = (index - 1.5) * 0.02 * currentPrice
    return Math.max(0, currentPrice + random + trendFactor)
  })
}

/**
 * Generate smart actions based on ingredient analysis
 */
function generateSmartActions(item: Partial<SmartIngredientItem>): SmartAction[] {
  const actions: SmartAction[] = []
  
  // Critical stock situation
  if (item.statusStok === 'habis') {
    actions.push({
      type: 'reorder',
      title: 'URGENT: Stok Habis!',
      description: `Segera pesan ${item.reorderQuantity} ${item.satuan} untuk mencegah produksi terhenti`,
      urgency: 'critical',
      estimatedImpact: { riskReduction: 95, efficiency: 80 }
    })
  } else if (item.stok && item.reorderPoint && item.stok <= item.reorderPoint) {
    actions.push({
      type: 'reorder',
      title: 'Perlu Restock',
      description: `Disarankan pesan ${item.reorderQuantity} ${item.satuan} dalam ${item.leadTime} hari ke depan`,
      urgency: item.stok <= (item.reorderPoint! * 0.5) ? 'high' : 'medium',
      estimatedImpact: { riskReduction: 70 }
    })
  }
  
  // High volatility warning
  if (item.volatility === 'high') {
    actions.push({
      type: 'price_alert',
      title: 'Monitor Harga',
      description: 'Harga bahan ini sering berfluktuasi, pantau tren pasar secara aktif',
      urgency: 'medium',
      estimatedImpact: { costSaving: (item.harga! * (item.stok || 0)) * 0.1 }
    })
  }
  
  // Supplier reliability issues
  if (item.supplierReliability && item.supplierReliability < 80) {
    actions.push({
      type: 'find_alternative',
      title: 'Evaluasi Supplier',
      description: `Supplier reliability ${item.supplierReliability}%. Pertimbangkan mencari supplier cadangan`,
      urgency: item.supplierReliability < 70 ? 'high' : 'medium',
      estimatedImpact: { riskReduction: 50, efficiency: 20 }
    })
  }
  
  // Alternative ingredients suggestion
  if (item.alternatives && item.alternatives.length > 0 && item.harga && item.harga > 20000) {
    actions.push({
      type: 'find_alternative',
      title: 'Cek Alternatif Hemat',
      description: `Bahan ini cukup mahal. Coba alternatif: ${item.alternatives.slice(0, 2).join(', ')}`,
      urgency: 'low',
      estimatedImpact: { costSaving: item.harga * 0.15 * (item.averageUsage! / 4) } // 15% savings per week
    })
  }
  
  // Seasonal preparation
  if (item.seasonality && item.volatility === 'high') {
    actions.push({
      type: 'seasonal_prep',
      title: 'Persiapan Musiman',
      description: 'Bahan ini terpengaruh musim. Pertimbangkan stok tambahan menjelang puncak musim',
      urgency: 'low',
      estimatedImpact: { riskReduction: 30, costSaving: item.harga! * 0.05 * (item.averageUsage! / 4) }
    })
  }
  
  // Demand forecast vs stock warning
  if (item.demandForecast && item.stok && item.demandForecast > item.stok) {
    actions.push({
      type: 'reorder',
      title: 'Prediksi Kekurangan',
      description: `Prediksi kebutuhan minggu depan ${item.demandForecast.toFixed(1)} ${item.satuan}, stok saat ini ${item.stok} ${item.satuan}`,
      urgency: 'medium',
      estimatedImpact: { riskReduction: 60 }
    })
  }
  
  return actions
}

/**
 * Batch enhance multiple ingredients
 */
export function enhanceInventoryWithIntelligence(
  basicIngredients: BasicIngredient[]
): SmartIngredientItem[] {
  return basicIngredients.map(ingredient => 
    enhanceIngredientWithIntelligence(ingredient)
  )
}

/**
 * Generate overall inventory insights
 */
export function generateInventoryInsights(smartItems: SmartIngredientItem[]) {
  const totalActions = smartItems.reduce((sum, item) => sum + item.actions.length, 0)
  const criticalActions = smartItems.reduce((sum, item) => 
    sum + item.actions.filter(a => a.urgency === 'critical').length, 0
  )
  const highVolatilityItems = smartItems.filter(item => item.volatility === 'high')
  const poorSuppliers = smartItems.filter(item => item.supplierReliability < 80)
  
  const insights = []
  
  if (criticalActions > 0) {
    insights.push(`🚨 ${criticalActions} aksi kritis perlu segera ditangani`)
  }
  
  if (highVolatilityItems.length > 0) {
    insights.push(`📈 ${highVolatilityItems.length} bahan dengan volatilitas tinggi perlu dipantau`)
  }
  
  if (poorSuppliers.length > 0) {
    insights.push(`🔄 ${poorSuppliers.length} supplier memiliki reliability rendah`)
  }
  
  const averageLeadTime = smartItems.reduce((sum, item) => sum + item.leadTime, 0) / smartItems.length
  if (averageLeadTime > 5) {
    insights.push(`⏱️ Lead time rata-rata ${averageLeadTime.toFixed(1)} hari - pertimbangkan supplier lokal`)
  }
  
  const totalPotentialSavings = smartItems.reduce((sum, item) => {
    return sum + item.actions.reduce((actionSum, action) => 
      actionSum + (action.estimatedImpact.costSaving || 0), 0
    )
  }, 0)
  
  if (totalPotentialSavings > 50000) {
    insights.push(`💰 Potensi penghematan Rp ${totalPotentialSavings.toLocaleString()} dengan optimasi`)
  }
  
  return insights
}

export type { SmartIngredientItem, SmartAction }