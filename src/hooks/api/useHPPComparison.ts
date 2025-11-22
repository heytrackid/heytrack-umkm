'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/query/query-helpers'

interface ComparisonParams {
  category?: string
}

interface HppComparisonResponse {
  recipes: Array<{
    id: string
    name: string
    category: string
    hppValue: number
    sellingPrice: number
    margin: number
    marginPercentage: number
    timesMade: number
    lastMade?: string | null
    profitability: string
    efficiency: string
  }>
  benchmark: Record<string, unknown>
  total: number
}

const fetcher = async (url: string) => {
  return fetchApi<HppComparisonResponse>(url)
}

export function useHPPComparison(params: ComparisonParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.category && params.category !== 'all') {
    searchParams.set('category', params.category)
  }

  const endpoint = `/api/hpp/comparison${searchParams.toString() ? `?${searchParams}` : ''}`
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['hpp-comparison', params],
    queryFn: () => fetcher(endpoint),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: false
  })

  return {
    data: data?.recipes ?? [],
    benchmark: data?.benchmark ?? null,
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    refresh: () => { void refetch() }
  }
}
