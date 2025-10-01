import { 
  IngredientWithStats, 
  StockAlert, 
  ReorderPoint,
  StockTransaction,
  Ingredient 
} from './types'
import { 
  STOCK_ALERT_THRESHOLDS, 
  REORDER_CALCULATIONS,
  STOCK_TRANSACTION_TYPES 
} from './constants'

/**
 * Calculate reorder point berdasarkan usage history dan lead time
 */
export function calculateReorderPoint(
  ingredient: Ingredient,
  usageHistory: StockTransaction[]
): ReorderPoint {
  const { SAFETY_STOCK_MULTIPLIER, LEAD_TIME_DEFAULT_DAYS, USAGE_CALCULATION_PERIOD_DAYS } = REORDER_CALCULATIONS
  
  // Calculate average daily usage dari 30 hari terakhir
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - USAGE_CALCULATION_PERIOD_DAYS)
  
  const recentUsage = usageHistory
    .filter(t => 
      new Date(t.created_at) >= thirtyDaysAgo && 
      t.type === 'USAGE'
    )
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0)
  
  const averageDailyUsage = recentUsage / USAGE_CALCULATION_PERIOD_DAYS
  
  // Calculate safety stock
  const safetyStock = averageDailyUsage * SAFETY_STOCK_MULTIPLIER
  
  // Calculate reorder point
  const leadTime = LEAD_TIME_DEFAULT_DAYS
  const reorderPoint = (averageDailyUsage * leadTime) + safetyStock
  
  // Recommended order quantity (EOQ simplified)
  const recommendedOrderQuantity = Math.max(
    averageDailyUsage * 14, // 2 weeks supply
    ingredient.min_stock ?? 0 * 2,
    REORDER_CALCULATIONS.MIN_ORDER_QUANTITY
  )
  
  return {
    ingredient_id: ingredient.id,
    min_stock: Math.max(reorderPoint, ingredient.min_stock),
    recommended_order_quantity: Math.ceil(recommendedOrderQuantity),
    lead_time_days: leadTime,
    safety_stock: Math.ceil(safetyStock),
    average_daily_usage: Number(averageDailyUsage.toFixed(2))
  }
}

/**
 * Calculate total value dari stock berdasarkan current_stock dan price_per_unit
 */
export function calculateStockValue(ingredient: Ingredient): number {
  return ingredient.current_stock ?? 0 * ingredient.price_per_unit
}

/**
 * Format stock unit untuk display
 */
export function formatStockUnit(quantity: number, unit: string): string {
  const formatted = quantity.toLocaleString('id-ID', {
    minimumFractionDigits: unit === 'g' || unit === 'ml' ? 0 : 2,
    maximumFractionDigits: unit === 'g' || unit === 'ml' ? 0 : 2
  })

  return `${formatted} ${unit}`
}

/**
 * Get stock alerts berdasarkan current stock vs min stock
 */
export function getStockAlerts(ingredients: Ingredient[]): StockAlert[] {
  const alerts: StockAlert[] = []
  
  ingredients.forEach(ingredient => {
    const stockRatio = ingredient.current_stock ?? 0 / ingredient.min_stock
    
    if (ingredient.current_stock ?? 0 <= 0) {
      alerts.push({
        id: `out_of_stock_${ingredient.id}`,
        ingredient,
        type: 'out_of_stock',
        message: `${ingredient.name} sudah habis`,
        severity: 'high',
        actionRequired: 'Segera lakukan pembelian',
        daysUntilCritical: 0
      })
    } else if (stockRatio <= STOCK_ALERT_THRESHOLDS.CRITICAL) {
      alerts.push({
        id: `critical_stock_${ingredient.id}`,
        ingredient,
        type: 'low_stock',
message: `Stok ${ingredient.name} sangat rendah (${formatStockUnit(ingredient.current_stock ?? 0, ingredient.unit)})`,
        severity: 'high',
        actionRequired: 'Segera lakukan pembelian dalam 1-2 hari',
        daysUntilCritical: 1
      })
    } else if (stockRatio <= STOCK_ALERT_THRESHOLDS.WARNING) {
      alerts.push({
        id: `warning_stock_${ingredient.id}`,
        ingredient,
        type: 'low_stock',
message: `Stok ${ingredient.name} mulai menipis (${formatStockUnit(ingredient.current_stock ?? 0, ingredient.unit)})`,
        severity: 'medium',
        actionRequired: 'Rencanakan pembelian dalam minggu ini',
        daysUntilCritical: 3
      })
    }
    
    // Check untuk overstocked (optional)
    const overstockRatio = 5.0 // 5x dari min_stock
    if (stockRatio >= overstockRatio) {
      alerts.push({
        id: `overstock_${ingredient.id}`,
        ingredient,
        type: 'overstocked',
message: `Stok ${ingredient.name} berlebihan (${formatStockUnit(ingredient.current_stock ?? 0, ingredient.unit)})`,
        severity: 'low',
        actionRequired: 'Pertimbangkan untuk mengurangi pembelian sementara'
      })
    }
  })
  
  // Sort by severity
  return alerts.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

/**
 * Calculate usage rate dari transaction history
 */
export function calculateUsageRate(
  ingredient: Ingredient,
  transactions: StockTransaction[]
): number {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const usageTransactions = transactions.filter(t => 
    t.ingredient_id === ingredient.id &&
    t.type === 'USAGE' &&
    new Date(t.created_at) >= thirtyDaysAgo
  )
  
  const totalUsage = usageTransactions.reduce((sum, t) => sum + Math.abs(t.quantity), 0)
  return totalUsage / 30 // daily average
}

/**
 * Get alert level untuk ingredient
 */
export function getAlertLevel(ingredient: Ingredient): 'safe' | 'warning' | 'critical' {
  const stockRatio = ingredient.current_stock ?? 0 / ingredient.min_stock
  
  if (stockRatio <= STOCK_ALERT_THRESHOLDS.CRITICAL) {
    return 'critical'
  } else if (stockRatio <= STOCK_ALERT_THRESHOLDS.WARNING) {
    return 'warning'
  }
  return 'safe'
}

/**
 * Format transaction type untuk display
 */
export function getTransactionTypeInfo(type: string) {
  return STOCK_TRANSACTION_TYPES[type as keyof typeof STOCK_TRANSACTION_TYPES] || {
    value: type,
    label: type,
    color: 'bg-gray-100 text-gray-800',
    icon: 'Package',
    multiplier: 0
  }
}

/**
 * Calculate days until reorder berdasarkan current stock dan usage rate
 */
export function calculateDaysUntilReorder(
  ingredient: Ingredient,
  usageRate: number
): number {
  if (usageRate <= 0) return 999 // No usage, no need to reorder soon
  
  const stockAboveMinimum = ingredient.current_stock ?? 0 - ingredient.min_stock
  return Math.max(0, Math.floor(stockAboveMinimum / usageRate))
}

/**
 * Convert unit untuk konsistensi (contoh: g ke kg)
 */
export function normalizeUnit(quantity: number, fromUnit: string, toUnit: string): number {
  const conversions: Record<string, Record<string, number>> = {
    g: { kg: 0.001, g: 1 },
    kg: { g: 1000, kg: 1 },
    ml: { l: 0.001, ml: 1 },
    l: { ml: 1000, l: 1 },
    pcs: { pcs: 1 },
    pack: { pack: 1 },
    box: { box: 1 },
    bag: { bag: 1 },
    bottle: { bottle: 1 },
    can: { can: 1 }
  }
  
  return quantity * (conversions[fromUnit]?.[toUnit] ?? 1)
}
