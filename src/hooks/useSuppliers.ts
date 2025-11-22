import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'
import { queryConfig } from '@/lib/query/query-config'
import { buildApiUrl, fetchApi, postApi, putApi, deleteApi } from '@/lib/query/query-helpers'
import { getErrorMessage } from '@/lib/type-guards'
import type { Insert, Row, Update } from '@/types/database'

/**
 * React Query hooks for Suppliers
 * Provides caching and optimistic updates for supplier data
 */

interface UseSuppliersOptions {
  limit?: number
  offset?: number
  search?: string
}

type Supplier = Row<'suppliers'>
type SupplierInsert = Insert<'suppliers'>
type SupplierUpdate = Update<'suppliers'>

interface UseSuppliersOptions {
  limit?: number
  offset?: number
  search?: string
}

/**
 * Fetch all suppliers with caching
 * ✅ Refactored to use fetchApi helper for consistency
 */
export function useSuppliers(options?: UseSuppliersOptions) {
  return useQuery({
    queryKey: ['suppliers', options],
    queryFn: () => fetchApi<unknown[]>(buildApiUrl('/api/suppliers', options as Record<string, string | number | boolean | null | undefined>)),
    ...queryConfig.queries.moderate,
  })
}

/**
 * Fetch single supplier by ID
 */
export function useSupplier(id: string | null) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => fetchApi(`/api/suppliers/${id}`),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Create new supplier
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useCreateSupplier')

  return useMutation({
    mutationFn: (data: Omit<SupplierInsert, 'user_id'>) => postApi<Supplier>('/api/suppliers', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      logger.info({}, 'Supplier created successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to create supplier')
    },
  })
}

/**
 * Update existing supplier
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useUpdateSupplier')

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierUpdate }) => putApi<Supplier>(`/api/suppliers/${id}`, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] })
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] })

      logger.info({ supplierId: variables.id }, 'Supplier updated successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to update supplier')
    },
  })
}

/**
 * Delete supplier
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useDeleteSupplier')

  return useMutation({
    mutationFn: (id: string) => deleteApi(`/api/suppliers/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] })

      logger.info({}, 'Supplier deleted successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to delete supplier')
    },
  })
}

/**
 * Import suppliers from CSV
 */
export function useImportSuppliers() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useImportSuppliers')

  return useMutation({
    mutationFn: (suppliers: unknown[]) => postApi('/api/suppliers/import', { suppliers }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] })

      logger.info({}, 'Suppliers imported successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to import suppliers')
    },
  })
}