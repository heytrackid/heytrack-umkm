import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'
import { queryConfig } from '@/lib/query/query-config'
import { buildApiUrl, deleteApi, fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import { getErrorMessage } from '@/lib/type-guards'
import type { Insert, Row, Update } from '@/types/database'
import type { PaginationMeta } from '@/types/pagination'

/**
 * React Query hooks for Customers
 * Provides caching and optimistic updates for customer data
 */

interface UseCustomersOptions {
  page?: number
  limit?: number
  offset?: number
  search?: string | undefined
}

type Customer = Row<'customers'>
type CustomerInsert = Insert<'customers'>
type CustomerUpdate = Update<'customers'>

/**
  * Fetch all customers with caching and pagination support
  */
export function useCustomers(options?: UseCustomersOptions) {
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
    queryKey: ['customers', apiOptions],
    queryFn: () => fetchApi<{ data: Customer[]; pagination: PaginationMeta }>(buildApiUrl('/api/customers', apiOptions as Record<string, string | number | boolean | null | undefined>)),
    ...queryConfig.queries.moderate,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

/**
  * Fetch all customers as array (for backward compatibility)
  * @deprecated Use useCustomers for new implementations with pagination
  */
export function useCustomersList(search?: string) {
  return useQuery({
    queryKey: ['customers-list', search],
    queryFn: async () => {
      const response = await fetchApi<{ data: Customer[] }>(buildApiUrl('/api/customers', { search: search || undefined, limit: 1000 } as Record<string, string | number | boolean | null | undefined>))
      // Extract data array for backward compatibility
      return Array.isArray(response) ? response : response.data
    },
    ...queryConfig.queries.moderate,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
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
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
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
      void queryClient.invalidateQueries({ queryKey: ['customers-list'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })

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
      void queryClient.invalidateQueries({ queryKey: ['customers-list'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })

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
      void queryClient.invalidateQueries({ queryKey: ['customers-list'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      logger.info({}, 'Customer deleted successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to delete customer')
    },
  })
}

/**
 * Import customers from CSV
 */
export function useImportCustomers() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useImportCustomers')

  return useMutation({
    mutationFn: (customers: unknown[]) => postApi('/api/customers/import', { customers }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
      void queryClient.invalidateQueries({ queryKey: ['customers-list'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      logger.info({}, 'Customers imported successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to import customers')
    },
  })
}