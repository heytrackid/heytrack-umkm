'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  is_active: boolean | null
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
  user_id: string
  customer_type: string | null
  discount_percentage: number | null
  favorite_items: unknown
  last_order_date: string | null
  loyalty_points: number | null
  total_orders: number | null
  total_spent: number | null
}

interface CreateCustomerData {
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
  is_vip?: boolean
}

async function fetchCustomers(): Promise<Customer[]> {
  const response = await fetch('/api/customers')
  if (!response.ok) {
    throw new Error('Failed to fetch customers')
  }
  const data = await response.json()
  return data.data || []
}

async function createCustomer(data: CreateCustomerData): Promise<Customer> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create customer')
  }
  return response.json()
}

async function updateCustomer(
  id: string,
  data: Partial<CreateCustomerData>
): Promise<Customer> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update customer')
  }
  return response.json()
}

async function fetchCustomer(id: string): Promise<Customer> {
  const response = await fetch(`/api/customers/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch customer')
  }
  const data = await response.json()
  return data.data
}

async function deleteCustomer(id: string): Promise<void> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete customer')
  }
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => fetchCustomer(id),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Pelanggan berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan pelanggan')
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCustomerData> }) =>
      updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Pelanggan berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui pelanggan')
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Pelanggan berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus pelanggan')
    },
  })
}
