import { useState, useTransition } from 'react'

import type { ErrorAction, FieldErrors } from '@/app/auth/register/types/index'
import { getAuthErrorMessage, validateEmail, validatePassword, validatePasswordMatch } from '@/app/auth/register/utils/validation'

// import { signup } from '@/app/auth/register/actions' // Replaced with API call

export function useRegistration(): {
  error: string
  errorAction: ErrorAction | null
  fieldErrors: FieldErrors
  success: boolean
  isPending: boolean
  clearFieldError: (field: keyof FieldErrors) => void
  handleSubmit: (formData: FormData) => Promise<boolean>
} {
  const [error, setError] = useState('')
  const [errorAction, setErrorAction] = useState<ErrorAction | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const clearFieldError = (field: keyof FieldErrors): void => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
    setError('')
    setErrorAction(null)
  }

  const validateForm = (email: string, password: string, confirmPassword: string): FieldErrors => {
    const errors: FieldErrors = {}

    const emailError = validateEmail(email)
    if (emailError) {
      errors.email = emailError
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      errors.password = passwordError
    }

    const passwordMatchError = validatePasswordMatch(password, confirmPassword)
    if (passwordMatchError) {
      errors.confirmPassword = passwordMatchError
    }

    return errors
  }

  const handleSubmit = async (formData: FormData): Promise<boolean> => {
    setError('')
    setErrorAction(null)
    setFieldErrors({})

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Client-side validation
    const errors = validateForm(email, password, confirmPassword)

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return false
    }

    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              fullName: email.split('@')[0], // Use email prefix as name
            }),
            credentials: 'include', // Include cookies for authentication
          })

          const data = await response.json() as unknown

          if (!response.ok) {
            const authError = getAuthErrorMessage((data as { error?: string }).error ?? 'Registration failed')
            setError(authError.message)
            if (authError.action) {
              setErrorAction(authError.action)
            }
            resolve(false)
            return
          }

          setSuccess(true)
          resolve(true)
         } catch {
          setError('Network error. Please try again.')
          resolve(false)
        }
      })
    })
  }

  return {
    error,
    errorAction,
    fieldErrors,
    success,
    isPending,
    clearFieldError,
    handleSubmit
  }
}
