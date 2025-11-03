

// Form-related types for type-safe form handling

/**
 * Generic form field update type
 * Ensures type safety when updating form fields
 */
export interface FormFieldUpdate<T> {
  field: keyof T
  value: T[keyof T]
}

/**
 * Type-safe form field updater function
 */
export type FormFieldUpdater<T> = <K extends keyof T>(
  field: K,
  value: T[K]
) => void

/**
 * Order item update for array-based form items
 */
export interface OrderItemUpdate {
  index: number
  field: string
  value: string | number | boolean | null
}

/**
 * Generic array item update
 */
export interface ArrayItemUpdate<T> {
  index: number
  field: keyof T
  value: T[keyof T]
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean
  errors: FormValidationError[]
}

/**
 * Individual field validation error
 */
export interface FormValidationError {
  field: string
  message: string
  value?: unknown
}

/**
 * Form state for complex forms
 */
export interface FormState<T> {
  data: T
  errors: Record<keyof T, string | undefined>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isValid: boolean
}

/**
 * Form actions for reducer pattern
 */
export type FormAction<T> =
  | { type: 'SET_FIELD'; field: keyof T; value: T[keyof T] }
  | { type: 'SET_ERROR'; field: keyof T; error: string }
  | { type: 'SET_TOUCHED'; field: keyof T }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET' }
  | { type: 'SET_DATA'; data: T }
