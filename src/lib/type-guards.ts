/**
 * Type Guards for Runtime Type Validation
 * 
 * Use these guards to safely validate data from external sources
 * like Supabase queries, API responses, etc.
 */

import type { Database } from '@/types/supabase-generated'

type Tables = Database['public']['Tables']

/**
 * Type guard for recipe with ingredients join
 */
export interface RecipeWithIngredients {
  id: string
  name: string
  selling_price: number | null
  servings: number | null
  recipe_ingredients: Array<{
    quantity: number
    unit: string
    ingredient: {
      id: string
      name: string
      price_per_unit: number
      unit: string
    }
  }>
}

export function isRecipeWithIngredients(data: unknown): data is RecipeWithIngredients {
  if (!data || typeof data !== 'object') return false
  
  const recipe = data as RecipeWithIngredients
  
  return (
    typeof recipe.id === 'string' &&
    typeof recipe.name === 'string' &&
    (recipe.selling_price === null || typeof recipe.selling_price === 'number') &&
    (recipe.servings === null || typeof recipe.servings === 'number') &&
    Array.isArray(recipe.recipe_ingredients)
  )
}

/**
 * Type guard for ingredient with stock info
 */
export interface IngredientWithStock {
  id: string
  name: string
  current_stock: number | null
  min_stock: number | null
  price_per_unit: number
  unit: string
}

export function isIngredientWithStock(data: unknown): data is IngredientWithStock {
  if (!data || typeof data !== 'object') return false
  
  const ingredient = data as IngredientWithStock
  
  return (
    typeof ingredient.id === 'string' &&
    typeof ingredient.name === 'string' &&
    (ingredient.current_stock === null || typeof ingredient.current_stock === 'number') &&
    (ingredient.min_stock === null || typeof ingredient.min_stock === 'number') &&
    typeof ingredient.price_per_unit === 'number' &&
    typeof ingredient.unit === 'string'
  )
}

/**
 * Type guard for order with items
 */
export interface OrderWithItems {
  id: string
  order_no: string
  status: string
  total_amount: number
  order_items: Array<{
    id: string
    recipe_id: string
    quantity: number
    unit_price: number
    total_price: number
  }>
}

export function isOrderWithItems(data: unknown): data is OrderWithItems {
  if (!data || typeof data !== 'object') return false
  
  const order = data as OrderWithItems
  
  return (
    typeof order.id === 'string' &&
    typeof order.order_no === 'string' &&
    typeof order.status === 'string' &&
    typeof order.total_amount === 'number' &&
    Array.isArray(order.order_items)
  )
}

/**
 * Helper to safely extract nested Supabase join data
 * Supabase returns joins as arrays, this extracts the first element safely
 */
export function extractFirst<T>(data: T | T[] | null | undefined): T | null {
  if (!data) return null
  if (Array.isArray(data)) return data[0] || null
  return data
}

/**
 * Helper to ensure array from Supabase join
 */
export function ensureArray<T>(data: T | T[] | null | undefined): T[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  return [data]
}

/**
 * Type guard for production batch
 */
export interface ProductionBatch {
  id: string
  recipe_id: string
  quantity: number
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  actual_quantity: number | null
  labor_cost: number | null
}

export function isProductionBatch(data: unknown): data is ProductionBatch {
  if (!data || typeof data !== 'object') return false
  
  const batch = data as ProductionBatch
  
  return (
    typeof batch.id === 'string' &&
    typeof batch.recipe_id === 'string' &&
    typeof batch.quantity === 'number' &&
    ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(batch.status)
  )
}

/**
 * Type guard for HPP calculation result
 */
export interface HppCalculationData {
  id: string
  recipe_id: string
  calculation_date: string
  material_cost: number
  labor_cost: number
  overhead_cost: number
  total_hpp: number
  cost_per_unit: number
}

export function isHppCalculation(data: unknown): data is HppCalculationData {
  if (!data || typeof data !== 'object') return false
  
  const hpp = data as HppCalculationData
  
  return (
    typeof hpp.id === 'string' &&
    typeof hpp.recipe_id === 'string' &&
    typeof hpp.calculation_date === 'string' &&
    typeof hpp.material_cost === 'number' &&
    typeof hpp.labor_cost === 'number' &&
    typeof hpp.overhead_cost === 'number' &&
    typeof hpp.total_hpp === 'number' &&
    typeof hpp.cost_per_unit === 'number'
  )
}

/**
 * Safe number parser with fallback
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isNaN(parsed)) return parsed
  }
  return fallback
}

/**
 * Safe string parser with fallback
 */
export function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return fallback
  return String(value)
}

/**
 * Validate UUID format
 */
export function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

/**
 * Extract error message from unknown error type
 * Safely handles Error objects, strings, and unknown types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  
  return 'An unknown error occurred'
}
