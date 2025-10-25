/**
 * Type Helper Utilities
 * Provides runtime type checking and assertion helpers
 */

/**
 * Type-safe property accessor for objects with unknown types
 */
export function getProp<T = any>(obj: any, key: string, defaultValue?: T): T {
  if (obj && typeof obj === 'object' && key in obj) {
    return obj[key] as T
  }
  return defaultValue as T
}

/**
 * Type-safe array mapping with proper type inference
 */
export function mapArray<T, R>(arr: unknown, mapper: (item: T, index: number) => R): R[] {
  if (!Array.isArray(arr)) return []
  return arr.map((item, index) => mapper(item as T, index))
}

/**
 * Type assertion helper for Supabase query results
 */
export function assertType<T>(value: unknown): T {
  return value as T
}

/**
 * Safe number conversion
 */
export function toNumber(value: unknown, defaultValue = 0): number {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

/**
 * Safe string conversion
 */
export function toString(value: unknown, defaultValue = ''): string {
  if (value === null || value === undefined) return defaultValue
  return String(value)
}

/**
 * Safe boolean conversion
 */
export function toBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return defaultValue
}

/**
 * Check if value exists (not null/undefined)
 */
export function exists<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Filter out null/undefined from arrays
 */
export function compact<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter(exists)
}
