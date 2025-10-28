/**
 * React Query hooks for Ingredients
 * Provides caching and optimistic updates for ingredient data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'

type Ingredient = Database['public']['Tables']['ingredients']['Row']
type IngredientInsert = Database['public']['Tables']['ingredients']['Insert']
type IngredientUpdate = Database['public']['Tables']['ingredients']['Update']

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
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.limit) params.set('limit', options.limit.toString())
      if (options?.offset) params.set('offset', options.offset.toString())
      if (options?.search) params.set('search', options.search)
      
      const response = await fetch(`/api/ingredients?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetch single ingredient by ID
 */
export function useIngredient(id: string | null) {
  return useQuery({
    queryKey: ['ingredient', id],
    queryFn: async () => {
      if (!id) return null
      
      const response = await fetch(`/api/ingredients/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch ingredient')
      }
      return response.json()
    },
    enabled: !!id,
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
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create ingredient')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Bahan berhasil ditambahkan',
      })
    },
    onError: (error: Error) => {
      apiLogger.error({ error }, 'Failed to create ingredient')
      
      toast({
        title: 'Error',
        description: error.message || 'Gagal menambahkan bahan',
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
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update ingredient')
      }
      
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ingredient', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Bahan berhasil diperbarui',
      })
    },
    onError: (error: Error) => {
      apiLogger.error({ error }, 'Failed to update ingredient')
      
      toast({
        title: 'Error',
        description: error.message || 'Gagal memperbarui bahan',
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
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete ingredient')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Bahan berhasil dihapus',
      })
    },
    onError: (error: Error) => {
      apiLogger.error({ error }, 'Failed to delete ingredient')
      
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus bahan',
        variant: 'destructive',
      })
    },
  })
}
