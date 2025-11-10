import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/hooks/use-toast'
import { createClientLogger } from '@/lib/client-logger'
import { getErrorMessage } from '@/lib/type-guards'

import type { Row, Insert, Update } from '@/types/database'

const logger = createClientLogger('Hook')

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
      const params = new URLSearchParams()
      if (options?.limit) { params.set('limit', options.limit.toString()) }
      if (options?.offset) { params.set('offset', options.offset.toString()) }
      if (options?.ingredientId) { params.set('ingredientId', options.ingredientId) }

      const response = await fetch(`/api/ingredient-purchases?${params}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch ingredient purchases')
      }
      const result = await response.json() as { data?: IngredientPurchase[] }
      return result['data'] ?? []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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
        throw new Error(error.message ?? 'Failed to create ingredient purchase')
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
      logger.error({ error: message }, 'Failed to create ingredient purchase')

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
        throw new Error(error.message ?? 'Failed to update ingredient purchase')
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
      logger.error({ error: message }, 'Failed to update ingredient purchase')

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
        throw new Error(error.message ?? 'Failed to delete ingredient purchase')
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
      logger.error({ error: message }, 'Failed to delete ingredient purchase')

      toast({
        title: 'Error',
        description: message || 'Gagal menghapus pembelian bahan',
        variant: 'destructive',
      })
    },
  })
}