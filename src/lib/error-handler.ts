/**
 * Error Handler Utility
 * Centralized error handling and logging
 */

import { apiLogger } from './logger'

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, unknown>
}

/**
 * Capture and log errors
 */
export function captureError(
  error: Error | unknown,
  context?: ErrorContext
): void {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const errorStack = error instanceof Error ? error.stack : undefined

  apiLogger.error({
    error: errorMessage,
    stack: errorStack,
    ...context
  }, 'Error captured')

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { contexts: context })
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: Error | unknown): string {
  if (error instanceof Error) {
    // Map common errors to user-friendly messages
    if (error.message.includes('fetch')) {
      return 'Gagal terhubung ke server. Periksa koneksi internet Anda.'
    }
    if (error.message.includes('timeout')) {
      return 'Permintaan memakan waktu terlalu lama. Silakan coba lagi.'
    }
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return 'Sesi Anda telah berakhir. Silakan login kembali.'
    }
    if (error.message.includes('forbidden') || error.message.includes('403')) {
      return 'Anda tidak memiliki akses untuk melakukan tindakan ini.'
    }
    if (error.message.includes('not found') || error.message.includes('404')) {
      return 'Data yang Anda cari tidak ditemukan.'
    }
    
    return error.message
  }

  return 'Terjadi kesalahan yang tidak diketahui.'
}
