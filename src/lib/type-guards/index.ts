/**
 * Type Guards for Runtime Type Checking
 * 
 * Use these to validate data at runtime, especially:
 * - API responses from Supabase
 * - User input from forms
 * - External API responses
 * - Unknown/any types
 */

import type { RecipesTable, IngredientsTable, OrdersTable, CustomersTable } from '@/types/database'

// ============================================================================
// Basic Type Guards
// ============================================================================

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isError(value: unknown): value is Error {
  return value instanceof Error
}

// ============================================================================
// Database Type Guards
// ============================================================================

type Recipe = RecipesTable
type Ingredient = IngredientsTable
type Order = OrdersTable
type Customer = CustomersTable

/**
 * Check if value is a valid Recipe
 */
export function isRecipe(value: unknown): value is Recipe {
  if (!isObject(value)) {return false}
  
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.created_by)
  )
}

/**
 * Check if value is a valid Ingredient
 */
export function isIngredient(value: unknown): value is Ingredient {
  if (!isObject(value)) {return false}
  
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.unit) &&
    isString(value.user_id)
  )
}

/**
 * Check if value is a valid Order
 */
export function isOrder(value: unknown): value is Order {
  if (!isObject(value)) {return false}
  
  return (
    isString(value.id) &&
    isString(value.order_no) &&
    isString(value.user_id)
  )
}

/**
 * Check if value is a valid Customer
 */
export function isCustomer(value: unknown): value is Customer {
  if (!isObject(value)) {return false}
  
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.user_id)
  )
}

// ============================================================================
// Extended Type Guards (with relations)
// ============================================================================

interface RecipeWithIngredients extends Recipe {
  recipe_ingredients?: Array<{
    id: string
    quantity: number
    unit: string
    ingredient?: Ingredient[]
  }>
}

/**
 * Check if value is a Recipe with ingredients
 */
export function isRecipeWithIngredients(value: unknown): value is RecipeWithIngredients {
  if (!isRecipe(value)) {return false}
  
  const recipe = value as RecipeWithIngredients
  
  if (recipe.recipe_ingredients !== undefined) {
    return isArray(recipe.recipe_ingredients)
  }
  
  return true
}

interface OrderWithItems extends Order {
  order_items?: Array<{
    id: string
    quantity: number
    unit_price: number
    recipe?: Recipe[]
  }>
}

/**
 * Check if value is an Order with items
 */
export function isOrderWithItems(value: unknown): value is OrderWithItems {
  if (!isOrder(value)) {return false}
  
  const order = value as OrderWithItems
  
  if (order.order_items !== undefined) {
    return isArray(order.order_items)
  }
  
  return true
}

// ============================================================================
// API Response Type Guards
// ============================================================================

interface SupabaseResponse<T> {
  data: T | null
  error: Error | null
}

/**
 * Check if Supabase response is successful
 */
export function isSuccessResponse<T>(
  response: SupabaseResponse<T>
): response is { data: T; error: null } {
  return response.error === null && response.data !== null
}

/**
 * Check if Supabase response has error
 */
export function isErrorResponse<T>(
  response: SupabaseResponse<T>
): response is { data: null; error: Error } {
  return response.error !== null
}

// ============================================================================
// Utility Type Guards
// ============================================================================

/**
 * Check if value is a valid UUID
 */
export function isUUID(value: unknown): value is string {
  if (!isString(value)) {return false}
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

/**
 * Check if value is a valid date string (YYYY-MM-DD)
 */
export function isDateString(value: unknown): value is string {
  if (!isString(value)) {return false}
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(value)) {return false}
  
  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * Check if value is a valid email
 */
export function isEmail(value: unknown): value is string {
  if (!isString(value)) {return false}
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * Check if value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0
}

/**
 * Check if value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0
}

// ============================================================================
// Array Type Guards
// ============================================================================

/**
 * Check if array contains only strings
 */
export function isStringArray(value: unknown): value is string[] {
  return isArray(value) && value.every(isString)
}

/**
 * Check if array contains only numbers
 */
export function isNumberArray(value: unknown): value is number[] {
  return isArray(value) && value.every(isNumber)
}

/**
 * Check if array contains only recipes
 */
export function isRecipeArray(value: unknown): value is Recipe[] {
  return isArray(value) && value.every(isRecipe)
}

/**
 * Check if array contains only ingredients
 */
export function isIngredientArray(value: unknown): value is Ingredient[] {
  return isArray(value) && value.every(isIngredient)
}

// ============================================================================
// Enum Type Guards
// ============================================================================

import type { OrderStatus, ProductionStatus } from '@/types/database'

/**
 * Check if value is a valid order status
 */
export function isOrderStatus(value: unknown): value is OrderStatus {
  if (!isString(value)) {return false}
  
  const validStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'CANCELLED', 'DELIVERED']
  return validStatuses.includes(value as OrderStatus)
}

/**
 * Check if value is a valid production status
 */
export function isProductionStatus(value: unknown): value is ProductionStatus {
  if (!isString(value)) {return false}
  
  const validStatuses: ProductionStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
  return validStatuses.includes(value as ProductionStatus)
}

// ============================================================================
// Export all
// ============================================================================

export const TypeGuards = {
  // Basic
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isError,
  
  // Database
  isRecipe,
  isIngredient,
  isOrder,
  isCustomer,
  
  // Extended
  isRecipeWithIngredients,
  isOrderWithItems,
  
  // API Response
  isSuccessResponse,
  isErrorResponse,
  
  // Utility
  isUUID,
  isDateString,
  isEmail,
  isPositiveNumber,
  isNonNegativeNumber,
  
  // Array
  isStringArray,
  isNumberArray,
  isRecipeArray,
  isIngredientArray,
  
  // Enum
  isOrderStatus,
  isProductionStatus,
}
