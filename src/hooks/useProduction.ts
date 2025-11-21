import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from '@/lib/query/query-helpers'

import { useToast } from '@/hooks/use-toast'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')
import { getErrorMessage } from '@/lib/type-guards'

/**
 * React Query hooks for Production Batches
 * Provides caching and real-time updates for production data
 */


/**
 * Fetch all production batches
 */
export function useProductionBatches() {
  return useQuery<unknown[]>({
    queryKey: ['production-batches'],
    queryFn: () => fetchApi<unknown[]>('/api/production-batches'),
    staleTime: 2 * 60 * 1000, // 2 minutes (production data changes frequently)
    refetchOnWindowFocus: true, // Refetch on focus for production
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  })
}

/**
 * Create new production batch
 */
export function useCreateProductionBatch() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async <T = unknown>(data: T) => {
      const response = await fetch('/api/production-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to create production batch')
      }
      
      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['production-batches'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Batch produksi berhasil dibuat',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to create production batch')
      
      toast({
        title: 'Error',
        description: message || 'Gagal membuat batch produksi',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Update production batch status
 */
export function useUpdateProductionBatch() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/production-batches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include', // Include cookies for authentication
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to update production batch')
      }
      
      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['production-batches'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Status produksi berhasil diperbarui',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to update production batch')
      
      toast({
        title: 'Error',
        description: message || 'Gagal memperbarui status produksi',
        variant: 'destructive',
      })
    },
  })
}
