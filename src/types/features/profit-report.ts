export interface ProfitPeriodMetadata {
  start: string
  end: string
  type?: string
}

export interface ProfitSummary {
  period: ProfitPeriodMetadata
  total_revenue: number
  total_cogs: number
  gross_profit: number
  gross_profit_margin: number
  total_operating_expenses: number
  net_profit: number
  net_profit_margin: number
  orders_count: number
  // Business validation flags
  has_loss_making_products?: boolean
  loss_making_products_count?: number
  has_unrealistic_margins?: boolean
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

export interface ProfitByPeriodEntry {
  period: string
  revenue: number
  cogs: number
  gross_profit: number
  gross_margin: number
  orders_count: number
}

export interface ProductProfitabilityEntry {
  product_name: string
  total_revenue: number
  total_cogs: number
  gross_profit: number
  gross_margin: number
  total_quantity: number
  is_loss_making?: boolean
  is_low_margin?: boolean
}

export interface OperatingExpenseBreakdownEntry {
  category: string
  total: number
  percentage: number
}

export interface ProfitData {
  summary: ProfitSummary
  profit_by_period: ProfitByPeriodEntry[]
  product_profitability: ProductProfitabilityEntry[]
  top_profitable_products: ProductProfitabilityEntry[]
  least_profitable_products: ProductProfitabilityEntry[]
  operating_expenses_breakdown: OperatingExpenseBreakdownEntry[]
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

export type ProfitPeriodType = 'custom' | 'month' | 'quarter' | 'week' | 'year'
