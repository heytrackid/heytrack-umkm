import { successToast } from '@/hooks/use-toast'
import { handleError } from '@/lib/error-handling'
import { deleteApi, fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import type { Insert, Update } from '@/types/database'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'



type ProductionBatch = {
  id: string
  recipe_id: string
  quantity: number
  status: string
  scheduled_date: string
  started_at?: string | null
  completed_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  user_id: string
}

type ProductionBatchInsert = Insert<'production_batches'>
type ProductionBatchUpdate = Update<'production_batches'>

interface ProductionBatchWithDetails extends ProductionBatch {
  recipe?: {
    id: string
    name: string
    servings?: number
  }
}

interface ProductionConstraints {
  max_daily_batches: number
  max_batch_size: number
  min_batch_size: number
  production_hours_per_day: number
}

interface ProductionBatchesResponse {
  data: ProductionBatchWithDetails[]
  total: number
  page: number
  limit: number
}

/**
 * Get all production batches
 */
export function useProductionBatches() {
  return useQuery<ProductionBatchesResponse, Error, ProductionBatchWithDetails[]>({
    queryKey: ['production-batches'],
    queryFn: () => fetchApi<ProductionBatchesResponse>('/api/production/batches'),
    select: (result) => result.data ?? [],
  })
}

/**
 * Get single production batch by ID
 */
export function useProductionBatch(id: string | null) {
  return useQuery<ProductionBatchWithDetails>({
    queryKey: ['production-batch', id],
    queryFn: () => fetchApi<ProductionBatchWithDetails>(`/api/production/batches/${id}`),
    enabled: !!id,
  })
}

/**
 * Create new production batch
 */
export function useCreateProductionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<ProductionBatchInsert>) => postApi('/api/production/batches', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-batches'] })
      successToast('Berhasil', 'Batch produksi berhasil dibuat')
    },
    onError: (error) => handleError(error, 'Create production batch', true, 'Gagal membuat batch produksi'),
  })
}

/**
 * Update production batch
 */
export function useUpdateProductionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductionBatchUpdate> }) => putApi(`/api/production/batches/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['production-batches'] })
      queryClient.invalidateQueries({ queryKey: ['production-batch', id] })
      successToast('Berhasil', 'Batch produksi berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update production batch', true, 'Gagal memperbarui batch produksi'),
  })
}

/**
 * Delete production batch
 */
export function useDeleteProductionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteApi(`/api/production/batches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-batches'] })
      successToast('Berhasil', 'Batch produksi berhasil dihapus')
    },
    onError: (error) => handleError(error, 'Delete production batch', true, 'Gagal menghapus batch produksi'),
  })
}

/**
 * Get production metrics
 */
export function useProductionMetrics(params?: { startDate?: string; endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.append('start_date', params.startDate)
  if (params?.endDate) searchParams.append('end_date', params.endDate)

  return useQuery({
    queryKey: ['production-metrics', params],
    queryFn: () => fetchApi(`/api/production/metrics?${searchParams}`),
  })
}

/**
 * Sync batch with inventory
 */
export function useSyncBatchWithInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (batchId: string) => postApi(`/api/production/batches/${batchId}/sync-inventory`),
    onSuccess: (_, batchId) => {
      queryClient.invalidateQueries({ queryKey: ['production-batch', batchId] })
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      successToast('Berhasil', 'Inventori berhasil disinkronkan')
    },
    onError: (error) => handleError(error, 'Sync batch with inventory', true, 'Gagal sinkronisasi inventori'),
  })
}

/**
 * Link batch to order
 */
export function useLinkBatchToOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ batchId, orderId }: { batchId: string; orderId: string }) => postApi(`/api/production/batches/${batchId}/link-order`, { orderId }),
    onSuccess: (_, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: ['production-batch', batchId] })
      successToast('Berhasil', 'Batch berhasil dihubungkan dengan pesanan')
    },
    onError: (error) => handleError(error, 'Link batch to order', true, 'Gagal menghubungkan dengan pesanan'),
  })
}

/**
 * Get production capacity/constraints
 */
export function useProductionCapacity() {
  return useQuery<ProductionConstraints>({
    queryKey: ['production-capacity'],
    queryFn: () => fetchApi<ProductionConstraints>('/api/production/capacity'),
  })
}

/**
 * Update production constraints
 */
export function useUpdateProductionConstraints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (constraints: ProductionConstraints) => putApi('/api/production/capacity', constraints),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-capacity'] })
      successToast('Berhasil', 'Kapasitas produksi berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update production constraints', true, 'Gagal memperbarui kapasitas produksi'),
  })
}
