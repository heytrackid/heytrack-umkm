import { useState, useTransition } from 'react'
import { getAuthErrorMessage, validateEmail, validatePassword, validatePasswordMatch } from '@/app/auth/register/utils/validation'
import { signup } from '@/app/auth/register/actions'
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

  const handleSubmit = async (formData: FormData) => {
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
      const result = await signup(formData)
      if (result?.error) {
        const authError = getAuthErrorMessage(result.error)
        void setError(authError.message)
        if (authError.action) {
          void setErrorAction(authError.action)
        }
      } else if (result?.success) {
        void setSuccess(true)
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
