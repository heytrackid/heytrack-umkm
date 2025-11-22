import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'
import { queryConfig } from '@/lib/query/query-config'
import { buildApiUrl, fetchApi, postApi, putApi, deleteApi } from '@/lib/query/query-helpers'
import { getErrorMessage } from '@/lib/type-guards'
import type { Insert, Row, Update } from '@/types/database'

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
    queryFn: () => fetchApi<Customer[]>(buildApiUrl('/api/customers', options as Record<string, string | number | boolean | null | undefined>)),
    ...queryConfig.queries.moderate,
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
    mutationFn: (data: Omit<CustomerInsert, 'user_id'>) => postApi<Customer>('/api/customers', data),
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
    mutationFn: ({ id, data }: { id: string; data: CustomerUpdate }) => putApi<Customer>(`/api/customers/${id}`, data),
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
    mutationFn: (id: string) => deleteApi(`/api/customers/${id}`),
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