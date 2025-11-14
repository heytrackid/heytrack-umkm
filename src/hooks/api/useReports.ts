import { useQuery } from '@tanstack/react-query'

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

export function useSalesReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'sales', startDate, endDate],
    queryFn: async (): Promise<SalesReport> => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/reports/sales?${params.toString()}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch sales report')
      }

      const result = await response.json()
      return result.data
    },
  })
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: async (): Promise<InventoryReport> => {
      const response = await fetch('/api/reports/inventory')

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch inventory report')
      }

      const result = await response.json()
      return result.data
    },
  })
}

export function useProfitReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'profit', startDate, endDate],
    queryFn: async (): Promise<ProfitReport> => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/reports/profit?${params.toString()}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch profit report')
      }

      const result = await response.json()
      return result.data
    },
  })
}
