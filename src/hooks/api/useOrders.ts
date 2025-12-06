import { successToast } from '@/hooks/use-toast'
import { handleError } from '@/lib/error-handling'
import { deleteApi, fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import type { Insert, Row, Update } from '@/types/database'
import type { PaginationMeta } from '@/types/pagination'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

type Order = Row<'orders'>
type OrderInsert = Insert<'orders'>
type OrderUpdate = Update<'orders'>

export function useOrders(options?: { page?: number; limit?: number; offset?: number; search?: string | undefined }) {
  const { page = 1, limit = 20, search } = options || {}

  // Convert page to offset for API
  const offset = (page - 1) * limit

  const apiOptions = {
    page,
    limit,
    offset,
    search: search || undefined
  }

  return useQuery({
    queryKey: ['orders', apiOptions],
    queryFn: (): Promise<{ data: Order[]; pagination: PaginationMeta }> => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      if (search) params.set('search', search)

      return fetchApi<{ data: Order[]; pagination: PaginationMeta }>(`/api/orders?${params}`)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch all orders as array (for backward compatibility)
 * @deprecated Use useOrders for new implementations with pagination
 */
export function useOrdersList(search?: string) {
  return useQuery({
    queryKey: ['orders-list', search],
    queryFn: async (): Promise<Order[]> => {
      const params = new URLSearchParams()
      params.set('limit', '1000')
      if (search) params.set('search', search)

      const response = await fetchApi<{ data: Order[] } | Order[]>(`/api/orders?${params}`)
      
      // Handle both array and object response formats
      if (Array.isArray(response)) {
        return response
      }
      
      // If response is an object with data property, extract it
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data
      }
      
      return []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: (): Promise<Order | null> => {
      if (!id) return Promise.resolve(null)
      return fetchApi<Order>(`/api/orders/${id}`)
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (order: OrderInsert): Promise<Order> => postApi<Order>('/api/orders', order),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      successToast('Berhasil', 'Pesanan berhasil dibuat')
    },
    onError: (error) => handleError(error, 'Create order', true, 'Gagal membuat pesanan'),
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, order }: { id: string; order: OrderUpdate }): Promise<Order> => putApi<Order>(`/api/orders/${id}`, order),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      successToast('Berhasil', 'Pesanan berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update order', true, 'Gagal memperbarui pesanan'),
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: string; newStatus: string }): Promise<Order> => putApi<Order>(`/api/orders/${orderId}`, { status: newStatus }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (error) => handleError(error, 'Update order status', false),
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string): Promise<string> => {
      await deleteApi(`/api/orders/${orderId}`)
      return orderId
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      successToast('Berhasil', 'Pesanan berhasil dihapus')
    },
    onError: (error) => handleError(error, 'Delete order', false),
  })
}

export function useExportOrders() {
  return useMutation({
    mutationFn: async (): Promise<Blob> => {
      const response = await fetch('/api/export/global', { method: 'GET', credentials: 'include' })
      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: 'Failed to export orders' }))
        throw new Error(error ?? 'Failed to export orders')
      }
      return response.blob()
    },
  })
}