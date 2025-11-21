import { useQuery } from '@tanstack/react-query'

import { buildApiUrl, fetchApi } from '@/lib/query/query-helpers'
import { queryConfig } from '@/lib/query/query-config'

interface SalesReport {
  summary: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
  }
  salesByDate: Array<{
    date: string
    revenue: number
    orders: number
  }>
  topProducts: Array<{
    product: string
    quantity: number
    revenue: number
  }>
}

interface InventoryReport {
  summary: {
    totalItems: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
  }
  lowStockItems: Array<{
    id: string
    name: string
    currentStock: number
    reorderPoint: number
    unit: string
  }>
  outOfStockItems: Array<{
    id: string
    name: string
    unit: string
  }>
  byCategory: Array<{
    category: string
    items: number
    value: number
  }>
  topValueItems: Array<{
    id: string
    name: string
    stock: number
    value: number
    unit: string
  }>
}

interface ProfitReport {
  summary: {
    totalRevenue: number
    totalCost: number
    totalProfit: number
    profitMargin: number
    orderCount: number
  }
  profitByDate: Array<{
    date: string
    revenue: number
    cost: number
    profit: number
  }>
}

interface SalesReportApiResponse {
  data: SalesReport
}

interface InventoryReportApiResponse {
  data: InventoryReport
}

interface ProfitReportApiResponse {
  data: ProfitReport
}

export function useSalesReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'sales', startDate, endDate],
    queryFn: async (): Promise<SalesReport> => {
      const url = buildApiUrl('/api/reports/sales', {
        startDate,
        endDate,
      })
      const response = await fetchApi<SalesReportApiResponse>(url)
      return response.data
    },
    ...queryConfig.queries.analytics,
  })
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: async (): Promise<InventoryReport> => {
      const response = await fetchApi<InventoryReportApiResponse>('/api/reports/inventory')
      return response.data
    },
    ...queryConfig.queries.analytics,
  })
}

export function useProfitReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'profit', startDate, endDate],
    queryFn: async (): Promise<ProfitReport> => {
      const url = buildApiUrl('/api/reports/profit', {
        startDate,
        endDate,
      })
      const response = await fetchApi<ProfitReportApiResponse>(url)
      return response.data
    },
    ...queryConfig.queries.analytics,
  })
}
