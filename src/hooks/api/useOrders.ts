import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi, postApi, putApi, deleteApi } from '@/lib/query/query-helpers'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handling'
import type { Row, Insert, Update } from '@/types/database'

type Order = Row<'orders'>
type OrderInsert = Insert<'orders'>
type OrderUpdate = Update<'orders'>

export function useOrders(options?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['orders', options],
    queryFn: (): Promise<Order[]> => {
      const params = new URLSearchParams()
      if (options?.limit) params.set('limit', options.limit.toString())
      if (options?.offset) params.set('offset', options.offset.toString())

      return fetchApi<Order[]>(`/api/orders?${params}`)
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
      toast.success('Pesanan berhasil dibuat')
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
      toast.success('Pesanan berhasil diperbarui')
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
      toast.success('Pesanan berhasil dihapus')
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