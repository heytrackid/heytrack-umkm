import { useQuery } from '@tanstack/react-query'

import { queryConfig } from '@/lib/query/query-config'
import { buildApiUrl, fetchApi } from '@/lib/query/query-helpers'
import { ORDER_STATUSES } from '@/lib/shared/constants'
import type { Row } from '@/types/database'

type Order = Row<'orders'>

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

// Sales Stats for dashboard
export interface SalesStats {
  totalOrders: number
  totalRevenue: number
  completedOrders: number
  pendingOrders: number
}

export function useSalesStats(options?: { dateRange?: { start?: string; end?: string } }) {
  return useQuery({
    queryKey: ['sales-stats', options],
    queryFn: async (): Promise<SalesStats> => {
      const params = new URLSearchParams()
      params.set('limit', '500')
      params.set('page', '1')
      params.set('sort_order', 'desc')
      if (options?.dateRange?.start) params.set('start_date', options.dateRange.start)
      if (options?.dateRange?.end) params.set('end_date', options.dateRange.end)

      const response = await fetchApi<{ data: Order[]; pagination?: unknown }>(`/api/orders?${params}`)
      
      // Handle paginated response structure
      let orders: Order[] = []
      if (response && typeof response === 'object' && 'data' in response) {
        orders = Array.isArray(response.data) ? response.data : []
      } else if (Array.isArray(response)) {
        orders = response
      }
      
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum: number, order: Order) => sum + (order.total_amount || 0), 0)
      const completedOrders = orders.filter((order: Order) => order.status === ORDER_STATUSES.find((s) => s.value === 'READY')?.value).length
      const pendingOrders = orders.filter((order: Order) => order.status === ORDER_STATUSES.find((s) => s.value === 'PENDING')?.value).length

      return {
        totalOrders,
        totalRevenue,
        completedOrders,
        pendingOrders
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
