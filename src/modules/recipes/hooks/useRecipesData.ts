import { useState, useEffect } from 'react'
import { useSupabaseData } from '@/shared/hooks'

interface Recipe {
  id: string
  name: string
  description: string
  servings: number
  prep_time: number
  cook_time: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UseRecipesDataOptions {
  category?: string
  difficulty?: string
  searchTerm?: string
  includeInactive?: boolean
}

export function useRecipesData(options: UseRecipesDataOptions = {}) {
  const filters: Record<string, any> = {}
  
  if (options.category && options.category !== 'all') {
    filters.category = options.category
  }
  
  if (options.difficulty && options.difficulty !== 'all') {
    filters.difficulty = options.difficulty
  }
  
  if (!options.includeInactive) {
    filters.is_active = true
  }

  const { data: recipes, loading, error, refetch } = useSupabaseData<Recipe>({
    table: 'recipes',
    filters,
    orderBy: { column: 'name', ascending: true },
    realtime: true
  })

  // Client-side filtering for search term
  const filteredRecipes = recipes.filter(recipe => {
    if (!options.searchTerm) return true
    
    const searchLower = options.searchTerm.toLowerCase()
    return (
      recipe.name.toLowerCase().includes(searchLower) ||
      recipe.description.toLowerCase().includes(searchLower)
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