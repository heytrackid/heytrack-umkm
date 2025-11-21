'use client'

import { useCallback, useState } from 'react'

import { errorToast, infoToast, successToast } from '@/lib/toast'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')
import type { AsyncOperationOptions } from '@/hooks/enhanced-crud/types'

interface UseAsyncOperationReturn {
  execute: <T>(operation: () => Promise<T>, options?: AsyncOperationOptions) => Promise<T | null>
  loading: boolean
  error: string | null
  clearError: () => void
}

/**
 * Utility hook for handling async operations with toast feedback
 */
export function useAsyncOperation(): UseAsyncOperationReturn {
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga'
      setError(errorMsg)

      if (showToasts) {
        errorToast(
          'Terjadi Kesalahan',
          errorMessage ?? errorMsg
        )
      }

      logger.error({ error }, 'Async operation error:')
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
