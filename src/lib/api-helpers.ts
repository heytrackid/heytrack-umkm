/**
 * API Helper Functions
 * Utility functions for safe type conversions in API routes
 */

/**
 * Safely parse amount from unknown value
 */
export function safeParseAmount(value: unknown): number {
  if (typeof value === 'number') {return value}
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/**
 * Safely get string value
 */
export function safeString(value: unknown, defaultValue = ''): string {
  if (typeof value === 'string') {return value}
  if (value === null || value === undefined) {return defaultValue}
  return String(value)
}

/**
 * Safely get number value
 */
export function safeNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number') {return value}
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

/**
 * Safely parse integer from unknown value
 */
export function safeParseInt(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number') {return Math.floor(value)}
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

/**
 * Check if value is valid amount
 */
export function isValidAmount(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Check if string is in array (type-safe)
 */
export function isInArray<T extends string>(
  value: unknown,
  array: readonly T[]
): value is T {
  return typeof value === 'string' && array.includes(value as T)
}

/**
 * Safely get date timestamp
 */
export function safeTimestamp(value: unknown): number {
  if (value instanceof Date) {return value.getTime()}
  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? 0 : date.getTime()
  }
  if (typeof value === 'number') {return value}
  return 0
}
