/**
 * Type Guards for Runtime Type Validation
 * 
 * Use these guards to safely validate data from external sources
 * like Supabase queries, API responses, etc.
 */

import type { 
  Database,
  HppCalculationsTable,
  CustomersTable,
  RecipesTable,
  IngredientsTable,
  OrdersTable,
  ProductionsTable
} from '@/types/database'

type Enums = Database['public']['Enums']

// ============================================================================
// GENERIC TYPE GUARDS
// ============================================================================

/**
 * Check if value is a plain object (not null, not array)
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Check if value is a number or null
 */
export function isNumberOrNull(value: unknown): value is number | null {
  return value === null || typeof value === 'number'
}

/**
 * Check if value is a string or null
 */
export function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

/**
 * Check if value is an array where all elements pass the guard
 */
export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(guard)
}

/**
 * Check if object has all required keys
 */
export function hasKeys<T extends string>(
  value: unknown,
  keys: readonly T[]
): value is Record<T, unknown> {
  if (!isRecord(value)) {return false}
  return keys.every(key => key in value)
}

// ============================================================================
// SAFE PARSERS & UTILITIES
// ============================================================================

/**
 * Safe number parser with fallback
 * Handles null, undefined, strings, and invalid numbers
 */
export function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed
    }
  }
  return fallback
}

/**
 * Safe string parser with fallback
 * Handles null, undefined, and converts other types to string
 */
export function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {return value}
  if (value === null || value === undefined) {return fallback}
  return String(value)
}

/**
 * Validate UUID format (v4)
 */
export function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') {return false}
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

/**
 * Alias for backward compatibility
 */
export const isUUID = isValidUUID

/**
 * Check if value is a valid date string
 */
export function isDateString(value: unknown): value is string {
  if (typeof value !== 'string') {return false}
  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * Check if value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value) && value > 0
}

/**
 * Check if value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value) && value >= 0
}

/**
 * Check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Check if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Check if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * Check if value is non-null and non-undefined
 */
export function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Extract error message from unknown error type
 * Safely handles Error objects, strings, objects with message, and unknown types
 * 
 * @example
 * catch (error: unknown) {
 *   apiLogger.error({ error: getErrorMessage(error) })
 * }
 */
export function getErrorMessage(error: unknown): string {
  // Handle Error instances
  if (error instanceof Error) {
    return error.message
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error
  }
  
  // Handle objects with message property
  if (isRecord(error) && 'message' in error) {
    return safeString(error.message, 'Unknown error')
  }
  
  // Handle objects with error property (nested errors)
  if (isRecord(error) && 'error' in error) {
    return getErrorMessage(error.error)
  }
  
  // Fallback for truly unknown errors
  return 'An unknown error occurred'
}

// ============================================================================
// TYPE ASSERTIONS (Throw errors if validation fails)
// ============================================================================

/**
 * Assert that value is a record
 */
export function assertRecord(value: unknown, message = 'Value must be an object'): asserts value is Record<string, unknown> {
  if (!isRecord(value)) {
    throw new TypeError(message)
  }
}

/**
 * Assert that value is non-null
 */
export function assertNonNull<T>(
  value: T | null | undefined,
  message = 'Value is null or undefined'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new TypeError(message)
  }
}

/**
 * Assert that array elements match guard
 */
export function assertArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
  message = 'Invalid array data'
): asserts value is T[] {
  if (!isArrayOf(value, guard)) {
    throw new TypeError(message)
  }
}

// ============================================================================
// DETAILED VALIDATION FUNCTIONS (Return error details)
// ============================================================================

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate ingredient with detailed errors
 */
export function validateIngredient(value: unknown): ValidationResult {
  const errors: string[] = []

  if (!isRecord(value)) {
    errors.push('Value must be an object')
    return { valid: false, errors }
  }

  if (typeof value.id !== 'string') {
    errors.push('id must be a string')
  }
  if (typeof value.name !== 'string' || value.name.trim() === '') {
    errors.push('name must be a non-empty string')
  }
  if (typeof value.unit !== 'string' || value.unit.trim() === '') {
    errors.push('unit must be a non-empty string')
  }
  if (!isNumberOrNull(value.current_stock)) {
    errors.push('current_stock must be a number or null')
  }
  if (typeof value.current_stock === 'number' && value.current_stock < 0) {
    errors.push('current_stock must be non-negative')
  }
  if (!isNumberOrNull(value.min_stock)) {
    errors.push('min_stock must be a number or null')
  }
  if (typeof value.price_per_unit !== 'number' || value.price_per_unit < 0) {
    errors.push('price_per_unit must be a non-negative number')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validate recipe with detailed errors
 */
export function validateRecipe(value: unknown): ValidationResult {
  const errors: string[] = []

  if (!isRecord(value)) {
    errors.push('Value must be an object')
    return { valid: false, errors }
  }

  if (typeof value.id !== 'string') {
    errors.push('id must be a string')
  }
  if (typeof value.name !== 'string' || value.name.trim() === '') {
    errors.push('name must be a non-empty string')
  }
  if (!isNumberOrNull(value.selling_price)) {
    errors.push('selling_price must be a number or null')
  }
  if (typeof value.selling_price === 'number' && value.selling_price < 0) {
    errors.push('selling_price must be non-negative')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validate order with detailed errors
 */
export function validateOrder(value: unknown): ValidationResult {
  const errors: string[] = []

  if (!isRecord(value)) {
    errors.push('Value must be an object')
    return { valid: false, errors }
  }

  if (typeof value.id !== 'string') {
    errors.push('id must be a string')
  }
  if (!isStringOrNull(value.order_date)) {
    errors.push('order_date must be a string or null')
  }
  if (!isNumberOrNull(value.total_amount)) {
    errors.push('total_amount must be a number or null')
  }
  if (typeof value.total_amount === 'number' && value.total_amount < 0) {
    errors.push('total_amount must be non-negative')
  }
  if (value.status !== null && value.status !== undefined && !isOrderStatus(value.status)) {
    errors.push('status must be a valid OrderStatus or null')
  }

  return { valid: errors.length === 0, errors }
}

// ============================================================================
// SUPABASE JOIN HELPERS (Generic & Type-Safe)
// ============================================================================

/**
 * Helper to safely extract nested Supabase join data
 * Supabase returns joins as arrays, this extracts the first element safely
 * 
 * @example
 * const ingredient = extractFirst(ri.ingredient) // T | null
 */
export function extractFirst<T>(data: T | T[] | null | undefined): T | null {
  if (data === null || data === undefined) {return null}
  if (Array.isArray(data)) {return data[0] ?? null}
  return data
}

/**
 * Helper to ensure array from Supabase join
 * 
 * @example
 * const ingredients = ensureArray(data.recipe_ingredients) // T[]
 */
export function ensureArray<T>(data: T | T[] | null | undefined): T[] {
  if (data === null || data === undefined) {return []}
  if (Array.isArray(data)) {return data}
  return [data]
}

// ============================================================================
// SUPABASE-SPECIFIC TYPE GUARDS
// ============================================================================

/**
 * Type guard for recipe ingredient item (deep validation)
 */
interface RecipeIngredientItem {
  quantity: number
  unit: string
  ingredient: {
    id: string
    name: string
    price_per_unit: number
    unit: string
  }
}

function isRecipeIngredientItem(value: unknown): value is RecipeIngredientItem {
  if (!isRecord(value)) {return false}
  
  return (
    typeof value.quantity === 'number' &&
    typeof value.unit === 'string' &&
    isRecord(value.ingredient) &&
    typeof value.ingredient.id === 'string' &&
    typeof value.ingredient.name === 'string' &&
    typeof value.ingredient.price_per_unit === 'number' &&
    typeof value.ingredient.unit === 'string'
  )
}

/**
 * Type guard for recipe (basic)
 */
export type Recipe = RecipesTable

export function isRecipe(data: unknown): data is Recipe {
  if (!isRecord(data)) {return false}
  
  return (
    hasKeys(data, ['id', 'name']) &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    isNumberOrNull(data.selling_price)
  )
}

/**
 * Assert recipe
 */
export function assertRecipe(value: unknown, message = 'Invalid recipe data'): asserts value is Recipe {
  if (!isRecipe(value)) {
    throw new TypeError(message)
  }
}

/**
 * Type guard for recipe with ingredients join (using generated types)
 */
export interface RecipeWithIngredients {
  id: string
  name: string
  selling_price: number | null
  servings: number | null
  recipe_ingredients: RecipeIngredientItem[]
}

export function isRecipeWithIngredients(data: unknown): data is RecipeWithIngredients {
  if (!isRecord(data)) {return false}
  
  return (
    hasKeys(data, ['id', 'name', 'recipe_ingredients']) &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    isNumberOrNull(data.selling_price) &&
    isNumberOrNull(data.servings) &&
    isArrayOf(data.recipe_ingredients, isRecipeIngredientItem)
  )
}

/**
 * Assert recipe with ingredients
 */
export function assertRecipeWithIngredients(
  value: unknown,
  message = 'Invalid recipe with ingredients data'
): asserts value is RecipeWithIngredients {
  if (!isRecipeWithIngredients(value)) {
    throw new TypeError(message)
  }
}

/**
 * Type guard for ingredient (basic)
 */
export type Ingredient = IngredientsTable

export function isIngredient(data: unknown): data is Ingredient {
  if (!isRecord(data)) {return false}
  
  return (
    hasKeys(data, ['id', 'name', 'unit', 'price_per_unit']) &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    isNumberOrNull(data.current_stock) &&
    isNumberOrNull(data.min_stock) &&
    typeof data.price_per_unit === 'number' &&
    typeof data.unit === 'string'
  )
}

/**
 * Alias for backward compatibility
 */
export const isIngredientWithStock = isIngredient

/**
 * Assert ingredient
 */
export function assertIngredient(value: unknown, message = 'Invalid ingredient data'): asserts value is Ingredient {
  if (!isIngredient(value)) {
    throw new TypeError(message)
  }
}

/**
 * Type guard for order item (deep validation)
 */
interface OrderItem {
  id: string
  recipe_id: string
  quantity: number
  unit_price: number
  total_price: number
}

function isOrderItem(value: unknown): value is OrderItem {
  if (!isRecord(value)) {return false}
  
  return (
    hasKeys(value, ['id', 'recipe_id', 'quantity', 'unit_price', 'total_price']) &&
    typeof value.id === 'string' &&
    typeof value.recipe_id === 'string' &&
    typeof value.quantity === 'number' &&
    typeof value.unit_price === 'number' &&
    typeof value.total_price === 'number'
  )
}

/**
 * Type guard for order status enum
 */
export type OrderStatus = Enums['order_status']

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === 'string' &&
    ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'].includes(value)
  )
}

/**
 * Type guard for order (basic)
 */
export type Order = OrdersTable

export function isOrder(data: unknown): data is Order {
  if (!isRecord(data)) {return false}
  
  return (
    hasKeys(data, ['id']) &&
    typeof data.id === 'string' &&
    isStringOrNull(data.order_date) &&
    isNumberOrNull(data.total_amount) &&
    (data.status === null || isOrderStatus(data.status))
  )
}

/**
 * Assert order
 */
export function assertOrder(value: unknown, message = 'Invalid order data'): asserts value is Order {
  if (!isOrder(value)) {
    throw new TypeError(message)
  }
}

/**
 * Type guard for order with items (using generated types)
 */
export interface OrderWithItems {
  id: string
  order_no: string
  status: OrderStatus
  total_amount: number
  order_items: OrderItem[]
}

export function isOrderWithItems(data: unknown): data is OrderWithItems {
  if (!isRecord(data)) {return false}
  
  return (
    hasKeys(data, ['id', 'order_no', 'status', 'total_amount', 'order_items']) &&
    typeof data.id === 'string' &&
    typeof data.order_no === 'string' &&
    isOrderStatus(data.status) &&
    typeof data.total_amount === 'number' &&
    isArrayOf(data.order_items, isOrderItem)
  )
}

/**
 * Assert order item
 */
export function assertOrderItem(value: unknown, message = 'Invalid order item data'): asserts value is OrderItem {
  if (!isOrderItem(value)) {
    throw new TypeError(message)
  }
}

/**
 * Type guard for production status enum
 */
export type ProductionStatus = Enums['production_status']

export function isProductionStatus(value: unknown): value is ProductionStatus {
  return (
    typeof value === 'string' &&
    ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(value)
  )
}

/**
 * Type guard for production batch (using generated types)
 */
export type ProductionBatch = ProductionsTable

export function isProductionBatch(data: unknown): data is ProductionBatch {
  if (!isRecord(data)) {return false}
  
  return (
    hasKeys(data, ['id', 'recipe_id', 'quantity', 'status']) &&
    typeof data.id === 'string' &&
    typeof data.recipe_id === 'string' &&
    typeof data.quantity === 'number' &&
    isProductionStatus(data.status) &&
    isNumberOrNull(data.actual_quantity) &&
    isNumberOrNull(data.labor_cost)
  )
}

/**
 * Type guard for HPP calculation result (using generated types)
 */
export type HppCalculationData = HppCalculationsTable

export function isHppCalculation(data: unknown): data is HppCalculationData {
  if (!isRecord(data)) {return false}
  
  return (
    hasKeys(data, ['id', 'recipe_id', 'calculation_date', 'material_cost', 'labor_cost', 'overhead_cost', 'total_hpp', 'cost_per_unit']) &&
    typeof data.id === 'string' &&
    typeof data.recipe_id === 'string' &&
    typeof data.calculation_date === 'string' &&
    typeof data.material_cost === 'number' &&
    typeof data.labor_cost === 'number' &&
    typeof data.overhead_cost === 'number' &&
    typeof data.total_hpp === 'number' &&
    typeof data.cost_per_unit === 'number'
  )
}

/**
 * Type guard for customer (using generated types)
 */
export type Customer = CustomersTable

export function isCustomer(data: unknown): data is Customer {
  if (!isRecord(data)) {return false}
  
  return (
    hasKeys(data, ['id', 'name']) &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    isStringOrNull(data.phone) &&
    isStringOrNull(data.email) &&
    isStringOrNull(data.address)
  )
}
