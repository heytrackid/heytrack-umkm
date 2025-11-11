import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

interface DashboardStats {
  revenue: {
    today: number
    total: number
    growth: string
    trend: 'up' | 'down'
  }
  orders: {
    active: number
    total: number
    today: number
  }
  customers: {
    total: number
    vip: number
    regular: number
  }
  inventory: {
    total: number
    lowStock: number
  }
  expenses: {
    today: number
    netProfit: number
  }
}

export function useDashboardStats(startDate?: string, endDate?: string) {
  const params = useMemo(() => {
    const searchParams = new URLSearchParams()
    if (startDate) searchParams.set('start_date', startDate)
    if (endDate) searchParams.set('end_date', endDate)
    return searchParams.toString()
  }, [startDate, endDate])

  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', params],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}