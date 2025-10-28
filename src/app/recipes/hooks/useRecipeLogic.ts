'use client'
import { useState, useCallback } from 'react'
import type { Recipe, RecipeWithIngredients } from '@/types/domain/recipes'

import { useIngredients } from '@/hooks'
import { useRecipesWithIngredients } from '@/modules/recipes/hooks/useRecipesWithIngredients'

import { apiLogger } from '@/lib/logger'

export function useRecipeLogic() {
  const { data: recipes = [], loading, refetch } = useRecipesWithIngredients()
  const { data: ingredients } = useIngredients()
  
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    name: '',
    description: '',
    category: 'makanan-utama',
    ingredients: []
  })

  const resetForm = useCallback(() => {
    setNewRecipe({
      name: '',
      description: '',
      category: 'makanan-utama',
      ingredients: []
    })
    void setSelectedRecipe(null)
  }, [])

  const handleSaveRecipe = useCallback(async () => {
    try {
      // API call to save recipe would go here
      apiLogger.info({ recipe: newRecipe }, 'Saving recipe')
      
      resetForm()
      void setCurrentView('list')
      await refetch()
    } catch (err: unknown) {
      apiLogger.error({ err }, 'Error saving recipe:')
    }
  }, [newRecipe, resetForm, refetch])

  const handleEditRecipe = useCallback((recipe: RecipeWithIngredients) => {
    void setSelectedRecipe(recipe)
    setNewRecipe({
      name: recipe.name || '',
      description: recipe.description || '',
      category: recipe.category || 'makanan-utama',
      ingredients: recipe.recipe_ingredients?.map((ri) => ({
        ingredient_id: ri.ingredient_id,
        quantity: ri.quantity,
        unit: ri.unit
      })) || []
    })
    void setCurrentView('edit')
  }, [])

  const handleViewRecipe = useCallback((recipe: RecipeWithIngredients) => {
    // Implement recipe view logic
    apiLogger.info({ recipe }, 'Viewing recipe')
  }, [])

  const handleDeleteRecipe = useCallback(async (recipe: RecipeWithIngredients) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        // API call to delete recipe would go here
        apiLogger.info({ recipeId: recipe.id }, 'Deleting recipe')
        await refetch()
      } catch (err: unknown) {
        apiLogger.error({ err }, 'Error deleting recipe:')
      }
    }
  }, [refetch])

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(recipes.map(recipe => recipe.id))
    } else {
      void setSelectedItems([])
    }
  }, [recipes])

  const getBreadcrumbItems = useCallback(() => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Recipes' }
    ]
    
    if (currentView === 'add') {
      items.push({ label: 'Add Recipe' })
    } else if (currentView === 'edit') {
      items.push({ label: 'Edit Recipe' })
    }
    
    return items
  }, [currentView])

  return {
    // Data
    recipes: recipes || [],
    ingredients: ingredients || [],
    loading,
    currentView,
    selectedRecipe,
    selectedItems,
    searchTerm,
    newRecipe,
    
    // Actions
    setCurrentView,
    setSearchTerm,
    setNewRecipe,
    handleSaveRecipe,
    handleEditRecipe,
    handleViewRecipe,
    handleDeleteRecipe,
    handleSelectItem,
    handleSelectAll,
    resetForm,
    refetch,
    getBreadcrumbItems
  }
}
