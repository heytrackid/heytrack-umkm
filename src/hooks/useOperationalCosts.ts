
import type { Insert, Row, Update } from '@/types/database'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi, postApi, putApi, deleteApi } from '@/lib/query/query-helpers'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handling'



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
    queryFn: () => fetchApi<OperationalCost[]>(`/api/operational-costs?${searchParams}`),
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
      queryClient.invalidateQueries({ queryKey: ['operational-costs'] })
      queryClient.invalidateQueries({ queryKey: ['operational-cost-stats'] })
      toast.success('Biaya operasional berhasil ditambahkan')
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
      queryClient.invalidateQueries({ queryKey: ['operational-costs'] })
      queryClient.invalidateQueries({ queryKey: ['operational-cost', id] })
      queryClient.invalidateQueries({ queryKey: ['operational-cost-stats'] })
      toast.success('Biaya operasional berhasil diperbarui')
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
      queryClient.invalidateQueries({ queryKey: ['operational-costs'] })
      queryClient.invalidateQueries({ queryKey: ['operational-cost-stats'] })
      toast.success('Biaya operasional berhasil dihapus')
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
      queryClient.invalidateQueries({ queryKey: ['operational-costs'] })
      toast.success('Biaya operasional default berhasil dibuat')
    },
    onError: (error) => handleError(error, 'Quick setup operational costs', true, 'Gagal membuat biaya operasional default'),
  })
}
