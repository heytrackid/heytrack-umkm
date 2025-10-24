/**
 * Type Guard Utilities
 * 
 * Use these helpers to safely check and narrow types
 * instead of using 'as any' or type assertions.
 */

// Primitive type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isNull(value: unknown): value is null {
  return value === null
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

// Object type guards
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isArrayOf<T>(
  value: unknown,
  check: (v: unknown) => v is T
): value is T[] {
  return Array.isArray(value) && value.every(check)
}

// Object property checks
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj
}

export function hasProperties<T extends object, K extends PropertyKey>(
  obj: T,
  keys: K[]
): obj is T & Record<K, unknown> {
  return keys.every(key => key in obj)
}

// Error handling
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

export function isErrorWithMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  )
}

export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message
  }
  if (isString(error)) {
    return error
  }
  return 'Unknown error occurred'
}

// Generic type assertion helper
export function assertType<T>(
  value: unknown,
  check: (v: unknown) => v is T,
  message?: string
): T {
  if (!check(value)) {
    throw new TypeError(message || `Type assertion failed for value: ${JSON.stringify(value)}`)
  }
  return value
}

// Record/Object with unknown values
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isRecordOf<T>(
  value: unknown,
  check: (v: unknown) => v is T
): value is Record<string, T> {
  if (!isRecord(value)) {
    return false
  }
  return Object.values(value).every(check)
}

// API Response helpers
export function isSuccessResponse<T>(
  value: unknown,
  check?: (v: unknown) => v is T
): value is { data: T; error: null } {
  if (!isObject(value)) return false
  if (!('data' in value) || !('error' in value)) return false
  if (value.error !== null) return false
  if (check) return check(value.data)
  return true
}

export function isErrorResponse(
  value: unknown
): value is { data: null; error: Error | string } {
  if (!isObject(value)) return false
  if (!('data' in value) || !('error' in value)) return false
  if (value.data !== null) return false
  return isError(value.error) || isString(value.error)
}

// Union type helper
export function isOneOf<T>(
  value: unknown,
  checks: Array<(v: unknown) => v is T>
): value is T {
  return checks.some(check => check(value))
}

// Date helpers
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

export function isISODateString(value: unknown): value is string {
  if (!isString(value)) return false
  try {
    const date = new Date(value)
    return date.toISOString() === value
  } catch {
    return false
  }
}

// Database type guards
export function isValidUUID(value: unknown): value is string {
  if (!isString(value)) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

// Supabase specific helpers
export interface SupabaseError {
  message: string
  code?: string
  details?: string
}

export function isSupabaseError(value: unknown): value is SupabaseError {
  return (
    isObject(value) &&
    isString(value.message) &&
    (isUndefined(value.code) || isString(value.code)) &&
    (isUndefined(value.details) || isString(value.details))
  )
}

// JSON type guard
export function isJSON(value: string): boolean {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

export function parseJSON<T>(
  value: string,
  check?: (v: unknown) => v is T
): T | null {
  try {
    const parsed = JSON.parse(value)
    if (check && !check(parsed)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

// Enum helpers
export function isEnumValue<T extends Record<string, string | number>>(
  value: unknown,
  enumObj: T
): value is T[keyof T] {
  return Object.values(enumObj).includes(value as any)
}

// Narrowing helpers for Promises
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return (
    isObject(value) &&
    typeof value.then === 'function' &&
    typeof value.catch === 'function'
  )
}

// Make sure all functions are properly typed
export const typeGuards = {
  isString,
  isNumber,
  isBoolean,
  isNull,
  isUndefined,
  isNullish,
  isDefined,
  isObject,
  isArray,
  isArrayOf,
  hasProperty,
  hasProperties,
  isError,
  isErrorWithMessage,
  getErrorMessage,
  assertType,
  isRecord,
  isRecordOf,
  isSuccessResponse,
  isErrorResponse,
  isOneOf,
  isDate,
  isISODateString,
  isValidUUID,
  isValidEmail,
  isSupabaseError,
  isJSON,
  parseJSON,
  isEnumValue,
  isPromise,
} as const
