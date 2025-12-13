
import { successToast } from '@/hooks/use-toast'
import { handleError } from '@/lib/error-handling'
import { deleteApi, extractDataArray, fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import type { Insert, Row, Update } from '@/types/database'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'



type OperationalCost = Row<'operational_costs'>
type OperationalCostInsert = Insert<'operational_costs'>
type OperationalCostUpdate = Update<'operational_costs'>

interface OperationalCostStats {
  total_monthly: number
  total_daily: number
  by_category: Record<string, number>
  trend: 'increasing' | 'decreasing' | 'stable'
}

/**
 * Get all operational costs
 */
export function useOperationalCosts(params?: { category?: string; active?: boolean }) {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.append('category', params.category)
  if (params?.active !== undefined) searchParams.append('active', String(params.active))

  return useQuery<OperationalCost[]>({
    queryKey: ['operational-costs', params],
    queryFn: async () => {
      const response = await fetchApi<unknown>(`/api/operational-costs?${searchParams}`)
      return extractDataArray<OperationalCost>(response)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

/**
 * Get single operational cost by ID
 */
export function useOperationalCost(id: string | null) {
  return useQuery<OperationalCost>({
    queryKey: ['operational-cost', id],
    queryFn: () => fetchApi<OperationalCost>(`/api/operational-costs/${id}`),
    enabled: !!id,
  })
}

/**
 * Create new operational cost
 */
export function useCreateOperationalCost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<OperationalCostInsert, 'user_id'>) => postApi('/api/operational-costs', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['operational-costs'] })
      void queryClient.invalidateQueries({ queryKey: ['operational-cost-stats'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'hpp-summary'] })
      successToast('Berhasil', 'Biaya operasional berhasil ditambahkan')
    },
    onError: (error) => handleError(error, 'Create operational cost', true, 'Gagal menambahkan biaya operasional'),
  })
}

/**
 * Update operational cost
 */
export function useUpdateOperationalCost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OperationalCostUpdate> }) => putApi(`/api/operational-costs/${id}`, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['operational-costs'] })
      void queryClient.invalidateQueries({ queryKey: ['operational-cost', id] })
      void queryClient.invalidateQueries({ queryKey: ['operational-cost-stats'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'hpp-summary'] })
      successToast('Berhasil', 'Biaya operasional berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update operational cost', true, 'Gagal memperbarui biaya operasional'),
  })
}

/**
 * Delete operational cost
 */
export function useDeleteOperationalCost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteApi(`/api/operational-costs/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['operational-costs'] })
      void queryClient.invalidateQueries({ queryKey: ['operational-cost-stats'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'hpp-summary'] })
      successToast('Berhasil', 'Biaya operasional berhasil dihapus')
    },
    onError: (error) => handleError(error, 'Delete operational cost', true, 'Gagal menghapus biaya operasional'),
  })
}

/**
 * Get operational cost statistics
 */
export function useOperationalCostStats() {
  return useQuery<OperationalCostStats>({
    queryKey: ['operational-cost-stats'],
    queryFn: () => fetchApi<OperationalCostStats>('/api/operational-costs/stats'),
  })
}

/**
 * Quick setup operational costs
 */
export function useQuickSetupOperationalCosts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => postApi('/api/operational-costs/quick-setup'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['operational-costs'] })
      void queryClient.invalidateQueries({ queryKey: ['operational-cost-stats'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      successToast('Berhasil', 'Biaya operasional default berhasil dibuat')
    },
    onError: (error) => handleError(error, 'Quick setup operational costs', true, 'Gagal membuat biaya operasional default'),
  })
}
