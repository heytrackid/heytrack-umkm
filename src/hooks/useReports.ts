import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/query/query-helpers'

interface SalesReportData {
  total_sales: number
  total_orders: number
  average_order_value: number
  top_products: Array<{
    recipe_id: string
    recipe_name: string
    quantity_sold: number
    revenue: number
  }>
  sales_by_date: Array<{
    date: string
    sales: number
    orders: number
  }>
}

interface ProfitReportData {
  total_revenue: number
  total_cost: number
  gross_profit: number
  net_profit: number
  profit_margin: number
  expenses_breakdown: Record<string, number>
  profit_by_product: Array<{
    recipe_id: string
    recipe_name: string
    revenue: number
    cost: number
    profit: number
    margin: number
  }>
}

interface InventoryReportData {
  total_value: number
  total_items: number
  low_stock_items: number
  out_of_stock_items: number
  items: Array<{
    ingredient_id: string
    ingredient_name: string
    quantity: number
    unit: string
    value: number
    status: 'in_stock' | 'low_stock' | 'out_of_stock'
  }>
  movement: Array<{
    date: string
    purchases: number
    usage: number
  }>
}

interface FinancialReportData {
  revenue: number
  expenses: number
  net_income: number
  cash_flow: number
  accounts_receivable: number
  accounts_payable: number
  monthly_trend: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
}

/**
 * Get sales report
 */
export function useSalesReport(params?: { startDate?: string; endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.append('start_date', params.startDate)
  if (params?.endDate) searchParams.append('end_date', params.endDate)

  return useQuery<SalesReportData>({
    queryKey: ['reports', 'sales', params],
    queryFn: () => fetchApi<SalesReportData>(`/api/reports/sales?${searchParams}`),
  })
}

/**
 * Get profit report
 */
export function useProfitReport(params?: { startDate?: string; endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.append('start_date', params.startDate)
  if (params?.endDate) searchParams.append('end_date', params.endDate)

  return useQuery<ProfitReportData>({
    queryKey: ['reports', 'profit', params],
    queryFn: () => fetchApi<ProfitReportData>(`/api/reports/profit?${searchParams}`),
  })
}

/**
 * Get inventory report
 */
export function useInventoryReport(params?: { category?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.append('category', params.category)

  return useQuery<InventoryReportData>({
    queryKey: ['reports', 'inventory', params],
    queryFn: () => fetchApi<InventoryReportData>(`/api/reports/inventory?${searchParams}`),
  })
}

/**
 * Get financial report
 */
export function useFinancialReport(params?: { startDate?: string; endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.append('start_date', params.startDate)
  if (params?.endDate) searchParams.append('end_date', params.endDate)

  return useQuery<FinancialReportData>({
    queryKey: ['reports', 'financial', params],
    queryFn: () => fetchApi<FinancialReportData>(`/api/financial/records?${searchParams}`),
  })
}

/**
 * Export report to PDF/Excel
 */
export function useExportReport() {
  return async (type: 'sales' | 'profit' | 'inventory', format: 'pdf' | 'excel', params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params)
    const response = await fetch(`/api/export/${type}?format=${format}&${searchParams}`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to export report')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
}
