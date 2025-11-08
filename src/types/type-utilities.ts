import type { Database, Row, TableName, OrderStatus, ProductionStatus } from './database'
import type { SupabaseClient } from '@supabase/supabase-js'




/**
 * ✅ Unified Type System
 * ------------------------------------------------------------
 * All-in-one: Type Guards, Type Helpers, Type Utilities
 * Untuk menghilangkan `as any` dengan type-safe helpers
 */

/* -------------------------------------------------------------------------- */
/*  🔗 SUPABASE JOIN HELPERS                                                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  📊 ENUM TYPE ALIASES (imported from database.ts)                         */
/* -------------------------------------------------------------------------- */

// OrderStatus and ProductionStatus are now imported from database.ts above

/* -------------------------------------------------------------------------- */
/*  🔧 COMMON TYPES                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Standard error type for catch blocks
 */
export type CatchError = Error | string | { message: string; error?: CatchError }

/**
 * JSON-serializable value
 */
 
export type JsonValue =
  | boolean
  | JsonValue[]
  | null
  | number
  | string
  | { [key: string]: JsonValue | undefined }

/**
 * Generic data object
 */
export type DataObject = Record<string, JsonValue>

/**
 * Helper untuk data dengan relasi/join dari Supabase
 * 
 * @example
 * type OrderWithCustomer = WithRelation<'orders', { customer: 'customers' }>
 * const order: OrderWithCustomer = data
 * order.customer.name // ✅ Type-safe
 */
export type WithRelation<
  T extends TableName,
  Relations extends Record<string, TableName>
> = Row<T> & {
  [K in keyof Relations]: Relations[K] extends TableName
    ? Row<Relations[K]> | null
    : never
}

/**
 * Helper untuk array relasi (one-to-many)
 * 
 * @example
 * type RecipeWithIngredients = WithArrayRelation<'recipes', {
 *   recipe_ingredients: 'recipe_ingredients'
 * }>
 */
export type WithArrayRelation<
  T extends TableName,
  Relations extends Record<string, TableName>
> = Row<T> & {
  [K in keyof Relations]: Relations[K] extends TableName
    ? Array<Row<Relations[K]>>
    : never
}

/**
 * Helper untuk nested relations
 * 
 * @example
 * type OrderItem = Row<'order_items'>
 * type OrderItemWithRecipe = WithNestedRelation<OrderItem, 'recipe', 'recipes'>
 */
export type WithNestedRelation<
  TBase,
  TKey extends string,
  TTable extends TableName
> = TBase & Record<TKey, Row<TTable> | null>

/* -------------------------------------------------------------------------- */
/*  🌐 BROWSER API TYPE GUARDS                                               */
/* -------------------------------------------------------------------------- */

/**
 * Type guard untuk Network Information API
 */
export interface NetworkInformation {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g'
  downlink: number
  rtt: number
  saveData: boolean
  addEventListener: (type: string, listener: EventListener) => void
  removeEventListener: (type: string, listener: EventListener) => void
}

export function hasConnection(nav: Navigator): nav is Navigator & {
  connection: NetworkInformation
} {
  return 'connection' in nav && nav.connection !== undefined
}

/**
 * Type guard untuk Performance Memory API
 */
export interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export function hasMemory(perf: Performance): perf is Performance & {
  memory: PerformanceMemory
} {
  return 'memory' in perf && perf.memory !== undefined
}

/**
 * Type guard untuk requestIdleCallback
 */
export interface IdleCallbackWindow extends Window {
  requestIdleCallback: (
    callback: (deadline: IdleDeadline) => void,
    options?: { timeout: number }
  ) => number
}

export function hasRequestIdleCallback(
  win: Window
): win is IdleCallbackWindow {
  return 'requestIdleCallback' in win
}

/* -------------------------------------------------------------------------- */
/*  📝 FORM & VALIDATION HELPERS                                             */
/* -------------------------------------------------------------------------- */

/**
 * Helper untuk extract form values dengan type safety
 */
export type FormValues<T> = {
  [K in keyof T]: T[K] extends object
    ? FormValues<T[K]>
    : T[K] extends Array<infer U>
    ? Array<FormValues<U>>
    : T[K]
}

/**
 * Safe accessor untuk nested object properties
 */
export function safeGet<T extends DataObject, K extends keyof T>(
  obj: T | null | undefined,
  key: K
): T[K] | undefined {
  if (obj === null || obj === undefined) {return undefined}
  return obj[key]
}

/**
 * Safe accessor dengan default value
 */
export function safeGetWithDefault<T extends DataObject, K extends keyof T, D>(
  obj: T | null | undefined,
  key: K,
  defaultValue: D
): D | T[K] {
  if (obj === null || obj === undefined) {return defaultValue}
  const value = obj[key]
  return value ?? defaultValue
}

/* -------------------------------------------------------------------------- */
/*  🎯 BASIC TYPE GUARDS                                                     */
/* -------------------------------------------------------------------------- */

export function isString(value: JsonValue): value is string {
  return typeof value === 'string'
}

export function isNumber(value: JsonValue): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

export function isBoolean(value: JsonValue): value is boolean {
  return typeof value === 'boolean'
}

export function isRecord(value: JsonValue): value is DataObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isArray(value: JsonValue): value is JsonValue[] {
  return Array.isArray(value)
}

export function isError(value: CatchError): value is Error {
  return value instanceof Error
}

export function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function isNumberOrNull(value: JsonValue): value is number | null {
  return value === null || typeof value === 'number'
}

export function isStringOrNull(value: JsonValue): value is string | null {
  return value === null || typeof value === 'string'
}

/* -------------------------------------------------------------------------- */
/*  🔍 ADVANCED TYPE GUARDS                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Check if value has specific key
 */
export function hasKey<K extends string>(
  obj: JsonValue,
  key: K
): obj is Record<K, JsonValue> {
  return isRecord(obj) && key in obj
}

/**
 * Check if object has all required keys
 */
export function hasKeys<T extends string>(
  value: JsonValue,
  keys: readonly T[]
): value is Record<T, JsonValue> {
  if (!isRecord(value)) {return false}
  return keys.every(key => key in value)
}

/**
 * Check if array contains only elements matching guard
 */
export function isArrayOf<T extends JsonValue>(
  value: unknown,
  guard: (item: JsonValue) => item is T
): value is T[] {
  return Array.isArray(value) && value.every((item) => guard(item as JsonValue))
}

/**
 * Validation guards
 */
export function isValidUUID(value: JsonValue): value is string {
  if (typeof value !== 'string') {return false}
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

export const isUUID = isValidUUID

export function isDateString(value: JsonValue): value is string {
  if (typeof value !== 'string') {return false}
  const date = new Date(value)
  return !isNaN(date.getTime())
}

export function isEmail(value: JsonValue): value is string {
  if (typeof value !== 'string') {return false}
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

export function isPositiveNumber(value: JsonValue): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value) && value > 0
}

export function isNonNegativeNumber(value: JsonValue): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value) && value >= 0
}

/**
 * Array type guards
 */
export function isStringArray(value: JsonValue): value is string[] {
  return isArray(value) && value.every(isString)
}

export function isNumberArray(value: JsonValue): value is number[] {
  return isArray(value) && value.every(isNumber)
}

/* -------------------------------------------------------------------------- */
/*  🛡️ ASSERTIONS                                                           */
/* -------------------------------------------------------------------------- */

export function assertRecord(
  value: JsonValue,
  message = 'Value must be an object'
): asserts value is DataObject {
  if (!isRecord(value)) {throw new TypeError(message)}
}

export function assertNonNull<T>(
  value: T | null | undefined,
  message = 'Value is null or undefined'
): asserts value is T {
  if (value === null || value === undefined) {throw new TypeError(message)}
}

export function assertArrayOf<T extends JsonValue>(
  value: JsonValue,
  guard: (item: JsonValue) => item is T,
  message = 'Invalid array data'
): asserts value is T[] {
  if (!isArrayOf(value, guard)) {throw new TypeError(message)}
}

/* -------------------------------------------------------------------------- */
/*  🔧 SAFE UTILITIES                                                        */
/* -------------------------------------------------------------------------- */

export function safeNumber(value: JsonValue, fallback = 0): number {
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

export function safeString(value: JsonValue, fallback = ''): string {
  if (typeof value === 'string') {return value}
  if (value === null || value === undefined) {return fallback}
  return String(value)
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {return error}

  if (error instanceof Error) {return error.message}

  if (typeof error === 'object' && error !== null) {
    if ('error' in error && (error as { error: unknown }).error) {
      return getErrorMessage((error as { error: unknown }).error)
    }

    if ('message' in error) {
      const msg = (error as { message: unknown }).message
      return typeof msg === 'string' ? msg : 'Unknown error'
    }
  }

  return 'An unknown error occurred'
}

/**
 * Extract array item or return single item if not array
 */
export function extractFirst<T>(value: T | T[] | null | undefined): T | null {
  if (value === null || value === undefined) {return null}
  if (Array.isArray(value)) {
    return value.length > 0 ? (value[0] as T) : null
  }
  return value
}

/**
 * Ensure value is an array
 */
export function ensureArray<T>(data: T | T[] | null | undefined): T[] {
  if (data === null || data === undefined) {return []}
  if (Array.isArray(data)) {return data}
  return [data]
}

/**
 * Safe JSON parse with type guard
 */
export function safeParse<T extends JsonValue>(
  json: string | null | undefined,
  guard: (value: JsonValue) => value is T
): T | null {
  if (!json) {return null}
  try {
    const parsed = JSON.parse(json) as JsonValue
    return guard(parsed) ? parsed : null
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/*  📊 SUPABASE CLIENT HELPERS                                               */
/* -------------------------------------------------------------------------- */

/**
 * Typed Supabase client helper
 * Gunakan ini instead of `client as any`
 */
export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Helper untuk cast Supabase client dengan type safety
 */
 
export function typed(
   
  client: SupabaseClient<Database, any, any>
): TypedSupabaseClient {
  return client as unknown as TypedSupabaseClient
}

/* -------------------------------------------------------------------------- */
/*  🔄 DATA TRANSFORMATION HELPERS                                           */
/* -------------------------------------------------------------------------- */

/**
 * Safe mapper untuk array dengan type inference
 */
export function safeMap<T, R>(
  arr: T[] | null | undefined,
  mapper: (item: T, index: number) => R
): R[] {
  if (!arr || !Array.isArray(arr)) {return []}
  return arr.map(mapper)
}

/**
 * Safe filter dengan type guard
 */
export function safeFilter<T extends JsonValue, S extends T>(
  arr: T[] | null | undefined,
  guard: (item: T) => item is S
): S[] {
  if (!arr || !Array.isArray(arr)) {return []}
  return arr.filter(guard)
}

/**
 * Check if value is defined (not null/undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/* -------------------------------------------------------------------------- */
/*  📋 DOMAIN-SPECIFIC TYPE GUARDS                                           */
/* -------------------------------------------------------------------------- */

export type Recipe = Row<'recipes'>
export type Ingredient = Row<'ingredients'>
export type Order = Row<'orders'>
export type Customer = Row<'customers'>
// OrderStatus and ProductionStatus are imported from database.ts
export type PaymentStatus = 'paid' | 'partial' | 'unpaid'

/**
 * Check if value is a valid Recipe
 */
export function isRecipe(value: JsonValue): value is Recipe {
  if (!isRecord(value)) {return false}
  return (
    hasKeys(value, ['id', 'name']) &&
    isString(value['id']) &&
    isString(value.name)
  )
}

/**
 * Type for Recipe with nested ingredients relation
 */
export type RecipeWithIngredients = Recipe & {
  recipe_ingredients: Array<{
    id: string
    quantity: number
    unit: string
    ingredient_id: string
    ingredients: {
      id: string
      name: string
      price_per_unit: number | null
      weighted_average_cost: number | null
      unit: string
    } | null
  }>
}

/**
 * Check if value is a Recipe with ingredients relation
 */
export function isRecipeWithIngredients(value: JsonValue): value is RecipeWithIngredients {
  if (!isRecord(value)) {return false}
  if (!hasKey(value, 'id') || !isString(value['id'])) {return false}
  if (!hasKey(value, 'name') || !isString(value.name)) {return false}
  if (!hasKey(value, 'recipe_ingredients')) {return false}
  if (!isArray(value.recipe_ingredients)) {return false}
  
  // Validate each recipe ingredient has required fields
  return value.recipe_ingredients.every(ri => 
    isRecord(ri) &&
    hasKeys(ri, ['id', 'quantity', 'unit', 'ingredient_id']) &&
    isString(ri['id']) &&
    isNumber(ri.quantity) &&
    isString(ri.unit) &&
    isString(ri.ingredient_id)
  )
}

/**
 * Check if value is a valid Ingredient
 */
export function isIngredient(value: JsonValue): value is Ingredient {
  if (!isRecord(value)) {return false}
  return (
    hasKeys(value, ['id', 'name', 'unit']) &&
    isString(value['id']) &&
    isString(value.name) &&
    isString(value.unit)
  )
}

/**
 * Check if value is a valid Order
 */
export function isOrder(value: JsonValue): value is Order {
  if (!isRecord(value)) {return false}
  return (
    hasKeys(value, ['id', 'order_date', 'total_amount']) &&
    isString(value['id']) &&
    isStringOrNull(value.order_date) &&
    isNumberOrNull(value.total_amount)
  )
}

/**
 * Check if value is a valid Customer
 */
export function isCustomer(value: JsonValue): value is Customer {
  if (!isRecord(value)) {return false}
  return (
    hasKeys(value, ['id', 'name']) &&
    isString(value['id']) &&
    isString(value.name)
  )
}

/**
 * Check if value is a valid OrderStatus
 */
export function isOrderStatus(value: JsonValue): value is OrderStatus {
  return (
    isString(value) &&
    ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'].includes(value)
  )
}

/**
 * Check if value is a valid ProductionStatus
 */
export function isProductionStatus(value: JsonValue): value is ProductionStatus {
  return (
    isString(value) &&
    ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(value)
  )
}

/**
 * Check if value is a valid PaymentStatus
 */
export function isPaymentStatus(value: JsonValue): value is PaymentStatus {
  return (
    isString(value) &&
    ['unpaid', 'partial', 'paid'].includes(value)
  )
}

/**
 * Array validators
 */
export function isRecipeArray(value: unknown): value is Recipe[] {
  return isArrayOf(value, isRecipe)
}

export function isIngredientArray(value: unknown): value is Ingredient[] {
  return isArrayOf(value, isIngredient)
}

/**
 * Assertions
 */
export function assertRecipe(value: JsonValue, message = 'Invalid recipe'): asserts value is Recipe {
  if (!isRecipe(value)) {throw new TypeError(message)}
}

export function assertIngredient(value: JsonValue, message = 'Invalid ingredient'): asserts value is Ingredient {
  if (!isIngredient(value)) {throw new TypeError(message)}
}

export function assertOrder(value: JsonValue, message = 'Invalid order'): asserts value is Order {
  if (!isOrder(value)) {throw new TypeError(message)}
}

/* -------------------------------------------------------------------------- */
/*  📦 EXAMPLE USAGE                                                         */
/* -------------------------------------------------------------------------- */

/**
 * BEFORE (dengan as any):
 * const recipe = (item as any).recipe
 * 
 * AFTER (type-safe):
 * type OrderItemWithRecipe = WithNestedRelation<Row<'order_items'>, 'recipe', 'recipes'>
 * const item = data as OrderItemWithRecipe
 * const recipe = item.recipe // ✅ Type-safe
 * 
 * ---
 * 
 * BEFORE (browser API):
 * const connection = (navigator as any).connection
 * 
 * AFTER:
 * if (hasConnection(navigator)) {
 *   const speed = navigator.connection.effectiveType // ✅ Type-safe
 * }
 * 
 * ---
 * 
 * BEFORE (nested data):
 * const ingredients = (recipe as any).recipe_ingredients
 * 
 * AFTER:
 * type RecipeWithIngredients = WithArrayRelation<'recipes', {
 *   recipe_ingredients: 'recipe_ingredients'
 * }>
 * const recipe = data as RecipeWithIngredients
 * const ingredients = recipe.recipe_ingredients // ✅ Type-safe
 * 
 * ---
 * 
 * BEFORE (type guards):
 * if (typeof data === 'object' && data !== null && 'id' in data)
 * 
 * AFTER:
 * if (isRecipe(data)) {
 *   const name = data.name // ✅ Type-safe
 * }
 */
