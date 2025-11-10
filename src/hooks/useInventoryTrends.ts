import { useQuery } from '@tanstack/react-query'

interface InventoryTrendsData {
  trends: Array<{
    date: string
    purchases: number
    cost: number
  }>
  summary: {
    totalIngredients: number
    lowStockCount: number
    totalPurchases: number
  }
}

interface UseInventoryTrendsOptions {
  days?: number
  enabled?: boolean
}

export function useInventoryTrends({ days = 30, enabled = true }: UseInventoryTrendsOptions = {}) {
  return useQuery<InventoryTrendsData>({
    queryKey: ['inventory-trends', days],
    queryFn: async () => {
      const response = await fetch(`/api/charts/inventory-trends?days=${days}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory trends')
      }

      const result = await response.json()
      return result.data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
