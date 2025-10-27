'use client'

import { useSupabaseQuery } from '@/hooks/supabase'
import type { Database } from '@/types/supabase-generated'

type RecipeRow = Database['public']['Tables']['recipes']['Row']
type RecipeIngredientRow = Database['public']['Tables']['recipe_ingredients']['Row']
type IngredientRow = Database['public']['Tables']['ingredients']['Row']

export type RecipeWithIngredients = RecipeRow & {
  recipe_ingredients?: Array<RecipeIngredientRow & { ingredients?: IngredientRow | null }>
}

interface UseRecipesWithIngredientsOptions {
  realtime?: boolean
  refetchOnMount?: boolean
}

export function useRecipesWithIngredients(options: UseRecipesWithIngredientsOptions = {}) {
  return useSupabaseQuery('recipes', {
    select: '*, recipe_ingredients(*, ingredients(*))',
    orderBy: { column: 'name' },
    realtime: options.realtime,
    refetchOnMount: options.refetchOnMount,
  }) as {
    data: RecipeWithIngredients[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
  }
}
