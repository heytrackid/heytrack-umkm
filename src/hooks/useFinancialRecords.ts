import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { createClientLogger } from '@/lib/client-logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { Insert, Update } from '@/types/database'

/**
 * React Query hooks for Financial Records
 * Provides caching and optimistic updates for financial record data
 */

type FinancialRecordInsert = Insert<'financial_records'>
type FinancialRecordUpdate = Update<'financial_records'>

interface UseFinancialRecordsOptions {
  limit?: number
  startDate?: string
  endDate?: string
  type?: 'income' | 'expense'
}

/**
 * Fetch all financial records with caching
 */
export function useFinancialRecords(options?: UseFinancialRecordsOptions) {
  return useQuery({
    queryKey: ['financial-records', options],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.limit) params.set('limit', options.limit.toString())
      if (options?.startDate) params.set('start_date', options.startDate)
      if (options?.endDate) params.set('end_date', options.endDate)
      if (options?.type) params.set('type', options.type)

      const response = await fetch(`/api/financial/records?${params}`, {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        throw new Error('Failed to fetch financial records')
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch financial records')
      }
      return result.data ?? []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch single financial record by ID
 */
export function useFinancialRecord(id: string | null) {
  return useQuery({
    queryKey: ['financial-record', id],
    queryFn: async () => {
      if (!id) return null

      const response = await fetch(`/api/financial/records/${id}`, {
        credentials: 'include', // Include cookies for authentication
      })
      if (!response.ok) {
        throw new Error('Failed to fetch financial record')
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch financial record')
      }
      return result.data ?? null
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Create new financial record
 */
export function useCreateFinancialRecord() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useCreateFinancialRecord')

  return useMutation({
    mutationFn: async (data: FinancialRecordInsert) => {
      const response = await fetch('/api/financial/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to create financial record')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to create financial record')
      }
      return result.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['financial-records'] })

      logger.info('Financial record created successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to create financial record')
    },
  })
}

/**
 * Update existing financial record
 */
export function useUpdateFinancialRecord() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useUpdateFinancialRecord')

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FinancialRecordUpdate }) => {
      const response = await fetch(`/api/financial/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to update financial record')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to update financial record')
      }
      return result.data
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['financial-record', variables.id] })
      void queryClient.invalidateQueries({ queryKey: ['financial-records'] })

      logger.info({ recordId: variables.id }, 'Financial record updated successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to update financial record')
    },
  })
}

/**
 * Delete financial record
 */
export function useDeleteFinancialRecord() {
  const queryClient = useQueryClient()
  const logger = createClientLogger('useDeleteFinancialRecord')

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/financial/records/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Failed to delete financial record')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error ?? 'Failed to delete financial record')
      }
      return result.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['financial-records'] })

      logger.info('Financial record deleted successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to delete financial record')
    },
  })
}