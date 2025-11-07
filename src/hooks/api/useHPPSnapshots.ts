'use client'

import useSWR from 'swr'

interface HppOverview {
  totalRecipes: number
  recipesWithHpp: number
  averageHpp: number
  totalAlerts: number
  unreadAlerts: number
  recentAlerts: Array<Record<string, unknown>>
}

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({ error: 'Failed to fetch HPP overview' }))
    throw new Error(error ?? 'Failed to fetch HPP overview')
  }
  return response.json() as Promise<HppOverview>
}

export function useHPPSnapshots() {
  const { data, error, isLoading, mutate } = useSWR('/api/hpp/overview', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false
  })

  return {
    overview: data ?? null,
    loading: isLoading,
    error,
    refresh: () => mutate()
  }
}
