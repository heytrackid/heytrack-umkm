/**
 * Consolidated Error Handling Module
 * Single source for all error handling including auth errors, API errors, and general error utilities
 */

import { apiLogger } from '@/lib/logger'

// ============================================================================
// GENERAL ERROR HANDLING
// ============================================================================

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

export interface ErrorContext {
  user?: {
    id?: string
    email?: string
    username?: string
  }
  tags?: Record<string, string>
  extra?: Record<string, unknown>
  level?: ErrorSeverity
}

/**
 * Capture and log error to console
 */
export function captureError(
  error: Error | string,
  context?: ErrorContext
): void {
  const errorObj = error instanceof Error ? error : new Error(error)
  const timestamp = new Date().toISOString()

  apiLogger.error({
    message: `[${timestamp}] Error captured:`,
    error: {
      message: errorObj.message,
      stack: errorObj.stack,
      name: errorObj.name,
    },
    context,
    level: context?.level || 'error'
  }, 'Console error replaced with logger')
}

/**
 * Capture message (non-error) to console
 */
export function captureMessage(
  message: string,
  level: ErrorSeverity = 'info',
  context?: ErrorContext
): void {
  const timestamp = new Date().toISOString()

  const logData = {
    message: `[${timestamp}] ${message}`,
    context,
    level
  }

  switch (level) {
    case 'fatal':
    case 'error':
      apiLogger.error(logData, message)
      break
    case 'warning':
      apiLogger.warn(logData, message)
      break
    case 'info':
      apiLogger.info(logData, message)
      break
    case 'debug':
      apiLogger.debug(logData, message)
      break
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown, context?: ErrorContext): {
  message: string
  statusCode: number
  details?: unknown
} {
  captureError(error instanceof Error ? error : String(error), context)

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      details: error.stack
    }
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
    details: error
  }
}

// ============================================================================
// AUTH ERROR HANDLING
// ============================================================================

export interface AuthError {
  message: string
  action?: {
    label: string
    href: string
  }
}

/**
 * Common Supabase authentication error codes and their Indonesian translations
 */
export const AUTH_ERROR_MESSAGES: Record<string, AuthError> = {
  // Login errors
  'Invalid login credentials': {
    message: 'Email atau password salah',
    action: {
      label: 'Lupa password?',
      href: '/auth/reset-password',
    },
  },
  'Email not confirmed': {
    message: 'Silakan konfirmasi email Anda terlebih dahulu',
    action: {
      label: 'Kirim ulang email konfirmasi',
      href: '/auth/resend-confirmation',
    },
  },
  'Invalid email': {
    message: 'Format email tidak valid',
  },
  'Email rate limit exceeded': {
    message: 'Terlalu banyak percobaan. Silakan coba lagi nanti',
  },

  // Registration errors
  'User already registered': {
    message: 'Email sudah terdaftar',
    action: {
      label: 'Login sekarang',
      href: '/auth/login',
    },
  },
  'Password should be at least 6 characters': {
    message: 'Password minimal 6 karakter',
  },

  // Password reset errors
  'User not found': {
    message: 'Email tidak ditemukan',
  },

  // Session errors
  'JWT expired': {
    message: 'Sesi telah berakhir. Silakan login kembali',
    action: {
      label: 'Login kembali',
      href: '/auth/login',
    },
  },
  'Invalid JWT': {
    message: 'Sesi tidak valid. Silakan login kembali',
    action: {
      label: 'Login kembali',
      href: '/auth/login',
    },
  },

  // Generic auth errors
  'signup is disabled': {
    message: 'Pendaftaran akun baru sedang ditutup sementara',
  },
  'Too many requests': {
    message: 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit',
  },
}

/**
 * Handle authentication errors with user-friendly messages
 */
export function handleAuthError(error: any): AuthError {
  const errorMessage = error?.message || String(error)

  // Try to match exact error message
  if (AUTH_ERROR_MESSAGES[errorMessage]) {
    return AUTH_ERROR_MESSAGES[errorMessage]
  }

  // Try to match partial error messages
  for (const [key, value] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (errorMessage.includes(key)) {
      return value
    }
  }

  // Default fallback
  return {
    message: 'Terjadi kesalahan autentikasi. Silakan coba lagi',
  }
}

/**
 * Log authentication errors for monitoring
 */
export function logAuthError(error: any, context?: ErrorContext): void {
  captureError(error instanceof Error ? error : String(error), {
    ...context,
    tags: { ...context?.tags, type: 'auth' },
    level: 'warning'
  })
}

/**
 * Create a standardized auth error object
 */
export function createAuthError(code: string, message: string, action?: AuthError['action']): AuthError {
  return {
    message,
    action
  }
}

// ============================================================================
// DATABASE ERROR HANDLING
// ============================================================================

/**
 * Handle database operation errors
 */
export function handleDatabaseError(error: any): {
  message: string
  statusCode: number
  code?: string
} {
  apiLogger.error({ err: error }, 'Database Error')

  // Handle specific Supabase/Postgres errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique constraint violation
        return {
          message: 'Data sudah ada di sistem',
          statusCode: 409,
          code: error.code
        }
      case '23503': // Foreign key constraint violation
        return {
          message: 'Data yang direferensikan tidak ditemukan',
          statusCode: 400,
          code: error.code
        }
      case '23502': // Not null constraint violation
        return {
          message: 'Field yang wajib diisi belum diisi',
          statusCode: 400,
          code: error.code
        }
      case '42P01': // Table does not exist
        return {
          message: 'Resource tidak ditemukan',
          statusCode: 404,
          code: error.code
        }
      default:
        return {
          message: 'Terjadi kesalahan database',
          statusCode: 500,
          code: error.code
        }
    }
  }

  // Handle Supabase client errors
  if (error.message) {
    if (error.message.includes('JWT')) {
      return {
        message: 'Akses tidak sah',
        statusCode: 401,
        code: 'AUTH_ERROR'
      }
    }
    if (error.message.includes('RLS')) {
      return {
        message: 'Akses ditolak',
        statusCode: 403,
        code: 'PERMISSION_ERROR'
      }
    }
  }

  return {
    message: 'Terjadi kesalahan internal server',
    statusCode: 500,
    code: 'UNKNOWN_ERROR'
  }
}
