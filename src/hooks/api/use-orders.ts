'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  recipe_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  notes: string | null
}

interface Order {
  id: string
  order_no: string
  customer_id: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_address: string | null
  order_date: string | null
  delivery_date: string | null
  delivery_time: string | null
  delivery_fee: number | null
  status: string | null
  payment_status: string | null
  payment_method: string | null
  paid_amount: number | null
  total_amount: number | null
  discount: number | null
  tax_amount: number | null
  notes: string | null
  special_instructions: string | null
  priority: string | null
  production_priority: string | null
  production_batch_id: string | null
  financial_record_id: string | null
  estimated_production_time: number | null
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
  user_id: string
  items?: OrderItem[]
}

interface CreateOrderData {
  customer_id?: string | null
  customer_name: string
  customer_phone?: string | null
  customer_address?: string | null
  order_date?: string
  delivery_date?: string | null
  status?: string
  payment_status?: string
  payment_method?: string | null
  notes?: string | null
  items: Array<{
    recipe_id?: string | null
    product_name: string
    quantity: number
    unit_price: number
    notes?: string | null
  }>
}

async function fetchOrders(): Promise<Order[]> {
  const response = await fetch('/api/orders')
  if (!response.ok) {
    throw new Error('Failed to fetch orders')
  }
  const data = await response.json()
  return data.data || []
}

async function fetchOrder(id: string): Promise<Order> {
  const response = await fetch(`/api/orders/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch order')
  }
  const data = await response.json()
  return data.data
}

async function createOrder(data: CreateOrderData): Promise<Order> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create order')
  }
  return response.json()
}

async function updateOrder(id: string, data: Partial<CreateOrderData>): Promise<Order> {
  const response = await fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update order')
  }
  return response.json()
}

async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const response = await fetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update order status')
  }
  return response.json()
}

async function deleteOrder(id: string): Promise<void> {
  const response = await fetch(`/api/orders/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete order')
  }
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Pesanan berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan pesanan')
    },
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOrderData> }) =>
      updateOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] })
      toast.success('Pesanan berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui pesanan')
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] })
      toast.success('Status pesanan berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui status pesanan')
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Pesanan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus pesanan')
    },
  })
}
