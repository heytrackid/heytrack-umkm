/**
 * Safe Casting Utilities
 * 
 * Use these instead of 'as any' type assertions.
 * These provide runtime safety checks.
 */

import { getErrorMessage, isObject, isString, isNumber, isArray } from './type-guards'

import { apiLogger } from '@/lib/logger'
// Safe cast with validator
export function safeCast<T>(
  value: any,
  validator: (v: any) => v is T,
  fallback?: T
): T {
  if (validator(value)) {
    return value
  }
  if (fallback !== undefined) {
    return fallback
  }
  throw new TypeError(`Failed to cast value to expected type`)
}

// Cast to string
export function castToString(value: any, fallback = ''): string {
  if (isString(value)) {
    return value
  }
  if (value === null || value === undefined) {
    return fallback
  }
  if (isNumber(value)) {
    return String(value)
  }
  if (isObject(value)) {
    try {
      return JSON.stringify(value)
    } catch {
      return fallback
    }
  }
  return String(value)
}

// Cast to number
export function castToNumber(value: any, fallback = 0): number {
  if (isNumber(value)) {
    return value
  }
  if (isString(value)) {
    const num = parseFloat(value)
    return isNaN(num) ? fallback : num
  }
  if (isBoolean(value)) {
    return value ? 1 : 0
  }
  return fallback
}

// Cast to boolean
export function castToBoolean(value: any, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  if (isString(value)) {
    return value.toLowerCase() === 'true' || value === '1'
  }
  if (isNumber(value)) {
    return value !== 0
  }
  if (value === null || value === undefined) {
    return fallback
  }
  return Boolean(value)
}

// Cast to array
export function castToArray<T = unknown>(
  value: any,
  fallback: T[] = []
): T[] {
  if (isArray(value)) {
    return value as T[]
  }
  if (value === null || value === undefined) {
    return fallback
  }
  return [value as T]
}

// Cast to object
export function castToObject(
  value: any,
  fallback: Record<string, unknown> = {}
): Record<string, unknown> {
  if (isObject(value)) {
    return value
  }
  return fallback
}

// Cast with deep property access (replaces (obj as any).prop.nested)
export function getNestedProperty<T = unknown>(
  obj: any,
  path: string,
  fallback?: T
): T | undefined {
  if (!isObject(obj)) {
    return fallback
  }

  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return fallback
    }
    current = current[key]
  }

  return current ?? fallback
}

// Safe property access
export function getProperty<T = unknown>(
  obj: any,
  key: string,
  fallback?: T
): T | undefined {
  if (!isObject(obj)) {
    return fallback
  }
  const value = (obj as Record<string, unknown>)[key]
  return value ?? fallback
}

// Set nested property safely
export function setNestedProperty(
  obj: Record<string, unknown>,
  path: string,
  value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()

  if (!lastKey) {
    return
  }

  let current = obj
  for (const key of keys) {
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {}
    }
    current = current[key]
  }

  current[lastKey] = value
}

// Type-safe array operations
export function safeMap<T, R>(
  arr: any,
  mapper: (item: T, index: number) => R,
  fallback: R[] = []
): R[] {
  if (!isArray(arr)) {
    return fallback
  }
  try {
    return (arr as T[]).map(mapper)
  } catch {
    return fallback
  }
}

export function safeFilter<T>(
  arr: any,
  predicate: (item: T, index: number) => boolean,
  fallback: T[] = []
): T[] {
  if (!isArray(arr)) {
    return fallback
  }
  try {
    return (arr as T[]).filter(predicate)
  } catch {
    return fallback
  }
}

export function safeReduce<T, R>(
  arr: any,
  reducer: (acc: R, item: T, index: number) => R,
  initial: R,
  fallback: R = initial
): R {
  if (!isArray(arr)) {
    return fallback
  }
  try {
    return (arr as T[]).reduce(reducer, initial)
  } catch {
    return fallback
  }
}

// JSON parsing
export function safeParseJSON<T = unknown>(
  json: string,
  fallback?: T
): T | undefined {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Failed to parse JSON:')
    return fallback
  }
}

export function safeStringifyJSON(value: any, fallback = '{}'): string {
  try {
    return JSON.stringify(value)
  } catch (error) {
    apiLogger.error({ error: getErrorMessage(error) }, 'Failed to stringify JSON:')
    return fallback
  }
}

// API response casting
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    error: null,
  }
}

export function createErrorResponse<T>(error: any): ApiResponse<T> {
  const err = error instanceof Error ? error : new Error(String(error))
  return {
    data: null,
    error: err,
  }
}

// Supabase query result casting
export interface SupabaseResult<T> {
  data: T | null
  error: { message: string; code?: string } | null
}

export function castSupabaseResult<T>(
  result: any,
  validator?: (v: any) => v is T
): SupabaseResult<T> {
  if (!isObject(result)) {
    return {
      data: null,
      error: { message: 'Invalid result format' },
    }
  }

  const data = result.data
  const error = result.error

  if (error) {
    return {
      data: null,
      error: isObject(error)
        ? {
            message: castToString(error.message, 'Unknown error'),
            code: getProperty(error, 'code', undefined) as string | undefined,
          }
        : { message: String(error) },
    }
  }

  if (validator && data !== null && !validator(data)) {
    return {
      data: null,
      error: { message: 'Data validation failed' },
    }
  }

  return {
    data: data as T,
    error: null,
  }
}

// Function return type casting
export function castFunctionReturn<T>(
  fn: () => unknown,
  validator: (v: any) => v is T,
  fallback?: T
): T {
  try {
    const result = fn()
    if (validator(result)) {
      return result
    }
    if (fallback !== undefined) {
      return fallback
    }
    throw new TypeError('Function return value validation failed')
  } catch (error) {
    if (fallback !== undefined) {
      return fallback
    }
    throw error
  }
}

// Async version
export async function castAsyncFunctionReturn<T>(
  fn: () => Promise<unknown>,
  validator: (v: any) => v is T,
  fallback?: T
): Promise<T> {
  try {
    const result = await fn()
    if (validator(result)) {
      return result
    }
    if (fallback !== undefined) {
      return fallback
    }
    throw new TypeError('Async function return value validation failed')
  } catch (error) {
    if (fallback !== undefined) {
      return fallback
    }
    throw error
  }
}

// Utility for checking if value is boolean (needed by castToBoolean)
function isBoolean(value: any): boolean {
  return typeof value === 'boolean'
}

// Export all utilities
export const safeCasting = {
  safeCast,
  castToString,
  castToNumber,
  castToBoolean,
  castToArray,
  castToObject,
  getNestedProperty,
  getProperty,
  setNestedProperty,
  safeMap,
  safeFilter,
  safeReduce,
  safeParseJSON,
  safeStringifyJSON,
  createSuccessResponse,
  createErrorResponse,
  castSupabaseResult,
  castFunctionReturn,
  castAsyncFunctionReturn,
} as const
