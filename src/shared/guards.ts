


/**
 * Type Guards
 * Utility functions for runtime type checking
 */

// Simple interface definition
type DataObject = Record<string, unknown>;

// ==========================================================
// PRIMITIVE TYPE GUARDS
// ==========================================================

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

export function isNull(value: unknown): value is null {
  return value === null
}

export function isNullish(value: unknown): value is null | undefined {
  return value === null
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isObject<T extends DataObject = DataObject>(value: unknown): value is T {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// ==========================================================
// BUSINESS TYPE GUARDS
// ==========================================================

export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[8-9][0-9]{7,11}$/
  return phoneRegex.test(phone.replace(/\s|-/g, ''))
}

export function isValidCurrency(amount: number): boolean {
  return typeof amount === 'number' && amount >= 0 && isFinite(amount)
}

export function isValidPercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100
}

// ==========================================================
// ERROR TYPE GUARDS
// ==========================================================

export function isError(value: unknown): value is Error {
  return value instanceof Error
}

export function isApiError(value: unknown): boolean {
  return isObject(value) && 'success' in value && value['success'] === false
}

export function isValidationError(value: unknown): boolean {
  return isObject(value) && 'errors' in value && Array.isArray(value['errors'])
}

// Get error message safely
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message
  }
  if (isString(error)) {
    return error
  }
  if (isObject(error) && 'message' in error && isString(error['message'])) {
    return String(error['message'])
  }
  return 'An unexpected error occurred'
}
