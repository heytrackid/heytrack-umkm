import { createClientLogger } from '@/lib/client-logger'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postApi } from '@/lib/query/query-helpers'
import { toast } from 'sonner'

const logger = createClientLogger('useFinancialSync')

interface AutoSyncResponse {
  success: boolean
  synced: {
    orders: number
    expenses: number
    purchases: number
  }
  total: number
  message: string
}

/**
 * Auto-sync financial data
 */
export function useAutoSyncFinancial() {
  const queryClient = useQueryClient()

  return useMutation<AutoSyncResponse>({
    mutationFn: () => postApi<AutoSyncResponse>('/api/financial/auto-sync'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financial-records'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      
      toast.success(`${data.total} transaksi berhasil disinkronkan`)
      logger.info({ data }, 'Financial data synced')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to auto-sync financial data')
      toast.error('Gagal sinkronisasi data keuangan')
    },
  })
}

/**
 * Manual sync specific financial record
 */
export function useSyncFinancialRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      type: 'order' | 'expense' | 'purchase'
      id: string
    }) => postApi('/api/financial/sync', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-records'] })
      toast.success('Record berhasil disinkronkan')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to sync financial record')
      toast.error('Gagal sinkronisasi record')
    },
  })
}
