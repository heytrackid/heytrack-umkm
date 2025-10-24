// Utilities - Helper functions for data synchronization

import type { Ingredient, Recipe } from './types'
import { useDataStore } from './store'

export const getIngredientStatus = (ingredient: Ingredient): {
  status: string
  color: string
  action: string
} => {
  if (ingredient.statusStok === 'habis') {
    return {
      status: 'Habis',
      color: 'text-gray-500 bg-gray-300 dark:text-gray-400 dark:bg-gray-600',
      action: 'Segera restock!'
    }
  }

  if (ingredient.statusStok === 'rendah') {
    return {
      status: 'Rendah',
      color: 'text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700',
      action: 'Perlu diisi ulang'
    }
  }

  return {
    status: 'Aman',
    color: 'text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-800',
    action: 'Stock sufficient'
  }
}

export const getRecipeAvailability = (recipe: Recipe): {
  available: boolean
  missingIngredients: string[]
  canMake: number
} => {
  const missingIngredients: string[] = []
  let maxPortions = Infinity

  recipe.bahan.forEach(ingredient => {
    if (!ingredient.available) {
      missingIngredients.push(ingredient.nama)
      maxPortions = 0
    } else {
      // Calculate how many portions we can make with current stock
      const currentStock = useDataStore.getState().ingredients.find(ing => ing.id === ingredient.ingredientId)
      if (currentStock) {
        const possiblePortions = Math.floor(currentStock.stok / ingredient.quantity) * recipe.porsi
        maxPortions = Math.min(maxPortions, possiblePortions)
      }
    }
  })

  return {
    available: missingIngredients.length === 0,
    missingIngredients,
    canMake: maxPortions === Infinity ? 0 : Math.floor(maxPortions)
  }
}
