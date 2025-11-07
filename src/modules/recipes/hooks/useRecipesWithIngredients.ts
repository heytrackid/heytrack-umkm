'use client'

import { useSupabaseQuery } from '@/hooks/supabase'

import type { Row } from '@/types/database'




type RecipeRow = Row<'recipes'>
type RecipeIngredientRow = Row<'recipe_ingredients'>
type IngredientRow = Row<'ingredients'>

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
