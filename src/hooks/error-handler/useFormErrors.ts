'use client'

import { useCallback, useState } from 'react'

/**
 * Hook untuk handle form validation errors per field
 * Ideal untuk forms dengan multiple fields dan individual error messages
 *
 * @returns {Object} Form error management
 * @returns {Record<string, string>} fieldErrors - Map of field errors
 * @returns {Function} setFieldError - Set error for specific field
 * @returns {Function} clearFieldError - Clear error for specific field
 * @returns {Function} clearAllErrors - Clear all errors
 * @returns {boolean} hasErrors - Whether there are any errors
 *
 * @example
 * const { fieldErrors, setFieldError, hasErrors } = useFormErrors()
 *
 * if (!email) setFieldError('email', 'Email is required')
 * if (password.length < 8) setFieldError('password', 'Min 8 chars')
 *
 * return (
 *   <>
 *     <input onChange={() => clearFieldError('email')} />
 *     {fieldErrors.email && <span>{fieldErrors.email}</span>}
 *     <button disabled={hasErrors}>Submit</button>
 *   </>
 * )
 */
export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: message,
    }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    void setFieldErrors({})
  }, [])

  const hasErrors = Object.keys(fieldErrors).length > 0

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors,
  }
}
