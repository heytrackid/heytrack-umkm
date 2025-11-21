import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'
import { getErrorMessage } from '@/lib/type-guards'
import { fetchApi, buildApiUrl } from '@/lib/query/query-helpers'
import { cachePresets } from '@/lib/query/query-config'
import type { Insert, Update, Row } from '@/types/database'

/**
 * React Query hooks for Customers
 * Provides caching and optimistic updates for customer data
 */

interface UseCustomersOptions {
  limit?: number
  offset?: number
  search?: string
}

type Customer = Row<'customers'>
type CustomerInsert = Insert<'customers'>
type CustomerUpdate = Update<'customers'>

/**
 * Fetch all customers with caching
 */
export function useCustomers(options?: UseCustomersOptions) {
  return useQuery({
    queryKey: ['customers', options],
    queryFn: () => fetchApi<Customer[]>(buildApiUrl('/customers', options as Record<string, string | number | boolean | null | undefined>)),
    ...cachePresets.moderatelyUpdated,
  })
}



/**
 * Fetch single customer by ID
 */
export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchApi(`/api/customers/${id}`),
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
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000)

      try {
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
          signal: abortController.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Failed to create customer')
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error ?? 'Failed to create customer')
        }
        return result.data
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
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
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000)

      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
          signal: abortController.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Failed to update customer')
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error ?? 'Failed to update customer')
        }
        return result.data
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
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
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000)

      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          signal: abortController.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Failed to delete customer')
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error ?? 'Failed to delete customer')
        }
        return result.data
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
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