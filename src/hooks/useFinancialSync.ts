import { infoToast, successToast } from '@/hooks/use-toast'
import { createClientLogger } from '@/lib/client-logger'
import { handleError } from '@/lib/error-handling'
import { fetchApi, postApi } from '@/lib/query/query-helpers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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

interface SyncStatusResponse {
  unsynced: {
    orders: number
    purchases: number
  }
  total: number
  needsSync: boolean
}

/**
 * Get sync status - check if there are unsynced transactions
 */
export function useSyncStatus() {
  return useQuery<SyncStatusResponse>({
    queryKey: ['financial-sync-status'],
    queryFn: () => fetchApi<SyncStatusResponse>('/api/financial/auto-sync'),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

/**
 * Auto-sync financial data
 */
export function useAutoSyncFinancial() {
  const queryClient = useQueryClient()

  return useMutation<AutoSyncResponse>({
    mutationFn: () => postApi<AutoSyncResponse>('/api/financial/auto-sync'),
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['financial-records'] })
      queryClient.invalidateQueries({ queryKey: ['financial-sync-status'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['ingredient-purchases'] })
      
      if (data.total > 0) {
        successToast('Berhasil', `${data.total} transaksi berhasil disinkronkan`)
      } else {
        infoToast('Info', 'Semua transaksi sudah tersinkronisasi')
      }
      logger.info({ data }, 'Financial data synced')
    },
    onError: (error) => handleError(error, 'Auto-sync financial data', true, 'Gagal sinkronisasi data keuangan'),
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
      queryClient.invalidateQueries({ queryKey: ['financial-sync-status'] })
      successToast('Berhasil', 'Record berhasil disinkronkan')
    },
    onError: (error) => handleError(error, 'Sync financial record', true, 'Gagal sinkronisasi record'),
  })
}
