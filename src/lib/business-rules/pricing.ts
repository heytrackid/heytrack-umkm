/**
 * Pricing Business Rules
 * Based on AGENTS.md specifications
 */

/**
 * Calculate HPP (Harga Pokok Penjualan / Cost of Goods Sold)
 * Formula: (Ingredient Cost + Overhead) / (1 - Profit Margin)
 */
export function calculateHPP(
  ingredientCost: number,
  overheadCost: number,
  profitMarginPercent: number
): {
  totalCost: number
  sellingPrice: number
  profit: number
  profitMargin: number
} {
  const totalCost = ingredientCost + overheadCost
  const profitMarginDecimal = profitMarginPercent / 100

  // Prevent division by zero or negative margins
  if (profitMarginDecimal >= 1 || profitMarginDecimal < 0) {
    throw new Error('Profit margin must be between 0% and 99%')
  }

  const sellingPrice = totalCost / (1 - profitMarginDecimal)
  const profit = sellingPrice - totalCost

  return {
    totalCost,
    sellingPrice,
    profit,
    profitMargin: profitMarginPercent,
  }
}

/**
 * Validate minimum markup
 * Typically 30-50% for food businesses
 */
export function validateMinimumMarkup(
  profitMarginPercent: number,
  minimumMarkup: number = 30
): {
  valid: boolean
  message: string
} {
  if (profitMarginPercent < minimumMarkup) {
    return {
      valid: false,
      message: `Profit margin (${profitMarginPercent}%) is below minimum recommended markup (${minimumMarkup}%)`,
    }
  }

  return {
    valid: true,
    message: 'Profit margin is acceptable',
  }
}

/**
 * Calculate competitive pricing analysis
 */
export function analyzeCompetitivePricing(
  yourPrice: number,
  competitorPrices: number[]
): {
  position: 'lowest' | 'competitive' | 'premium' | 'highest'
  percentageDifference: number
  recommendation: string
} {
  if (competitorPrices.length === 0) {
    return {
      position: 'competitive',
      percentageDifference: 0,
      recommendation: 'No competitor data available',
    }
  }

  const avgCompetitorPrice =
    competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length

  const percentageDifference = ((yourPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100

  let position: 'lowest' | 'competitive' | 'premium' | 'highest'
  let recommendation: string

  if (yourPrice < Math.min(...competitorPrices)) {
    position = 'lowest'
    recommendation = 'Consider increasing price to improve margins'
  } else if (yourPrice > Math.max(...competitorPrices)) {
    position = 'highest'
    recommendation = 'Price is above market - ensure value justifies premium'
  } else if (Math.abs(percentageDifference) <= 10) {
    position = 'competitive'
    recommendation = 'Price is competitive with market'
  } else {
    position = 'premium'
    recommendation = 'Premium pricing - highlight unique value proposition'
  }

  return {
    position,
    percentageDifference,
    recommendation,
  }
}

/**
 * Calculate break-even point
 */
export function calculateBreakEven(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number
): {
  breakEvenUnits: number
  breakEvenRevenue: number
} {
  const contributionMargin = sellingPricePerUnit - variableCostPerUnit

  if (contributionMargin <= 0) {
    throw new Error('Selling price must be greater than variable cost')
  }

  const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin)
  const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit

  return {
    breakEvenUnits,
    breakEvenRevenue,
  }
}
