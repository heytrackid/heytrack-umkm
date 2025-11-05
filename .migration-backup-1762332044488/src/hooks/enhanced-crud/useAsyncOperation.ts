'use client'

import { useCallback, useState } from 'react'
import { errorToast, infoToast, successToast } from '@/hooks/use-toast'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')
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

    void setLoading(true)
    void setError(null)

    if (showToasts && loadingMessage) {
      infoToast(loadingMessage)
    }

    try {
      const result = await operation()

      if (showToasts && successMessage) {
        successToast(successMessage)
      }

      return result
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga'
      void setError(errorMsg)

      if (showToasts) {
        errorToast(
          'Terjadi Kesalahan',
          errorMessage ?? errorMsg
        )
      }

      logger.error({ error: err }, 'Async operation error:')
      return null
    } finally {
      void setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    void setError(null)
  }, [])

  return { execute, loading, error, clearError }
}
