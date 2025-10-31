/**
 * HPP Calculation Utilities
 */

/**
 * Calculate margin percentage
 */
export function calculateMarginPercentage(sellingPrice: number, hpp: number): number {
  if (sellingPrice === 0) {return 0}
  return ((sellingPrice - hpp) / sellingPrice) * 100
}

/**
 * Calculate margin amount
 */
export function calculateMarginAmount(sellingPrice: number, hpp: number): number {
  return sellingPrice - hpp
}

/**
 * Calculate suggested selling price based on desired margin
 */
export function calculateSuggestedPrice(hpp: number, marginPercentage: number): number {
  return hpp * (1 + marginPercentage / 100)
}

/**
 * Calculate operational cost (default 15% of material cost)
 */
export function calculateOperationalCost(materialCost: number, percentage = 0.15): number {
  return Math.max(materialCost * percentage, 2500) // Minimum 2500 IDR
}

/**
 * Round price to nearest hundred
 */
export function roundToNearestHundred(price: number): number {
  return Math.round(price / 100) * 100
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {return 0}
  return ((current - previous) / previous) * 100
}

/**
 * Format HPP breakdown for display
 */
export function formatHppBreakdown(
  materialCost: number,
  laborCost: number,
  overheadCost: number
): {
  material: { amount: number; percentage: number }
  labor: { amount: number; percentage: number }
  overhead: { amount: number; percentage: number }
  total: number
} {
  const total = materialCost + laborCost + overheadCost

  return {
    material: {
      amount: materialCost,
      percentage: total > 0 ? (materialCost / total) * 100 : 0
    },
    labor: {
      amount: laborCost,
      percentage: total > 0 ? (laborCost / total) * 100 : 0
    },
    overhead: {
      amount: overheadCost,
      percentage: total > 0 ? (overheadCost / total) * 100 : 0
    },
    total
  }
}
