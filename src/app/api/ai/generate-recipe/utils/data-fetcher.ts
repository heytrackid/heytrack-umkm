import { apiLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/server'
import type { GeneratedRecipe, IngredientSubset } from '../types'

export async function fetchUserIngredients(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<IngredientSubset[]> {
  const { data: ingredients, error } = await supabase
    .from('ingredients')
    .select('id, name, unit, price_per_unit, current_stock')
    .eq('user_id', userId)

  if (error) {
    apiLogger.error({ error }, 'Error fetching ingredients')
  }

  return ((ingredients as Array<{
    id: string
    name: string
    unit: string | null
    price_per_unit: number | null
    current_stock: number | null
  }>) ?? []).map(ing => ({
    id: ing.id,
    name: ing.name,
    unit: ing.unit || 'gram',
    price_per_unit: ing.price_per_unit || 0,
    current_stock: ing.current_stock ?? 0
  }))
}

export async function handleDuplicateRecipeName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  recipe: GeneratedRecipe,
  userId: string
): Promise<GeneratedRecipe> {
  const recipeName = typeof recipe.name === 'string' ? recipe.name : ''
  const { data: existingRecipes } = await supabase
    .from('recipes')
    .select('id, name')
    .eq('name', recipeName)
    .eq('user_id', userId)

  if (existingRecipes && existingRecipes.length > 0) {
    apiLogger.warn({ recipeName, count: existingRecipes.length }, 'Duplicate recipe name detected')
    return { ...recipe, name: `${recipeName} v${existingRecipes.length + 1}` }
  }

  return recipe
}
