// Simple validation functions for registration
export function validateEmail(email: string): string | null {
  if (!email) return 'Email wajib diisi'
  if (!email.includes('@')) return 'Format email tidak valid'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password wajib diisi'
  if (password.length < 8) return 'Password minimal 8 karakter'
  return null
}

export function validatePasswordMatch(password: string, confirmPassword: string): string | null {
  if (password !== confirmPassword) return 'Password konfirmasi tidak cocok'
  return null
}

export function getAuthErrorMessage(error: string) {
  return {
    message: error,
    action: null
  }
}
