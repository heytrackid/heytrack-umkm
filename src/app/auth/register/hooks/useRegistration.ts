import { useState, useTransition } from 'react'
import { getAuthErrorMessage, validateEmail, validatePassword, validatePasswordMatch } from '../utils/validation'
import { signup } from '../actions'
import type { FieldErrors, ErrorAction } from '../types'

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

  const handleSubmit = async (formData: FormData) => {
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
      return
    }

    startTransition(async () => {
      const result = await signup(formData)
      if (result?.error) {
        const authError = getAuthErrorMessage(result.error)
        setError(authError.message)
        if (authError.action) {
          setErrorAction(authError.action)
        }
      } else if (result?.success) {
        setSuccess(true)
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
