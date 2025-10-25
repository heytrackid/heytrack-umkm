'use client'
import * as React from 'react'

import { useState, useCallback } from 'react'
import { useIngredients, useRecipesWithIngredients } from '@/hooks/useSupabase'

import { apiLogger } from '@/lib/logger'
export interface Recipe {
  id?: string
  name: string
  description: string
  category: string
  ingredients: Array<{
    ingredient_id: string
    quantity: number
    unit: string
  }>
}

export function useRecipeLogic() {
  const { data: recipes, loading, refetch } = useRecipesWithIngredients()
  const { data: ingredients } = useIngredients()
  
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list')
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
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
    setSelectedRecipe(null)
  }, [])

  const handleSaveRecipe = useCallback(async () => {
    try {
      // API call to save recipe would go here
      apiLogger.info('Saving recipe:', newRecipe)
      
      resetForm()
      setCurrentView('list')
      await refetch()
    } catch (error: unknown) {
      apiLogger.error({ error: error }, 'Error saving recipe:')
    }
  }, [newRecipe, resetForm, refetch])

  const handleEditRecipe = useCallback((recipe: any) => {
    setSelectedRecipe(recipe)
    setNewRecipe({
      name: recipe.name || '',
      description: recipe.description || '',
      category: recipe.category || 'makanan-utama',
      ingredients: recipe.recipe_ingredients?.map((ri: any) => ({
        ingredient_id: ri.ingredient_id,
        quantity: ri.quantity,
        unit: ri.unit
      })) || []
    })
    setCurrentView('edit')
  }, [])

  const handleViewRecipe = useCallback((recipe: any) => {
    // Implement recipe view logic
    apiLogger.info({ params: recipe }, 'Viewing recipe:')
  }, [])

  const handleDeleteRecipe = useCallback(async (recipe: any) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        // API call to delete recipe would go here
        apiLogger.info({ params: recipe.id }, 'Deleting recipe:')
        await refetch()
      } catch (error: unknown) {
        apiLogger.error({ error: error }, 'Error deleting recipe:')
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
      setSelectedItems(recipes?.map(recipe => recipe.id) || [])
    } else {
      setSelectedItems([])
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
