import { useState, useCallback } from 'react'

interface UseFormStateOptions<T> {
  initialValues: T
  onSubmit: (values: T) => Promise<void> | void
  onSuccess?: (data?: any) => void
  onError?: (error: Error) => void
}

interface FormErrors<T> {
  [K in keyof T]?: string
}

/**
 * useFormState - Centralized form state management hook
 * Handles loading, errors, and form submission
 */
export function useFormState<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  onSuccess,
  onError,
}: UseFormStateOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }))
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors]
  )

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }, [])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) {
        e.preventDefault()
      }

      setIsLoading(true)
      setSubmitError(null)

      try {
        await onSubmit(values)
        onSuccess?.()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred'
        setSubmitError(errorMessage)
        onError?.(error instanceof Error ? error : new Error(errorMessage))
      } finally {
        setIsLoading(false)
      }
    },
    [values, onSubmit, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setSubmitError(null)
  }, [initialValues])

  const setFieldErrors = useCallback((newErrors: FormErrors<T>) => {
    setErrors(newErrors)
  }, [])

  return {
    values,
    errors,
    isLoading,
    submitError,
    setFieldValue,
    setFieldError,
    setFieldErrors,
    handleSubmit,
    reset,
  }
}

/**
 * useFormField - Hook for individual field management
 */
export function useFormField<T>(
  value: T,
  onChange: (value: T) => void,
  error?: string
) {
  const handleChange = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const nextValue = typeof newValue === 'function' ? (newValue as Function)(value) : newValue
      onChange(nextValue)
    },
    [value, onChange]
  )

  return {
    value,
    onChange: handleChange,
    error,
    hasError: !!error,
  }
}
