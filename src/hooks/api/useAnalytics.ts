import { useQuery } from '@tanstack/react-query'

interface RevenueTrendData {
  date: string
  revenue: number
  orders: number
}

interface TopProductData {
  product: string
  quantity: number
  revenue: number
  orders: number
}

export function useRevenueTrend(days: number = 90) {
  return useQuery({
    queryKey: ['analytics', 'revenue-trend', days],
    queryFn: async (): Promise<RevenueTrendData[]> => {
      const response = await fetch(`/api/analytics/revenue-trend?days=${days}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch revenue trend')
      }

      const result = await response.json()
      return result.data
    },
  })
}

export function useTopProducts(days: number = 30, limit: number = 10) {
  return useQuery({
    queryKey: ['analytics', 'top-products', days, limit],
    queryFn: async (): Promise<TopProductData[]> => {
      const response = await fetch(`/api/analytics/top-products?days=${days}&limit=${limit}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch top products')
      }

      const result = await response.json()
      return result.data
    },
  })
}
