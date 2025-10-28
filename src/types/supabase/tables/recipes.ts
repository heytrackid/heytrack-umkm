/**
 * Recipes Table Types
 * Re-exported from Supabase generated types
 * 
 * ⚠️ DO NOT manually define table types here!
 * Always use generated types from @/types/supabase-generated
 */

import type { Database } from '@/types/supabase-generated'

// Re-export from generated types
export type RecipesTable = Database['public']['Tables']['recipes']
export type RecipeIngredientsTable = Database['public']['Tables']['recipe_ingredients']

// Convenience type aliases
export type Recipe = RecipesTable['Row']
export type RecipeInsert = RecipesTable['Insert']
export type RecipeUpdate = RecipesTable['Update']

export type RecipeIngredient = RecipeIngredientsTable['Row']
export type RecipeIngredientInsert = RecipeIngredientsTable['Insert']
export type RecipeIngredientUpdate = RecipeIngredientsTable['Update']
