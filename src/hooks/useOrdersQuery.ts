import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/providers/SupabaseProvider'
import type { Row } from '@/types/database'

type Order = Row<'orders'> & {
  items?: Array<{
    id: string
    product_name: string | null
    quantity: number
    unit_price: number
    total_price: number
  }>
}

interface UseOrdersOptions {
  page?: number
  pageSize?: number
  searchTerm?: string
  statusFilter?: string
  enabled?: boolean
}

export function useOrders({
  page = 1,
  pageSize = 12,
  searchTerm = '',
  statusFilter = 'all',
  enabled = true
}: UseOrdersOptions = {}) {
  const { supabase } = useSupabase()

  return useQuery({
    queryKey: ['orders', { page, pageSize, searchTerm, statusFilter }],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `, { count: 'exact' })

      // Apply search filter
      if (searchTerm) {
        query = query.or(`order_no.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`)
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED')
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return {
        orders: data as Order[],
        totalCount: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
        currentPage: page,
      }
    },
    enabled,
    staleTime: 30000, // 30 seconds - orders change frequently
    gcTime: 300000, // 5 minutes cache
  })
}

// Hook for fetching a single order
export function useOrder(orderId: string, enabled = true) {
  const { supabase } = useSupabase()

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            id,
            product_name,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        throw error
      }

      return data as Order
    },
    enabled: enabled && !!orderId,
    staleTime: 60000, // 1 minute - single order details
    gcTime: 600000, // 10 minutes cache
  })
}

// Hook for fetching order statistics
export function useOrderStats(enabled = true) {
  const { supabase } = useSupabase()

  return useQuery({
    queryKey: ['order-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount, created_at')

      if (error) {
        throw error
      }

      const stats = {
        total: data.length,
        pending: data.filter(order => order.status === 'PENDING').length,
        confirmed: data.filter(order => order.status === 'CONFIRMED').length,
        inProgress: data.filter(order => order.status === 'IN_PROGRESS').length,
        completed: data.filter(order => order.status === 'READY').length,
        delivered: data.filter(order => order.status === 'DELIVERED').length,
        cancelled: data.filter(order => order.status === 'CANCELLED').length,
        totalRevenue: data.reduce((sum, order) => sum + (order.total_amount ?? 0), 0),
        recentOrders: data
          .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
          .slice(0, 5)
      }

      return stats
    },
    enabled,
    staleTime: 60000, // 1 minute - stats update frequently
    gcTime: 300000, // 5 minutes cache
  })
}