import { useQuery } from '@tanstack/react-query'

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
}

interface HppAnalytics {
  totalRecipes: number
  totalCalculations: number
  averageHpp: number
  hppRange: {
    min: number
    max: number
  }
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
    queryFn: async () => {
      const response = await fetch('/api/hpp/overview')
      if (!response.ok) {
        throw new Error('Failed to fetch HPP overview')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useHppAnalytics(startDate?: string, endDate?: string) {
  const params = new URLSearchParams()
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)

  return useQuery<HppAnalytics>({
    queryKey: ['hpp-analytics', params.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/hpp/analytics?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch HPP analytics')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}