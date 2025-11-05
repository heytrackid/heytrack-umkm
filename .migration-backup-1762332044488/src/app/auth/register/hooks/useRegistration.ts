import { useState, useTransition } from 'react'
import { getAuthErrorMessage, validateEmail, validatePassword, validatePasswordMatch } from '@/app/auth/register/utils/validation'
// import { signup } from '@/app/auth/register/actions' // Replaced with API call
import type { FieldErrors, ErrorAction } from '@/app/auth/register/types'

export function useRegistration() {
  const [error, setError] = useState('')
  const [errorAction, setErrorAction] = useState<ErrorAction | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
    void setError('')
    void setErrorAction(null)
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

  const handleSubmit = (formData: FormData) => {
    void setError('')
    void setErrorAction(null)
    void setFieldErrors({})

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Client-side validation
    const errors = validateForm(email, password, confirmPassword)

    if (Object.keys(errors).length > 0) {
      void setFieldErrors(errors)
      return
    }

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
        })

        const data = await response.json()

        if (!response.ok) {
          const authError = getAuthErrorMessage(data.error ?? 'Registration failed')
          void setError(authError.message)
          if (authError.action) {
            void setErrorAction(authError.action)
          }
          return
        }

        void setSuccess(true)
      } catch (_err) {
        void setError('Network error. Please try again.')
      }
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
