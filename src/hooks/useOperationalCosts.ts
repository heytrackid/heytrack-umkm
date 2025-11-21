import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/hooks/use-toast'
import { createClientLogger } from '@/lib/client-logger'
import { getErrorMessage } from '@/lib/type-guards'
import { fetchApi, buildApiUrl } from '@/lib/query/query-helpers'
import { cachePresets } from '@/lib/query/query-config'
import type { Row, Insert, Update } from '@/types/database'

const logger = createClientLogger('OperationalCosts')

/**
 * React Query hooks for Operational Costs
 * Provides caching and optimistic updates for operational cost data
 */

type OperationalCost = Row<'operational_costs'>
type OperationalCostInsert = Insert<'operational_costs'>
type OperationalCostUpdate = Update<'operational_costs'>

interface UseOperationalCostsOptions {
  limit?: number
  offset?: number
  search?: string
}

/**
 * Fetch all operational costs with caching
 * ✅ Refactored to use fetchApi helper for consistency
 */
export function useOperationalCosts(options?: UseOperationalCostsOptions) {
  return useQuery({
    queryKey: ['operational_costs', options],
    queryFn: async () => {
      const url = buildApiUrl('/operational-costs', options as Record<string, string | number | boolean | null | undefined>)
      const result = await fetchApi<{ operational_costs: OperationalCost[]; pagination: unknown }>(url)
      return result.operational_costs ?? []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch single operational cost by ID
 */
export function useOperationalCost(id: string | null) {
  return useQuery({
    queryKey: ['operational_cost', id],
    queryFn: async ({ signal }) => {
      if (!id) {return null}

      const response = await fetch(`/api/operational-costs/${id}`, {
        credentials: 'include', // Include cookies for authentication
        signal, // React Query provides signal automatically
      })
      if (!response.ok) {
        throw new Error('Gagal mengambil data biaya operasional')
      }
      return response.json()
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Create new operational cost
 */
export function useCreateOperationalCost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: OperationalCostInsert) => {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000)

      try {
        const response = await fetch('/api/operational-costs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
          signal: abortController.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Gagal menambahkan biaya operasional')
        }

        return response.json()
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['operational_costs'] })

      toast({
        title: 'Berhasil ✓',
        description: 'Biaya operasional berhasil ditambahkan',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Gagal menambahkan biaya operasional')

      toast({
        title: 'Error',
        description: message || 'Gagal menambahkan biaya operasional',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Update existing operational cost
 */
export function useUpdateOperationalCost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OperationalCostUpdate }) => {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000)

      try {
        const response = await fetch(`/api/operational-costs/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
          signal: abortController.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Gagal memperbarui biaya operasional')
        }

        return response.json()
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['operational_cost', variables['id']] })
      void queryClient.invalidateQueries({ queryKey: ['operational_costs'] })

      toast({
        title: 'Berhasil ✓',
        description: 'Biaya operasional berhasil diperbarui',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Gagal memperbarui biaya operasional')

      toast({
        title: 'Error',
        description: message || 'Gagal memperbarui biaya operasional',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Delete operational cost
 */
export function useDeleteOperationalCost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000)

      try {
        const response = await fetch(`/api/operational-costs/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          signal: abortController.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Gagal menghapus biaya operasional')
        }

        return response.json()
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['operational_costs'] })

      toast({
        title: 'Berhasil ✓',
        description: 'Biaya operasional berhasil dihapus',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Gagal menghapus biaya operasional')

      toast({
        title: 'Error',
        description: message || 'Gagal menghapus biaya operasional',
        variant: 'destructive',
      })
    },
  })
}