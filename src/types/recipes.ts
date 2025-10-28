import type { Database } from './supabase-generated'

type Tables = Database['public']['Tables']

export type RecipesTable = Tables['recipes']
export type Recipe = RecipesTable['Row']
export type RecipeInsert = RecipesTable['Insert']
export type RecipeUpdate = RecipesTable['Update']

export type RecipeIngredientsTable = Tables['recipe_ingredients']
export type RecipeIngredient = RecipeIngredientsTable['Row']
export type RecipeIngredientInsert = RecipeIngredientsTable['Insert']
export type RecipeIngredientUpdate = RecipeIngredientsTable['Update']
