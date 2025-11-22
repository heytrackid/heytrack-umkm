import { useToast } from '@/hooks/use-toast'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { createClientLogger } from '@/lib/client-logger'
import { queryConfig } from '@/lib/query/query-config'
import { buildApiUrl, fetchApi, postApi, putApi, deleteApi } from '@/lib/query/query-helpers'
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
  page?: number
  limit?: number
  offset?: number
  search?: string | undefined
}

/**
  * Fetch all ingredients with caching and pagination support
  */
export function useIngredients(options?: UseIngredientsOptions) {
  const { page = 1, limit = 20, search } = options || {}

  // Convert page to offset for API
  const offset = (page - 1) * limit

  const apiOptions = {
    page,
    limit,
    offset,
    search: search || undefined
  }

  return useQuery({
    queryKey: ['ingredients', apiOptions],
    queryFn: () => fetchApi<{ data: Ingredient[]; pagination: any }>(buildApiUrl('/api/ingredients', apiOptions as Record<string, string | number | boolean | null | undefined>)), // eslint-disable-line @typescript-eslint/no-explicit-any
    ...queryConfig.queries.moderate,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
  * Fetch all ingredients as array (for backward compatibility)
  * @deprecated Use useIngredients for new implementations with pagination
  */
export function useIngredientsList(search?: string) {
  return useQuery({
    queryKey: ['ingredients-list', search],
    queryFn: () => fetchApi<Ingredient[]>(buildApiUrl('/api/ingredients', { search: search || undefined, limit: 1000 } as Record<string, string | number | boolean | null | undefined>)),
    ...queryConfig.queries.moderate,
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
    mutationFn: (data: IngredientInsert) => postApi('/api/ingredients', data),
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
    mutationFn: ({ id, data }: { id: string; data: IngredientUpdate }) => putApi(`/api/ingredients/${id}`, data),
    onSuccess: (_: unknown, variables: { id: string; data: IngredientUpdate }) => {
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
    mutationFn: (id: string) => deleteApi(`/api/ingredients/${id}`),
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

/**
 * Import ingredients from CSV
 */
export function useImportIngredients() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const logger = createClientLogger('useImportIngredients')

  return useMutation({
    mutationFn: (ingredients: unknown[]) => postApi('/api/ingredients/import', { ingredients }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ingredients'] })

      toast({
        title: 'Berhasil ✓',
        description: 'Bahan berhasil diimpor',
      })

      logger.info({}, 'Ingredients imported successfully')
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error)
      logger.error({ error: message }, 'Failed to import ingredients')

      toast({
        title: 'Error',
        description: message || 'Gagal mengimpor bahan',
        variant: 'destructive',
      })
    },
  })
}
