// Recipe Generator Hooks

import { useState, useCallback, useEffect } from 'react'
import { RecipeRequest, GeneratedRecipe, RecipeHistory, IndonesianFoodCategory, INDONESIAN_FOOD_CATEGORIES } from '../types/recipe.types'

export interface UseRecipeGeneratorReturn {
  // State
  categories: IndonesianFoodCategory[]
  selectedCategory: IndonesianFoodCategory | null
  recipeRequest: RecipeRequest
  generatedRecipe: GeneratedRecipe | null
  isGenerating: boolean
  error: string | null
  recipeHistory: RecipeHistory[]

  // Actions
  setSelectedCategory: (category: IndonesianFoodCategory | null) => void
  updateRecipeRequest: (updates: Partial<RecipeRequest>) => void
  generateRecipe: () => Promise<void>
  clearRecipe: () => void
  saveRecipe: (recipe: GeneratedRecipe) => void
  toggleFavorite: (recipeId: string) => void
  clearError: () => void
}

export function useRecipeGenerator(): UseRecipeGeneratorReturn {
  const [categories] = useState<IndonesianFoodCategory[]>(INDONESIAN_FOOD_CATEGORIES)
  const [selectedCategory, setSelectedCategory] = useState<IndonesianFoodCategory | null>(null)
  const [recipeRequest, setRecipeRequest] = useState<RecipeRequest>({
    category: '',
    servingSize: 4,
    difficulty: 'medium',
    spiceLevel: 'medium'
  })
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipeHistory, setRecipeHistory] = useState<RecipeHistory[]>([])

  // Load recipe history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('recipe-history')
    if (savedHistory) {
      try {
        setRecipeHistory(JSON.parse(savedHistory))
      } catch (err) {
        console.error('Error loading recipe history:', err)
      }
    }
  }, [])

  // Save recipe history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('recipe-history', JSON.stringify(recipeHistory))
  }, [recipeHistory])

  const updateRecipeRequest = useCallback((updates: Partial<RecipeRequest>) => {
    setRecipeRequest(prev => ({ ...prev, ...updates }))
  }, [])

  const generateRecipe = useCallback(async () => {
    if (!selectedCategory) {
      setError('Pilih kategori makanan terlebih dahulu')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const request: RecipeRequest = {
        ...recipeRequest,
        category: selectedCategory.id
      }

      // Call API route instead of direct service
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate recipe')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate recipe')
      }

      const recipe: GeneratedRecipe = result.data

      setGeneratedRecipe(recipe)

      // Add to history
      const historyItem: RecipeHistory = {
        id: recipe.id,
        recipe,
        saved: false,
        favorited: false,
        createdAt: recipe.generatedAt
      }

      setRecipeHistory(prev => [historyItem, ...prev.slice(0, 49)]) // Keep only last 50 recipes

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat generate resep')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedCategory, recipeRequest])

  const clearRecipe = useCallback(() => {
    setGeneratedRecipe(null)
    setError(null)
  }, [])

  const saveRecipe = useCallback((recipe: GeneratedRecipe) => {
    setRecipeHistory(prev =>
      prev.map(item =>
        item.id === recipe.id
          ? { ...item, saved: true }
          : item
      )
    )
  }, [])

  const toggleFavorite = useCallback((recipeId: string) => {
    setRecipeHistory(prev =>
      prev.map(item =>
        item.id === recipeId
          ? { ...item, favorited: !item.favorited }
          : item
      )
    )
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    categories,
    selectedCategory,
    recipeRequest,
    generatedRecipe,
    isGenerating,
    error,
    recipeHistory,
    setSelectedCategory,
    updateRecipeRequest,
    generateRecipe,
    clearRecipe,
    saveRecipe,
    toggleFavorite,
    clearError
  }
}

// Hook for recipe suggestions
export function useRecipeSuggestions(category?: string, enabled: boolean = true) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !category) return

    const loadSuggestions = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/recipes/generate?category=${encodeURIComponent(category)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions')
        }
        const result = await response.json()
        if (result.success) {
          setSuggestions(result.data)
        } else {
          throw new Error(result.error || 'Failed to get suggestions')
        }
      } catch (error) {
        console.error('Error loading suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    loadSuggestions()
  }, [category, enabled])

  return { suggestions, isLoading }
}

// Hook for recipe search
export function useRecipeSearch(query: string) {
  const [results, setResults] = useState<IndonesianFoodCategory[]>([])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    // Import search function dynamically to avoid circular dependency
    import('../types/recipe.types').then(({ searchCategories }) => {
      const searchResults = searchCategories(query)
      setResults(searchResults)
    })
  }, [query])

  return results
}
