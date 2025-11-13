import { useQuery } from '@tanstack/react-query'

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
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error('Failed to fetch order')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch order')
      }

      return result.data
    },
    enabled: enabled && Boolean(orderId),
    staleTime: 60000, // 1 minute - single order details
    gcTime: 600000, // 10 minutes cache
  })
}

// Hook for fetching order statistics
export function useOrderStats(enabled = true) {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: async () => {
      // Fetch all orders to calculate stats (since no dedicated stats API endpoint)
      const response = await fetch('/api/orders?limit=1000', {
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error('Failed to fetch orders for stats')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch orders for stats')
      }

      const orders = result.data?.orders || []

      const stats = {
        total: orders.length,
        pending: orders.filter((order: OrderStats) => order.status === 'PENDING').length,
        confirmed: orders.filter((order: OrderStats) => order.status === 'CONFIRMED').length,
        inProgress: orders.filter((order: OrderStats) => order.status === 'IN_PROGRESS').length,
        completed: orders.filter((order: OrderStats) => order.status === 'READY').length,
        delivered: orders.filter((order: OrderStats) => order.status === 'DELIVERED').length,
        cancelled: orders.filter((order: OrderStats) => order.status === 'CANCELLED').length,
        totalRevenue: orders.reduce((sum: number, order: OrderStats) => sum + (order.total_amount ?? 0), 0),
        recentOrders: orders
          .sort((a: OrderStats, b: OrderStats) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
          .slice(0, 5)
      }

      return stats
    },
    enabled,
    staleTime: 300000, // 5 minutes - stats don't change as frequently
    gcTime: 600000, // 10 minutes cache
  })
}