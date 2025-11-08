import type { ProfitData, ProfitPeriodType, ChartDataPoint } from './constants'


/**
 * Calculate date range based on period type
 */
export function calculateProfitDateRange(period: ProfitPeriodType, startDate?: string, endDate?: string) {
  const today = new Date()
  let calculatedStartDate = startDate
  const calculatedEndDate = endDate ?? today.toISOString().split('T')[0]

  if (!startDate) {
    if (period === 'week') {
      calculatedStartDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0]
    } else if (period === 'month') {
      calculatedStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    } else if (period === 'quarter') {
      const quarter = Math.floor(today.getMonth() / 3)
      calculatedStartDate = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0]
    } else if (period === 'year') {
      calculatedStartDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
    }
  }

  return { startDate: calculatedStartDate, endDate: calculatedEndDate }
}

/**
 * Prepare chart data for product profitability
 */
export function prepareProductChartData(products: ProfitData['products']): ChartDataPoint[] {
  if (!products || products.length === 0) {return []}

  return products
    .slice(0, 10) // Top 10 products
    .map(product => ({
      name: product.product_name.length > 15
        ? `${product.product_name.substring(0, 15)  }...`
        : product.product_name,
      revenue: product.revenue,
      cogs: product.cogs,
      profit: product.profit
    }))
}

/**
 * Format currency for display
 */
export function formatProfitCurrency(amount: number): string {
  // This would typically come from settings context, but for utility purposes
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

/**
 * Calculate profit metrics from summary data
 */
export function calculateProfitMetrics(summary: ProfitData['summary']) {
  return {
    totalRevenue: summary.total_revenue,
    totalCOGS: summary.total_cogs,
    grossProfit: summary.gross_profit,
    grossMargin: summary.gross_profit_margin,
    operatingExpenses: summary.total_operating_expenses,
    netProfit: summary.net_profit,
    netMargin: summary.net_profit_margin,
    profitStatus: summary.net_profit >= 0 ? 'profit' : 'loss'
  }
}

/**
 * Validate profit data
 */
export function validateProfitData(data: ProfitData): boolean {
  return Boolean(data?.summary && data?.products && data?.ingredients && data?.operating_expenses)
}

/**
 * Export profit report to various formats
 */
export function exportProfitReport(data: ProfitData, format: 'csv' | 'pdf' | 'xlsx', filename: string) {
  if (!data) {return}

  // For CSV export
  if (format === 'csv') {
    exportProfitToCSV(data, filename)
  }
  // For PDF and XLSX, would need additional libraries
  // For now, just CSV is implemented
}

function exportProfitToCSV(data: ProfitData, filename: string) {
  const headers = ['Product', 'Quantity Sold', 'Revenue', 'COGS', 'Profit', 'Margin %']

  const rows = data.products.map(product => [
    `"${product.product_name}"`,
    product.quantity_sold.toString(),
    product.revenue.toString(),
    product.cogs.toString(),
    product.profit.toString(),
    product.profit_margin.toFixed(2)
  ])

  const summaryRow = [
    '"SUMMARY"',
    '""',
    data.summary.total_revenue.toString(),
    data.summary.total_cogs.toString(),
    data.summary.net_profit.toString(),
    data.summary.net_profit_margin.toFixed(2)
  ]

  const csvContent = [headers, ...rows, summaryRow]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document['body'].appendChild(link)
  link.click()
  document['body'].removeChild(link)
}

/**
 * Get profit trend indicators
 */
export function getProfitTrends(trends: ProfitData['trends']) {
  return {
    revenueTrend: trends?.revenue_trend || 0,
    profitTrend: trends?.profit_trend || 0,
    revenueDirection: (trends?.revenue_trend || 0) >= 0 ? 'up' : 'down',
    profitDirection: (trends?.profit_trend || 0) >= 0 ? 'up' : 'down'
  }
}
