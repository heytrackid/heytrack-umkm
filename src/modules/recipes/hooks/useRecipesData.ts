import type { Row } from '@/types/database'

import { useSupabaseQuery } from '@/hooks/supabase'
type Recipe = Row<'recipes'>

interface UseRecipesDataOptions {
  category?: string
  difficulty?: string
  searchTerm?: string
  includeInactive?: boolean
}

export function useRecipesData(options: UseRecipesDataOptions = {}) {
  const filters: Record<string, unknown> = {}
  
  if (options.category && options.category !== 'all') {
    filters.category = options.category
  }
  
  if (options.difficulty && options.difficulty !== 'all') {
    filters.difficulty = options.difficulty
  }
  
  if (!options.includeInactive) {
    filters.is_active = true
  }

  // Implement proper data fetching
  const { data: recipes, loading, error, refetch } = useSupabaseQuery('recipes', {
    filter: filters,
    orderBy: { column: 'created_at', ascending: false },
  })

  // Client-side filtering for search term
  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    if (!options.searchTerm) {return true}
    
    const searchLower = options.searchTerm.toLowerCase()
    return (
      recipe.name.toLowerCase().includes(searchLower) ||
      (recipe.description ?? '').toLowerCase().includes(searchLower)
    )
  })

  return {
    recipes: filteredRecipes,
    loading,
    error,
    refetch,
    totalCount: filteredRecipes.length
  }
}
