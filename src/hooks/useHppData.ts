import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/query/query-helpers'

interface HppOverview {
  totalRecipes: number
  recipesWithHpp: number
  averageHpp: number
  totalAlerts: number
  unreadAlerts: number
  recentAlerts: Array<{
    id: string
    recipe_id: string
    recipe_name: string
    alert_type: string
    title: string
    message: string
    severity: string
    is_read: boolean | null
    new_value: number | null
    created_at: string | null
  }>
  marginAnalysis: {
    high: number
    medium: number
    low: number
  }
  costTrends: Array<{
    date: string
    averageHpp: number
    totalRecipes: number
  }>
  topCostDrivers: Array<{
    ingredient: string
    totalCost: number
    percentage: number
  }>
}

export function useHppOverview() {
  return useQuery<HppOverview>({
    queryKey: ['hpp-overview'],
    queryFn: () => fetchApi<HppOverview>('/api/hpp/overview'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// HPP analytics functionality has been removed
export function useHppAnalytics() {
  // Return a mock query that always succeeds with empty data to prevent errors
  return {
    data: null,
    isLoading: false,
    isError: false,
    isSuccess: true,
    dataUpdatedAt: Date.now(),
    error: null,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isRefetching: false,
    refetch: () => Promise.resolve({ data: null, error: null }),
    remove: () => {},
    status: 'success' as const,
  }
}