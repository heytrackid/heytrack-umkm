/**
 * Type Guards and Error Utilities
 * Re-exports from shared utilities for backward compatibility
 */

// Re-export type guards and error utilities from shared
export {
  // Type guards
  isString,
  isNumber,
  isBoolean,
  isNull,
  isUndefined,
  isNullish,
  isArray,
  isObject,
  isFunction,
  isDate,
  isValidEmail,
  isValidPhone,
  isValidCurrency,
  isValidPercentage,
  isError,
  isApiError,
  isValidationError,

  // Error handling
  getErrorMessage
} from '@/shared'
