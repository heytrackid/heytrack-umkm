import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'
import { queryConfig } from '@/lib/query/query-config'
import { buildApiUrl, deleteApi, extractDataArray, fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
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

/**
 * Fetch all suppliers with caching
 * ✅ Refactored to use fetchApi helper for consistency
 */
export function useSuppliers(options?: UseSuppliersOptions) {
  return useQuery({
    queryKey: ['suppliers', options],
    queryFn: async () => {
      const response = await fetchApi<unknown>(
        buildApiUrl('/api/suppliers', { ...options, limit: options?.limit || 1000 } as Record<string, string | number | boolean | null | undefined>)
      )
      return extractDataArray<Supplier>(response)
    },
    ...queryConfig.queries.moderate,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
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
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
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
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
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
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })

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
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })

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
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      logger.info({}, 'Suppliers imported successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to import suppliers')
    },
  })
}

/**
 * Bulk delete suppliers
 */
export function useBulkDeleteSuppliers() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useBulkDeleteSuppliers')

  return useMutation({
    mutationFn: async (ids: string[]) => {
      // Delete one by one to handle individual errors
      const results = await Promise.allSettled(
        ids.map(id => deleteApi(`/api/suppliers/${id}`))
      )
      
      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length > 0) {
        throw new Error(`Failed to delete ${failed.length} of ${ids.length} suppliers`)
      }
      
      return { deletedCount: ids.length }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      logger.info({ count: variables.length }, 'Suppliers bulk deleted successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to bulk delete suppliers')
    },
  })
}