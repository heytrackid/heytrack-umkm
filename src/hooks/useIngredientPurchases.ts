import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi, buildApiUrl } from '@/lib/query/query-helpers'

import { useToast } from '@/hooks/use-toast'
import { createClientLogger } from '@/lib/client-logger'
import { getErrorMessage } from '@/lib/type-guards'

import type { Row, Insert, Update } from '@/types/database'

const logger = createClientLogger('IngredientPurchases')

type IngredientPurchase = Row<'ingredient_purchases'>
type IngredientPurchaseInsert = Insert<'ingredient_purchases'>
type IngredientPurchaseUpdate = Update<'ingredient_purchases'>

interface UseIngredientPurchasesOptions {
  limit?: number
  offset?: number
  ingredientId?: string
}

/**
 * Fetch ingredient purchases with caching
 */
export function useIngredientPurchases(options?: UseIngredientPurchasesOptions) {
  return useQuery({
    queryKey: ['ingredient-purchases', options],
    queryFn: async () => {
      const result = await fetchApi<{ ingredient_purchases?: IngredientPurchase[] }>(buildApiUrl('/ingredient-purchases', options as Record<string, string | number | boolean | null | undefined>))
      return result?.ingredient_purchases ?? []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Create ingredient purchase
 */
export function useCreateIngredientPurchase() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: IngredientPurchaseInsert) => {
      const response = await fetch('/api/ingredient-purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Gagal menambahkan pembelian bahan')
      }

      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ingredient-purchases'] })

      toast({
        title: 'Berhasil ✓',
        description: 'Pembelian bahan berhasil ditambahkan',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Gagal menambahkan pembelian bahan')

      toast({
        title: 'Error',
        description: message || 'Gagal menambahkan pembelian bahan',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Update ingredient purchase
 */
export function useUpdateIngredientPurchase() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IngredientPurchaseUpdate }) => {
      const response = await fetch(`/api/ingredient-purchases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Gagal memperbarui pembelian bahan')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['ingredient-purchase', variables['id']] })
      void queryClient.invalidateQueries({ queryKey: ['ingredient-purchases'] })

      toast({
        title: 'Berhasil ✓',
        description: 'Pembelian bahan berhasil diperbarui',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Gagal memperbarui pembelian bahan')

      toast({
        title: 'Error',
        description: message || 'Gagal memperbarui pembelian bahan',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Delete ingredient purchase
 */
export function useDeleteIngredientPurchase() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/ingredient-purchases/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? 'Gagal menghapus pembelian bahan')
      }

      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ingredient-purchases'] })

      toast({
        title: 'Berhasil ✓',
        description: 'Pembelian bahan berhasil dihapus',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Gagal menghapus pembelian bahan')

      toast({
        title: 'Error',
        description: message || 'Gagal menghapus pembelian bahan',
        variant: 'destructive',
      })
    },
  })
}