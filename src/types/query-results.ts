/**
 * Typed Query Result Interfaces
 * 
 * Supabase joins return nested structures that don't match generated types.
 * These interfaces define the exact structure of query results with relations.
 */

import type { Database } from '@/types/supabase-generated'

// Base table types
type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type Customer = Database['public']['Tables']['customers']['Row']
type FinancialRecord = Database['public']['Tables']['financial_records']['Row']

// Query result types with relations

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export interface OrderWithItemsAndRecipes extends Order {
  order_items: Array<OrderItem & {
    recipe: Recipe | null
  }>
}

export interface OrderWithCustomer extends Order {
  customer: Customer | null
}

export interface OrderWithRelations extends Order {
  order_items: Array<OrderItem & {
    recipe: Recipe | null
  }>
  customer: Customer | null
}

export interface RecipeWithIngredients extends Recipe {
  recipe_ingredients: Array<RecipeIngredient & {
    ingredient: Ingredient
  }>
}

export interface RecipeIngredientWithDetails extends RecipeIngredient {
  ingredient: Ingredient
}

export interface IngredientWithStock extends Ingredient {
  current_stock: number
  min_stock: number
  reorder_point: number | null
}

// Financial query results
export interface FinancialRecordWithDetails extends FinancialRecord {
  order?: Order | null
  customer?: Customer | null
}

// Type guards for runtime validation

export function isOrderWithItems(data: unknown): data is OrderWithItems {
  if (!data || typeof data !== 'object') {return false}
  const order = data as OrderWithItems
  return (
    typeof order.id === 'string' &&
    Array.isArray(order.order_items)
  )
}

export function isRecipeWithIngredients(data: unknown): data is RecipeWithIngredients {
  if (!data || typeof data !== 'object') {return false}
  const recipe = data as RecipeWithIngredients
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    Array.isArray(recipe.recipe_ingredients)
  )
}

export function isOrderWithRelations(data: unknown): data is OrderWithRelations {
  if (!data || typeof data !== 'object') {return false}
  const order = data as OrderWithRelations
  return (
    typeof order.id === 'string' &&
    Array.isArray(order.order_items) &&
    (order.customer === null || typeof order.customer === 'object')
  )
}

// Helper to validate array of typed results
export function validateQueryResults<T>(
  data: unknown,
  validator: (item: unknown) => item is T
): T[] {
  if (!Array.isArray(data)) {
    throw new Error('Query result is not an array')
  }
  
  const validated = data.filter(validator)
  
  if (validated.length !== data.length) {
    throw new Error(`Invalid query results: expected ${data.length}, got ${validated.length} valid items`)
  }
  
  return validated
}
