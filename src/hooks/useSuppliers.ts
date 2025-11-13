import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { Insert, Update } from '@/types/database'

/**
 * React Query hooks for Suppliers
 * Provides caching and optimistic updates for supplier data
 */

type SupplierInsert = Insert<'suppliers'>
type SupplierUpdate = Update<'suppliers'>

interface UseSuppliersOptions {
  limit?: number
  offset?: number
  search?: string
}

/**
 * Fetch all suppliers with caching
 */
export function useSuppliers(options?: UseSuppliersOptions) {
  return useQuery({
    queryKey: ['suppliers', options],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.limit) params.set('limit', options.limit.toString())
      if (options?.offset) params.set('offset', options.offset.toString())
      if (options?.search) params.set('search', options.search)

      const response = await fetch(`/api/suppliers?${params}`, {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers')
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch suppliers')
      }
      return result.data ?? []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch single supplier by ID
 */
export function useSupplier(id: string | null) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      if (!id) return null

      const response = await fetch(`/api/suppliers/${id}`, {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        throw new Error('Failed to fetch supplier')
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch supplier')
      }
      return result.data ?? null
    },
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
    mutationFn: async (data: SupplierInsert) => {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to create supplier')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to create supplier')
      }
      return result.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] })

      logger.info('Supplier created successfully')
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
    mutationFn: async ({ id, data }: { id: string; data: SupplierUpdate }) => {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to update supplier')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to update supplier')
      }
      return result.data
    },
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
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to delete supplier')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to delete supplier')
      }
      return result.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] })

      logger.info('Supplier deleted successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to delete supplier')
    },
  })
}