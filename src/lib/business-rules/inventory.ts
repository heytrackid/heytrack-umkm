/**
 * Inventory Business Rules
 * Based on AGENTS.md specifications
 */

/**
 * Calculate reorder point based on average daily usage and lead time
 * Formula: (Average Daily Usage × Lead Time) + Safety Stock
 */
export function calculateReorderPoint(
  averageDailyUsage: number,
  leadTimeDays: number,
  safetyStockDays: number = 3
): number {
  const baseReorderPoint = averageDailyUsage * leadTimeDays
  const safetyStock = averageDailyUsage * safetyStockDays
  return Math.ceil(baseReorderPoint + safetyStock)
}

/**
 * Check if item is low stock
 * Rule: Current Stock ≤ Reorder Point
 */
export function isLowStock(currentStock: number, reorderPoint: number): boolean {
  return currentStock <= reorderPoint
}

/**
 * Check if item is out of stock
 */
export function isOutOfStock(currentStock: number): boolean {
  return currentStock <= 0
}

/**
  * Calculate stock value using WAC method
 */
export function calculateStockValue(
  currentStock: number,
  pricePerUnit: number
): number {
  return currentStock * pricePerUnit
}

/**
 * Validate stock availability for order
 */
export function validateStockAvailability(
  requiredQuantity: number,
  currentStock: number,
  reservedStock: number = 0
): {
  available: boolean
  availableQuantity: number
  shortfall: number
} {
  const availableStock = currentStock - reservedStock
  const available = availableStock >= requiredQuantity
  const shortfall = available ? 0 : requiredQuantity - availableStock

  return {
    available,
    availableQuantity: Math.max(0, availableStock),
    shortfall,
  }
}

/**
 * Calculate average daily usage from historical data
 */
export function calculateAverageDailyUsage(
  usageHistory: Array<{ date: string; quantity: number }>,
  days: number = 30
): number {
  if (usageHistory.length === 0) return 0

  const totalUsage = usageHistory.reduce((sum, record) => sum + record.quantity, 0)
  const actualDays = Math.min(days, usageHistory.length)

  return totalUsage / actualDays
}

/**
 * Suggest optimal order quantity
 * Economic Order Quantity (EOQ) formula
 */
export function calculateOptimalOrderQuantity(
  annualDemand: number,
  orderingCost: number,
  holdingCostPerUnit: number
): number {
  if (holdingCostPerUnit === 0) return 0

  const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit)
  return Math.ceil(eoq)
}
