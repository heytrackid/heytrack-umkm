export interface FieldErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

export interface ErrorAction {
  label: string
  href: string
}

export interface PasswordRequirement {
  label: string
  met: boolean
}

export interface RegistrationState {
  password: string
  confirmPassword: string
  showPassword: boolean
  showConfirmPassword: boolean
  error: string
  errorAction: ErrorAction | null
  fieldErrors: FieldErrors
  success: boolean
  isPending: boolean
}
