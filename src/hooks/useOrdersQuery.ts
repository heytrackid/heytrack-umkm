import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/query/query-helpers'
import type { Order } from '@/app/orders/types/orders.types'

interface UseOrdersOptions {
  page?: number
  pageSize?: number
  searchTerm?: string
  statusFilter?: string
  enabled?: boolean
}

interface OrderStats {
  status: string
  total_amount: number | null
  created_at: string | null
}

export function useOrders({
  page = 1,
  pageSize = 12,
  searchTerm = '',
  statusFilter = 'all',
  enabled = true
}: UseOrdersOptions = {}) {
  return useQuery({
    queryKey: ['orders', { page, pageSize, searchTerm, statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', pageSize.toString())
      if (searchTerm) params.set('search', searchTerm)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const response = await fetch(`/api/orders?${params}`, {
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch orders')
      }

      return {
        orders: result.data?.orders || [],
        totalCount: result.data?.pagination?.total || 0,
        page,
        pageSize,
        totalPages: result.data?.pagination?.totalPages || 0
      }
    },
    enabled,
    staleTime: 30000, // 30 seconds - orders change frequently
    gcTime: 300000, // 5 minutes cache
  })
}

// Hook for fetching a single order
export function useOrder(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchApi(`/api/orders/${orderId}`),
    enabled: enabled && Boolean(orderId),
    staleTime: 60000, // 1 minute - single order details
    gcTime: 600000, // 10 minutes cache
  })
}

// Simple hook for fetching all orders (non-paginated)
export function useAllOrders(enabled = true) {
  return useQuery<Order[]>({
    queryKey: ['orders', 'all'],
    queryFn: () => fetchApi<Order[]>('/api/orders?limit=1000'),
    enabled,
    staleTime: 30000, // 30 seconds - orders change frequently
    gcTime: 300000, // 5 minutes cache
  })
}

// Hook for fetching order statistics
export function useOrderStats(enabled = true) {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: async () => {
      const response = await fetch('/api/orders/stats', {
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error('Failed to fetch order stats')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch order stats')
      }

      return result.data
    },
    enabled,
    staleTime: 300000, // 5 minutes - stats don't change as frequently
    gcTime: 600000, // 10 minutes cache
  })
}