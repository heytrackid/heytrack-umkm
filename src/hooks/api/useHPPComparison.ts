'use client'

import useSWR from 'swr'

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
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({ error: 'Failed to fetch HPP comparison data' }))
    throw new Error(error ?? 'Failed to fetch HPP comparison data')
  }
  return response.json() as Promise<HppComparisonResponse>
}

export function useHPPComparison(params: ComparisonParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.category && params.category !== 'all') {
    searchParams.set('category', params.category)
  }

  const endpoint = `/api/hpp/comparison${searchParams.toString() ? `?${searchParams}` : ''}`
  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false
  })

  return {
    data: data?.recipes ?? [],
    benchmark: data?.benchmark ?? null,
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    refresh: () => mutate()
  }
}
