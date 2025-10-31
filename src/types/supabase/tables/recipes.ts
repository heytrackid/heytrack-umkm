/**
 * Recipes Table Types
 * Re-exported from Supabase generated types
 * 
 * ⚠️ DO NOT manually define table types here!
 * Always use generated types from @/types/supabase-generated
 */

import type { 
  RecipesTable as RecipesTableType,
  RecipesInsert,
  RecipesUpdate,
  RecipeIngredientsTable as RecipeIngredientsTableType,
  RecipeIngredientsInsert,
  RecipeIngredientsUpdate
} from '@/types/database'

// Re-export from generated types
export type RecipesTable = RecipesTableType
export type RecipeIngredientsTable = RecipeIngredientsTableType

// Convenience type aliases
export type Recipe = RecipesTable
export type RecipeInsert = RecipesInsert
export type RecipeUpdate = RecipesUpdate

export type RecipeIngredient = RecipeIngredientsTable
export type RecipeIngredientInsert = RecipeIngredientsInsert
export type RecipeIngredientUpdate = RecipeIngredientsUpdate
