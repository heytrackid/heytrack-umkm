import type { 


// Re-export recipe-related types from the main database types
  RecipesTable, 
  RecipeIngredientsTable,
  RecipesInsert,
  RecipesUpdate,
  RecipeIngredientsInsert,
  RecipeIngredientsUpdate
} from '@/types/database'

export type Recipe = RecipesTable
export type RecipeInsert = RecipesInsert
export type RecipeUpdate = RecipesUpdate

export type RecipeIngredient = RecipeIngredientsTable
export type RecipeIngredientInsert = RecipeIngredientsInsert
export type RecipeIngredientUpdate = RecipeIngredientsUpdate
