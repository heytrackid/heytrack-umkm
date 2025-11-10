import { useQuery } from '@tanstack/react-query'

interface FinancialTrendsData {
  date: string
  revenue: number
  expenses: number
  hpp: number
  profit: number
  [key: string]: string | number
}

interface UseFinancialTrendsOptions {
  days?: number
  enabled?: boolean
}

export function useFinancialTrends({ days = 90, enabled = true }: UseFinancialTrendsOptions = {}) {
  return useQuery<FinancialTrendsData[]>({
    queryKey: ['financial-trends', days],
    queryFn: async () => {
      const response = await fetch(`/api/charts/financial-trends?days=${days}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch financial trends')
      }

      const result = await response.json()
      return result.data || []
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
