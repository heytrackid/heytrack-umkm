
import { successToast } from '@/hooks/use-toast'
import { handleError } from '@/lib/error-handling'
import { deleteApi, fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import type { Insert, Row, Update } from '@/types/database'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'



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
    queryFn: async () => {
      const response = await fetchApi<{ data: IngredientPurchaseWithDetails[] }>(`/api/ingredient-purchases?${searchParams}`)
      // Extract data array if response has pagination structure
      return Array.isArray(response) ? response : response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
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
      void queryClient.invalidateQueries({ queryKey: ['ingredient-purchases'] })
      void queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      void queryClient.invalidateQueries({ queryKey: ['ingredients-list'] })
      void queryClient.invalidateQueries({ queryKey: ['purchase-stats'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['reports', 'inventory'] })
      successToast('Berhasil', 'Pembelian bahan berhasil dicatat')
    },
    onError: (error) => handleError(error, 'Create ingredient purchase', true, 'Gagal mencatat pembelian bahan'),
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
      void queryClient.invalidateQueries({ queryKey: ['ingredient-purchases'] })
      void queryClient.invalidateQueries({ queryKey: ['ingredient-purchase', id] })
      void queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      void queryClient.invalidateQueries({ queryKey: ['purchase-stats'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      successToast('Berhasil', 'Pembelian bahan berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update ingredient purchase', true, 'Gagal memperbarui pembelian bahan'),
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
       void queryClient.invalidateQueries({ queryKey: ['ingredient-purchases'] })
       void queryClient.invalidateQueries({ queryKey: ['ingredients'] })
       void queryClient.invalidateQueries({ queryKey: ['purchase-stats'] })
       void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
       successToast('Berhasil', 'Pembelian bahan berhasil dihapus')
     },
     onError: (error) => handleError(error, 'Delete ingredient purchase', true, 'Gagal menghapus pembelian bahan'),
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
    queryFn: async () => {
      const response = await fetchApi<{ data: IngredientPurchaseWithDetails[] }>(`/api/ingredients/${ingredientId}/purchase-history`)
      // Extract data array if response has pagination structure
      return Array.isArray(response) ? response : response.data
    },
    enabled: !!ingredientId,
  })
}
