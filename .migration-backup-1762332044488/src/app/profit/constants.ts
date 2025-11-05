
// Profit Report Types and Constants

export interface ProfitSummary {
  total_revenue: number
  total_cogs: number
  gross_profit: number
  gross_profit_margin: number
  total_operating_expenses: number
  net_profit: number
  net_profit_margin: number
}

export interface ProductProfit {
  product_name: string
  quantity_sold: number
  revenue: number
  cogs: number
  profit: number
  profit_margin: number
}

export interface IngredientCost {
  ingredient_name: string
  quantity_used: number
  wac_cost: number
  total_cost: number
}

export interface OperatingExpense {
  category: string
  total_amount: number
}

export interface ProfitTrends {
  revenue_trend: number
  profit_trend: number
}

export interface ProfitData {
  summary: ProfitSummary
  products: ProductProfit[]
  ingredients: IngredientCost[]
  operating_expenses: OperatingExpense[]
  trends: ProfitTrends
}

export interface ChartDataPoint {
  name: string
  revenue: number
  cogs: number
  profit: number
}

export type ProfitPeriodType = 'week' | 'month' | 'quarter' | 'year' | 'custom'

// Period options for profit reports
export const profitPeriodOptions = [
  { value: 'week', label: '7 Hari' },
  { value: 'month', label: '30 Hari' },
  { value: 'quarter', label: 'Kuartal' },
  { value: 'year', label: '1 Tahun' },
  { value: 'custom', label: 'Kustom' }
] as const

// Filter period options for main filter
export const filterProfitPeriodOptions = [
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'quarter', label: 'Kuartal Ini' },
  { value: 'year', label: 'Tahun Ini' },
  { value: 'custom', label: 'Kustom' }
] as const

// Export types
export type ProfitPeriod = typeof profitPeriodOptions[number]['value']
