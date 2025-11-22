export interface ProfitReportProps {
  className?: string
}

export interface ProfitData {
  period: {
    start: string
    end: string
    aggregation: string
  }
  summary: {
    totalRevenue: number
    totalCOGS: number
    totalOperatingExpenses: number
    grossProfit: number
    netProfit: number
    profitMargin: number
    has_loss_making_products?: boolean
    loss_making_products_count?: number
    has_unrealistic_margins?: boolean
  }
  trends: {
    revenue_trend: number
    profit_trend: number
  }
  productProfitability: Array<{
    productName: string
    totalRevenue: number
    totalCOGS: number
    grossProfit: number
    grossMargin: number
    totalQuantity: number
    isLossMaking?: boolean
  }>
  top_profitable_products: Array<{
    productName: string
    totalRevenue: number
    totalCOGS: number
    grossProfit: number
    grossMargin: number
    totalQuantity: number
  }>
  least_profitable_products: Array<{
    productName: string
    totalRevenue: number
    totalCOGS: number
    grossProfit: number
    grossMargin: number
    totalQuantity: number
  }>
  operatingExpensesBreakdown: Array<{
    category: string
    total: number
    percentage: number
  }>
  profit_by_period: Array<{
    period: string
    revenue: number
    cogs: number
    grossProfit: number
    grossMargin: number
    ordersCount: number
  }>
  insights: Array<{
    type: 'warning' | 'success' | 'info' | 'danger'
    title: string
    description: string
    recommendation?: string
    impact?: 'high' | 'medium' | 'low'
  }>
}

export interface SelectedDataPoint {
  period: string
  revenue: number
  cogs: number
  grossProfit: number
  grossMargin: number
  ordersCount: number
}

export const COLORS = [
  '#10b981', // green-500
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#f59e0b'  // amber-500
] as const