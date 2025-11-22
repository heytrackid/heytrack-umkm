import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/query/query-helpers'

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
    queryFn: () => fetchApi(`/api/charts/financial-trends?days=${days}`),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
