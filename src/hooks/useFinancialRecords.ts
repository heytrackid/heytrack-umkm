import { createClientLogger } from '@/lib/client-logger'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi, postApi, patchApi, deleteApi } from '@/lib/query/query-helpers'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handling'
import type { FinancialRecord } from '@/types/database'

const logger = createClientLogger('useFinancialRecords')

/**
 * Get all financial records with optional filtering
 */
export function useFinancialRecords(params?: {
  startDate?: string
  endDate?: string
  type?: 'INCOME' | 'EXPENSE'
  search?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.append('start_date', params.startDate)
  if (params?.endDate) searchParams.append('end_date', params.endDate)
  if (params?.type) searchParams.append('type', params.type)
  if (params?.search) searchParams.append('search', params.search)

  return useQuery<FinancialRecord[]>({
    queryKey: ['financial-records', params],
    queryFn: () => {
      const url = `/api/financial/records${searchParams.toString() ? `?${searchParams}` : ''}`
      return fetchApi<FinancialRecord[]>(url)
    },
    staleTime: 30000,
  })
}

/**
 * Create financial record
 */
export function useCreateFinancialRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { type: 'INCOME' | 'EXPENSE'; description: string; category: string; amount: number; date: string; }) => postApi('/api/financial-records', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-records'] })
      toast.success('Financial record created successfully')
      logger.info('Financial record created')
    },
    onError: (error) => handleError(error, 'Create financial record', true, 'Gagal membuat catatan keuangan'),
  })
}

/**
 * Update financial record
 */
export function useUpdateFinancialRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FinancialRecord> }) => patchApi(`/api/financial-records/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-records'] })
      toast.success('Financial record updated successfully')
      logger.info('Financial record updated')
    },
    onError: (error) => handleError(error, 'Update financial record', true, 'Gagal memperbarui catatan keuangan'),
  })
}

/**
 * Delete financial record
 */
export function useDeleteFinancialRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteApi(`/api/financial-records/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-records'] })
      toast.success('Financial record deleted successfully')
      logger.info('Financial record deleted')
    },
    onError: (error) => handleError(error, 'Delete financial record', true, 'Gagal menghapus catatan keuangan'),
  })
}
