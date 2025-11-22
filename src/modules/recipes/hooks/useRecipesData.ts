import type { Row } from '@/types/database'
import { createClientLogger } from '@/lib/client-logger'
import { useQuery } from '@tanstack/react-query'

const logger = createClientLogger('useRecipesData')

type Recipe = Row<'recipes'>

interface UseRecipesDataOptions {
  category?: string
  difficulty?: string
  searchTerm?: string
  includeInactive?: boolean
}

export function useRecipesData(options: UseRecipesDataOptions = {}) {
  const { data: recipes = [], isLoading, error, refetch } = useQuery<Recipe[]>({
    queryKey: ['recipes', options.category, options.difficulty, options.includeInactive],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (options.category && options.category !== 'all') {
        params.append('category', options.category)
      }
      
      if (options.difficulty && options.difficulty !== 'all') {
        params.append('difficulty', options.difficulty)
      }
      
      if (!options.includeInactive) {
        params.append('is_active', 'true')
      }

      const response = await fetch(`/api/recipes?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch recipes')
      }
      
      const data = await response.json()
      logger.info('Recipes fetched')
      return data
    },
    staleTime: 30000,
  })

  // Client-side filtering for search term
  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    if (!options.searchTerm) return true
    
    const searchLower = options.searchTerm.toLowerCase()
    return (
      recipe.name.toLowerCase().includes(searchLower) ||
      (recipe.description ?? '').toLowerCase().includes(searchLower)
    )
  })

  return {
    recipes: filteredRecipes,
    loading: isLoading,
    error,
    refetch,
    totalCount: filteredRecipes.length
  }
}
