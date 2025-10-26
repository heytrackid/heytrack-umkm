'use client'

import { useCallback, useState } from 'react'
import { errorToast, infoToast, successToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import type { AsyncOperationOptions } from './types'

/**
 * Utility hook for handling async operations with toast feedback
 */
export function useAsyncOperation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<T | null> => {
    const {
      loadingMessage,
      successMessage = 'Operasi berhasil!',
      errorMessage,
      showToasts = true
    } = options

    setLoading(true)
    setError(null)

    if (showToasts && loadingMessage) {
      infoToast(loadingMessage)
    }

    try {
      const result = await operation()

      if (showToasts && successMessage) {
        successToast(successMessage)
      }

      return result
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga'
      setError(errorMsg)

      if (showToasts) {
        errorToast(
          'Terjadi Kesalahan',
          errorMessage || errorMsg
        )
      }

      apiLogger.error({ error: error }, 'Async operation error:')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { execute, loading, error, clearError }
}
