import { z } from 'zod'

import { authLogger } from '@/lib/logger'

/**
 * Authentication Error Handling Utilities
 * Provides user-friendly error messages and validation for auth operations
 */


// ==========================================================
// AUTH ERROR MESSAGES
// ==========================================================

export const AUTH_ERROR_MESSAGES = {
  // Sign up errors
  'User already registered': 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
  'Signup disabled': 'Pendaftaran akun baru sedang dinonaktifkan.',

   // Sign in errors
   'Invalid login credentials': 'Email atau password salah. Silakan coba lagi.',
   'Invalid credentials': 'Email atau password salah. Silakan coba lagi.',
  'email_not_confirmed': 'Email belum dikonfirmasi. Silakan periksa inbox Anda untuk email konfirmasi.',
  'invalid_email': 'Format email tidak valid.',
  'email_rate_limit_exceeded': 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
  'invalid_otp': 'Kode verifikasi tidak valid. Silakan coba lagi.',
  'session_expired': 'Sesi Anda telah berakhir. Silakan login kembali.',
  'session_not_found': 'Sesi tidak ditemukan. Silakan login kembali.',
  'user_banned': 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.',
  'too_many_requests': 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
  'email_locked': 'Akun Anda sedang dikunci karena aktivitas mencurigakan. Silakan coba beberapa saat lagi.',
  
  // Network and connection errors
  'Connection timeout': 'Waktu koneksi habis. Silakan coba lagi.',
  'Request timeout': 'Permintaan habis waktu. Silakan coba lagi.',
  'Network connection lost': 'Koneksi jaringan terputus. Silakan coba lagi.',

  // More specific Supabase errors
  'Auth session missing': 'Sesi otentikasi tidak ditemukan. Silakan login kembali.',
  'Auth session invalid': 'Sesi otentikasi tidak valid. Silakan login kembali.',
  'Auth api error': 'Terjadi kesalahan pada API otentikasi.',
  'Auth unknown error': 'Terjadi kesalahan otentikasi yang tidak dikenal.',
  'User not found': 'Akun dengan email tersebut tidak ditemukan.',
  'User not authorized': 'Pengguna tidak diotorisasi.',
  'Invalid session': 'Sesi tidak valid. Silakan login kembali.',
  'Verification required': 'Verifikasi diperlukan. Silakan verifikasi akun Anda.',
  'Phone not confirmed': 'Nomor telepon belum dikonfirmasi.',
  'Email not verified': 'Email belum diverifikasi. Silakan cek email Anda.',
  'Account deleted': 'Akun telah dihapus.',
  'Account disabled': 'Akun telah dinonaktifkan.',
  'Invalid password': 'Password tidak valid.',

  // Password reset errors
  'user_not_found': 'Akun dengan email tersebut tidak ditemukan.',

   // Session errors
   'jwt_expired': 'Sesi telah berakhir. Silakan login kembali.',
   'refresh_token_not_found': 'Token refresh tidak ditemukan.',
   'invalid_refresh_token': 'Token refresh tidak valid.',

  // Generic auth errors
  'weak_password': 'Password terlalu lemah. Gunakan minimal 6 karakter dengan kombinasi huruf besar, kecil, dan angka.',

  // Network/server errors
  'Network request failed': 'Koneksi jaringan gagal. Silakan coba lagi.',
  'Server error': 'Terjadi kesalahan server. Silakan coba lagi nanti.',
  'Internal server error': 'Terjadi kesalahan internal. Silakan coba lagi nanti.',


} as const

// ==========================================================
// AUTH ERROR MESSAGE GETTER
// ==========================================================

/**
 * Extract error message from error object
 */
function extractErrorMessage(error: Error | string | { message?: string }): string {
  if (typeof error === 'string') {
    return error
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Terjadi kesalahan autentikasi'
}

/**
 * Get user-friendly error message for authentication errors
 */
export function getAuthErrorMessage(error: Error | string | { message?: string }): string {
  const errorMessage = extractErrorMessage(error)

  // Check for exact matches in our error messages
  if (errorMessage in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[errorMessage as keyof typeof AUTH_ERROR_MESSAGES]
  }

  // Check for partial matches
  for (const [key, message] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return message
    }
  }

  // Additional specific checks for common patterns that might be missed
  if (errorMessage.toLowerCase().includes('invalid identifier or password')) {
    return 'Email atau password salah. Silakan coba lagi.'
  }
  if (errorMessage.toLowerCase().includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Silakan periksa inbox Anda untuk email konfirmasi.'
  }
  if (errorMessage.toLowerCase().includes('rate limit exceeded')) {
    return 'Terlalu banyak percobaan login. Silakan coba lagi nanti.'
  }
  if (errorMessage.toLowerCase().includes('network')) {
    return 'Koneksi jaringan gagal. Silakan periksa koneksi internet Anda.'
  }
  if (errorMessage.toLowerCase().includes('user not found')) {
    return 'Akun dengan email tersebut tidak ditemukan.'
  }
  if (errorMessage.toLowerCase().includes('invalid session')) {
    return 'Sesi tidak valid. Silakan login kembali.'
  }
  if (errorMessage.toLowerCase().includes('jwt')) {
    return 'Terjadi kesalahan pada sesi otentikasi. Silakan login kembali.'
  }

  // Log the unknown error for debugging
  let originalError = 'Unknown auth error'
  if (typeof error === 'string') {
    originalError = error
  } else if (error && typeof error === 'object' && 'message' in error) {
    originalError = (error as { message?: string }).message ?? 'Unknown auth error'
  }

  authLogger.warn({
    originalError,
    errorType: typeof error
  }, 'Unknown authentication error received')
  
  // Fallback for unknown errors
  return 'Terjadi kesalahan. Silakan coba lagi.'
}

// ==========================================================
// EMAIL VALIDATION
// ==========================================================

/**
 * Email validation schema using Zod
 */
export const EmailSchema = z
  .string()
  .min(1, 'Email wajib diisi')
  .email('Format email tidak valid')
  .max(255, 'Email terlalu panjang')

/**
 * Validate email address
 */
export function validateEmail(email: string): {
  isValid: boolean
  error?: string
} {
  try {
    EmailSchema.parse(email)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.issues[0]?.message || 'Email tidak valid'
      }
    }
    return {
      isValid: false,
      error: 'Email tidak valid'
    }
  }
}

// ==========================================================
// PASSWORD VALIDATION
// ==========================================================

/**
 * Password validation schema
 */
export const PasswordSchema = z
  .string()
  .min(6, 'Password minimal 6 karakter')
  .max(128, 'Password terlalu panjang')

/**
 * Validate password
 */
export function validatePassword(password: string): {
  isValid: boolean
  error?: string
  strength?: 'medium' | 'strong' | 'weak'
} {
  try {
    PasswordSchema.parse(password)

    // Check password strength
    let strength: 'medium' | 'strong' | 'weak' = 'weak'
    if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)) {
      strength = 'strong'
    } else if (password.length >= 6 && (/[A-Z]/.test(password) || /[a-z]/.test(password) || /\d/.test(password))) {
      strength = 'medium'
    }

    return { isValid: true, strength }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.issues[0]?.message || 'Password tidak valid'
      }
    }
    return {
      isValid: false,
      error: 'Password tidak valid'
    }
  }
}

// ==========================================================
// AUTH FORM VALIDATION
// ==========================================================

/**
 * Login form validation schema
 */
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password wajib diisi'),
})

/**
 * Register form validation schema
 */
export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password konfirmasi tidak cocok',
  path: ['confirmPassword'],
})

/**
 * Password reset form validation schema
 */
export const PasswordResetSchema = z.object({
  email: EmailSchema,
})

/**
 * Update password form validation schema
 */
export const UpdatePasswordSchema = z.object({
  password: PasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password konfirmasi tidak cocok',
  path: ['confirmPassword'],
})

// ==========================================================
// UTILITY FUNCTIONS
// ==========================================================

/**
 * Extract error message from various error formats
 */
export function extractAuthError(error: unknown): string {
  if (typeof error === 'string') {return error}
  if (error instanceof Error) {return error.message}
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return 'Terjadi kesalahan tidak dikenal'
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: unknown): boolean {
  const message = extractAuthError(error).toLowerCase()
  return message.includes('auth') ||
         message.includes('login') ||
         message.includes('password') ||
         message.includes('email') ||
         message.includes('credential') ||
         message.includes('refresh_token') ||
         message.includes('jwt')
}

/**
 * Check if error requires session clearing (refresh token issues)
 */
export function requiresSessionClear(error: unknown): boolean {
  const message = extractAuthError(error).toLowerCase()
  return message.includes('refresh_token_not_found') ||
         message.includes('invalid refresh token') ||
         message.includes('jwt expired') ||
         message.includes('session not found')
}

/**
 * Handle authentication errors with appropriate actions
 */
export function handleAuthError(error: unknown): {
  message: string
  shouldClearSession: boolean
  shouldRedirect: boolean
} {
  const errorString = extractAuthError(error)
  const message = getAuthErrorMessage(errorString)
  const shouldClearSession = requiresSessionClear(errorString)

  return {
    message,
    shouldClearSession,
    shouldRedirect: shouldClearSession
  }
}