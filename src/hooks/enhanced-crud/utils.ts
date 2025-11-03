import { apiLogger } from '@/lib/logger'
import { errorToast } from '@/hooks/use-toast'

/**
 * Enhanced CRUD Utilities
 * Helper functions for CRUD operations and error handling
 */


/**
 * Get operation label for user-friendly messages
 */
export const getOperationLabel = (operation: 'create' | 'update' | 'delete'): string => {
  const labels = {
    create: 'membuat',
    update: 'mengupdate',
    delete: 'menghapus'
  }
  return labels[operation]
}

/**
 * Handle CRUD errors with logging and toast notifications
 */
export const handleCRUDError = (
  error: Error,
  operation: 'create' | 'update' | 'delete',
  showErrorToast = true,
  customErrorHandler?: (error: Error, operation: 'create' | 'update' | 'delete') => void
): void => {
  const errorMessage = error.message || 'Terjadi kesalahan tak terduga'

  if (customErrorHandler) {
    customErrorHandler(error, operation)
  } else if (showErrorToast) {
    errorToast(
      `Gagal ${getOperationLabel(operation)} data`,
      errorMessage
    )
  }

  apiLogger.error({ message: `CRUD ${operation} error`, error }, 'Console error replaced with logger')
}

/**
 * Validate CRUD operation inputs
 */
export const validateCRUDInputs = (
  operation: 'create' | 'update' | 'delete',
  data?: unknown,
  id?: string
): void => {
  if (operation === 'create' || operation === 'update') {
    if (!data || typeof data !== 'object') {
      throw new Error('Data tidak valid')
    }
  }

  if ((operation === 'update' || operation === 'delete') && !id) {
    throw new Error('ID tidak boleh kosong')
  }
}

/**
 * Validate bulk operation inputs
 */
export const validateBulkInputs = (
  operation: 'create' | 'update' | 'delete',
  data: Array<Record<string, unknown>>
): void => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data tidak valid atau kosong')
  }

  if (operation === 'update') {
    data.forEach((item, index) => {
      if (typeof item.id !== 'string' || item.id.length === 0 || !('data' in item)) {
        throw new Error(`Item ${index + 1}: ID dan data diperlukan`)
      }
    })
  }
}
