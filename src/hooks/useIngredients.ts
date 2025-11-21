import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/lib/toast'
import type { ApiErrorResponse, ApiSuccessResponse } from '@/lib/api-core'
import { createClientLogger } from '@/lib/client-logger'
import { cachePresets } from '@/lib/query/query-config'
import { buildApiUrl, fetchApi } from '@/lib/query/query-helpers'
import { getErrorMessage } from '@/lib/type-guards'
import type { Insert, Row, Update } from '@/types/database'

const logger = createClientLogger('Hook')

/**
 * React Query hooks for Ingredients
 * Provides caching and optimistic updates for ingredient data
 */


type Ingredient = Row<'ingredients'>
type IngredientInsert = Insert<'ingredients'>
type IngredientUpdate = Update<'ingredients'>

interface UseIngredientsOptions {
  limit?: number
  offset?: number
  search?: string
}

/**
 * Fetch all ingredients with caching
 */
export function useIngredients(options?: UseIngredientsOptions) {
  return useQuery({
    queryKey: ['ingredients', options],
    queryFn: () => fetchApi<{ ingredients?: Ingredient[], pagination?: unknown }>(buildApiUrl('/api/ingredients', options as Record<string, string | number | boolean | null | undefined>)),
    ...cachePresets.moderatelyUpdated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (result: { ingredients?: Ingredient[] }) => result.ingredients ?? [],
  })
}

/**
 * Fetch single ingredient by ID
 */
export function useIngredient(id: string | null) {
  return useQuery({
    queryKey: ['ingredient', id],
    queryFn: () => fetchApi<Ingredient>(`/api/ingredients/${id}`),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Create new ingredient
 */
export function useCreateIngredient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (data: IngredientInsert) => {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000)

      try {
        const response = await fetch('/api/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
          signal: abortController.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Failed to create ingredient')
        }
        
        const payload = await response.json() as ApiSuccessResponse<Ingredient> | ApiErrorResponse
        if (!('success' in payload) || !payload.success) {
          throw new Error(payload?.error ?? 'Failed to create ingredient')
        }
        return payload.data
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Bahan berhasil ditambahkan',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to create ingredient')
      
      toast({
        title: 'Error',
        description: message || 'Gagal menambahkan bahan',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Update existing ingredient
 */
export function useUpdateIngredient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IngredientUpdate }) => {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000)

      try {
        const response = await fetch(`/api/ingredients/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
          signal: abortController.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Failed to update ingredient')
        }
        
        const payload = await response.json() as ApiSuccessResponse<Ingredient> | ApiErrorResponse
        if (!('success' in payload) || !payload.success) {
          throw new Error(payload?.error ?? 'Failed to update ingredient')
        }
        return payload.data
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['ingredient', variables['id']] })
      void queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Bahan berhasil diperbarui',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to update ingredient')
      
      toast({
        title: 'Error',
        description: message || 'Gagal memperbarui bahan',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Delete ingredient
 */
export function useDeleteIngredient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000)

      try {
        const response = await fetch(`/api/ingredients/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          signal: abortController.signal,
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message ?? 'Failed to delete ingredient')
        }
        
        const payload = await response.json() as ApiSuccessResponse<null> | ApiErrorResponse
        if (!('success' in payload) || !payload.success) {
          throw new Error(payload?.error ?? 'Failed to delete ingredient')
        }
        return payload.data
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw error
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Bahan berhasil dihapus',
      })
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to delete ingredient')
      
      toast({
        title: 'Error',
        description: message || 'Gagal menghapus bahan',
        variant: 'destructive',
      })
    },
  })
}
