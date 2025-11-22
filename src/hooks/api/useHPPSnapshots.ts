'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/query/query-helpers'

interface HppOverview {
  totalRecipes: number
  recipesWithHpp: number
  averageHpp: number
  totalAlerts: number
  unreadAlerts: number
  recentAlerts: Array<Record<string, unknown>>
}

const fetcher = async (url: string) => {
  return fetchApi<HppOverview>(url)
}

export function useHPPSnapshots() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['hpp-overview'],
    queryFn: () => fetcher('/api/hpp/overview'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: false
  })

  return {
    overview: data ?? null,
    loading: isLoading,
    error,
    refresh: () => { void refetch() }
  }
}
