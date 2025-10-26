/**
 * Shared Currency Utilities
 * Centralized currency formatting and utilities
 */

import { formatCurrency, getCurrentCurrency, Currency } from '@/lib/currency'

// Enhanced currency formatting with consistent patterns
export function formatPrice(amount: number): string {
  return formatCurrency(amount, getCurrentCurrency())
}

export function formatPriceWithCurrency(amount: number, currency?: Currency): string {
  const currencyToUse = currency || getCurrentCurrency()
  return formatCurrency(amount, currencyToUse)
}

// Currency display helpers
export function formatPriceRange(min: number, max: number): string {
  const currency = getCurrentCurrency()
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`
}

export function formatPriceChange(current: number, previous: number): {
  formatted: string
  isIncrease: boolean
  percentage: number
} {
  const change = current - previous
  const percentage = previous !== 0 ? Math.abs((change / previous) * 100) : 0
  const currency = getCurrentCurrency()

  return {
    formatted: `${change >= 0 ? '+' : ''}${formatCurrency(change, currency)} (${percentage.toFixed(1)}%)`,
    isIncrease: change > 0,
    percentage
  }
}

// Business-specific currency formatting
export function formatRevenue(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

export function formatCost(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

export function formatProfit(amount: number): string {
  const sign = amount >= 0 ? '+' : ''
  return `${sign}Rp ${Math.abs(amount).toLocaleString('id-ID')}`
}

export function formatMargin(percentage: number): string {
  return `${percentage.toFixed(1)}%`
}

// Currency conversion utilities
export function convertToIDR(amount: number, fromCurrency: string, rate: number): number {
  // Simple conversion - in real app, use proper exchange rates
  return amount * rate
}

// Price validation helpers
export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && !isNaN(price)
}

export function clampPrice(price: number, min: number = 0, max: number = 100000000): number {
  return Math.max(min, Math.min(max, price))
}

// Discount and pricing calculations
export function calculateDiscountedPrice(originalPrice: number, discountPercent: number): number {
  return originalPrice * (1 - discountPercent / 100)
}

export function calculateMarkup(cost: number, markupPercent: number): number {
  return cost * (1 + markupPercent / 100)
}

export function calculateMargin(price: number, cost: number): number {
  if (price === 0) return 0
  return ((price - cost) / price) * 100
}

// Formatting for financial reports
export function formatFinancialSummary(data: {
  revenue: number
  costs: number
  profit: number
  margin: number
}): {
  revenue: string
  costs: string
  profit: string
  margin: string
} {
  return {
    revenue: formatRevenue(data.revenue),
    costs: formatCost(data.costs),
    profit: formatProfit(data.profit),
    margin: formatMargin(data.margin)
  }
}

// Currency-aware comparisons
export function comparePrices(price1: number, price2: number): {
  difference: number
  percentage: number
  formatted: string
} {
  const difference = price1 - price2
  const percentage = price2 !== 0 ? (difference / price2) * 100 : 0
  const currency = getCurrentCurrency()

  return {
    difference,
    percentage,
    formatted: `${difference >= 0 ? '+' : ''}${formatCurrency(difference, currency)} (${percentage.toFixed(1)}%)`
  }
}

// Bulk currency operations
export function formatMultiplePrices(prices: number[]): string[] {
  const currency = getCurrentCurrency()
  return prices.map(price => formatCurrency(price, currency))
}

export function sumPrices(prices: number[]): {
  total: number
  formatted: string
} {
  const total = prices.reduce((sum, price) => sum + price, 0)
  const currency = getCurrentCurrency()

  return {
    total,
    formatted: formatCurrency(total, currency)
  }
}

// Tax calculations (basic)
export function calculateTax(amount: number, taxRate: number = 0.11): {
  taxAmount: number
  totalWithTax: number
  formattedTax: string
  formattedTotal: string
} {
  const taxAmount = amount * taxRate
  const totalWithTax = amount + taxAmount
  const currency = getCurrentCurrency()

  return {
    taxAmount,
    totalWithTax,
    formattedTax: formatCurrency(taxAmount, currency),
    formattedTotal: formatCurrency(totalWithTax, currency)
  }
}
