import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { Insert, Update } from '@/types/database'

/**
 * React Query hooks for Customers
 * Provides caching and optimistic updates for customer data
 */

type CustomerInsert = Insert<'customers'>
type CustomerUpdate = Update<'customers'>

interface UseCustomersOptions {
  limit?: number
  offset?: number
  search?: string
}

/**
 * Fetch all customers with caching
 */
export function useCustomers(options?: UseCustomersOptions) {
  return useQuery({
    queryKey: ['customers', options],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.limit) params.set('limit', options.limit.toString())
      if (options?.offset) params.set('offset', options.offset.toString())
      if (options?.search) params.set('search', options.search)

      const response = await fetch(`/api/customers?${params}`, {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch customers')
      }
      return result.data ?? []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch single customer by ID
 */
export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null

      const response = await fetch(`/api/customers/${id}`, {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        throw new Error('Failed to fetch customer')
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch customer')
      }
      return result.data ?? null
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Create new customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useCreateCustomer')

  return useMutation({
    mutationFn: async (data: CustomerInsert) => {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to create customer')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to create customer')
      }
      return result.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })

      logger.info({}, 'Customer created successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to create customer')
    },
  })
}

/**
 * Update existing customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useUpdateCustomer')

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerUpdate }) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to update customer')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to update customer')
      }
      return result.data
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['customer', variables.id] })
      void queryClient.invalidateQueries({ queryKey: ['customers'] })

      logger.info({ customerId: variables.id }, 'Customer updated successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to update customer')
    },
  })
}

/**
 * Delete customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useDeleteCustomer')

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to delete customer')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to delete customer')
      }
      return result.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })

      logger.info({}, 'Customer deleted successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to delete customer')
    },
  })
}