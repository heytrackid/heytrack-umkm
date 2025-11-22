import { createClientLogger } from '@/lib/client-logger'
import type { Insert, Row, Update } from '@/types/database'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi, postApi, putApi, deleteApi } from '@/lib/query/query-helpers'
import { toast } from 'sonner'

const logger = createClientLogger('useIngredientPurchases')

type IngredientPurchase = Row<'ingredient_purchases'>
type IngredientPurchaseInsert = Insert<'ingredient_purchases'>
type IngredientPurchaseUpdate = Update<'ingredient_purchases'>

interface IngredientPurchaseWithDetails extends Omit<IngredientPurchase, 'supplier'> {
  ingredient?: {
    id: string
    name: string
    unit: string
  }
  supplier?: {
    id: string
    name: string
  } | string | null
}

interface PurchaseStats {
  total_purchases: number
  total_amount: number
  average_price: number
  top_suppliers: Array<{
    supplier_id: string
    supplier_name: string
    total_purchases: number
    total_amount: number
  }>
}

/**
 * Get all ingredient purchases
 */
export function useIngredientPurchases(params?: {
  ingredientId?: string
  supplierId?: string
  startDate?: string
  endDate?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.ingredientId) searchParams.append('ingredient_id', params.ingredientId)
  if (params?.supplierId) searchParams.append('supplier_id', params.supplierId)
  if (params?.startDate) searchParams.append('start_date', params.startDate)
  if (params?.endDate) searchParams.append('end_date', params.endDate)

  return useQuery<IngredientPurchaseWithDetails[]>({
    queryKey: ['ingredient-purchases', params],
    queryFn: () => fetchApi<IngredientPurchaseWithDetails[]>(`/api/ingredient-purchases?${searchParams}`),
  })
}

/**
 * Get single ingredient purchase by ID
 */
export function useIngredientPurchase(id: string | null) {
  return useQuery<IngredientPurchaseWithDetails>({
    queryKey: ['ingredient-purchase', id],
    queryFn: () => fetchApi<IngredientPurchaseWithDetails>(`/api/ingredient-purchases/${id}`),
    enabled: !!id,
  })
}

/**
 * Create new ingredient purchase
 */
export function useCreateIngredientPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<IngredientPurchaseInsert, 'user_id'>) => postApi<IngredientPurchase>('/api/ingredient-purchases', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient-purchases'] })
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] })
      toast.success('Pembelian bahan berhasil dicatat')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to create ingredient purchase')
      toast.error('Gagal mencatat pembelian bahan')
    },
  })
}

/**
 * Update ingredient purchase
 */
export function useUpdateIngredientPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IngredientPurchaseUpdate> }) => putApi<IngredientPurchase>(`/api/ingredient-purchases/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ingredient-purchases'] })
      queryClient.invalidateQueries({ queryKey: ['ingredient-purchase', id] })
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] })
      toast.success('Pembelian bahan berhasil diperbarui')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to update ingredient purchase')
      toast.error('Gagal memperbarui pembelian bahan')
    },
  })
}

/**
 * Delete ingredient purchase
 */
export function useDeleteIngredientPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteApi(`/api/ingredient-purchases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient-purchases'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] })
      toast.success('Pembelian bahan berhasil dihapus')
    },
    onError: (error) => {
      logger.error({ error }, 'Failed to delete ingredient purchase')
      toast.error('Gagal menghapus pembelian bahan')
    },
  })
}

/**
 * Get purchase statistics
 */
export function usePurchaseStats(params?: { startDate?: string; endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.append('start_date', params.startDate)
  if (params?.endDate) searchParams.append('end_date', params.endDate)

  return useQuery<PurchaseStats>({
    queryKey: ['purchase-stats', params],
    queryFn: () => fetchApi<PurchaseStats>(`/api/ingredient-purchases/stats?${searchParams}`),
  })
}

/**
 * Get purchase history for ingredient
 */
export function useIngredientPurchaseHistory(ingredientId: string | null) {
  return useQuery<IngredientPurchaseWithDetails[]>({
    queryKey: ['ingredient-purchase-history', ingredientId],
    queryFn: () => fetchApi<IngredientPurchaseWithDetails[]>(`/api/ingredients/${ingredientId}/purchase-history`),
    enabled: !!ingredientId,
  })
}
