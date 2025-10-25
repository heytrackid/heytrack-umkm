import { errorToast, infoToast, successToast } from '@/hooks/use-toast';
import { createSupabaseClient } from '@/lib/supabase';
import { Database } from '@/types';
import { useCallback, useState } from 'react';

import { apiLogger } from '@/lib/logger'
type Tables = Database['public']['Tables']

interface EnhancedCRUDOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessages?: {
    create?: string
    update?: string
    delete?: string
  }
  customErrorHandler?: (error: Error, operation: 'create' | 'update' | 'delete') => void
}

export function useEnhancedCRUD<T extends keyof Tables>(
  table: T,
  options: EnhancedCRUDOptions = {}
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessages = {},
    customErrorHandler
  } = options

  const handleError = useCallback((error: Error, operation: 'create' | 'update' | 'delete') => {
    const errorMessage = error.message || 'Terjadi kesalahan tak terduga'
    setError(errorMessage)

    if (customErrorHandler) {
      customErrorHandler(error, operation)
    } else if (showErrorToast) {
      const operationLabels = {
        create: 'membuat',
        update: 'mengupdate',
        delete: 'menghapus'
      }

      errorToast(
        `Gagal ${operationLabels[operation]} data`,
        errorMessage
      )
    }

    apiLogger.error({ message: `CRUD ${operation} error`, error }, 'Console error replaced with logger')
  }, [customErrorHandler, showErrorToast])

  const handleSuccess = useCallback((operation: 'create' | 'update' | 'delete') => {
    setError(null)

    if (showSuccessToast) {
      const defaultMessages = {
        create: 'Data berhasil ditambahkan',
        update: 'Data berhasil diperbarui',
        delete: 'Data berhasil dihapus'
      }

      const message = successMessages[operation] || defaultMessages[operation]
      successToast(message)
    }
  }, [showSuccessToast, successMessages])

  const createRecord = useCallback(async (data: Tables[T]['Insert']) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()

      // Validate data if needed
      if (!data || typeof data !== 'object') {
        throw new Error('Data tidak valid')
      }

      const { data: result, error } = await supabase
        .from(table as any)
        .insert(data as any)
        .select('*')
        .single()

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      handleSuccess('create')
      return result
    } catch (error: unknown) {
      handleError(error as Error, 'create')
      throw error
    } finally {
      setLoading(false)
    }
  }, [table, handleError, handleSuccess])

  const updateRecord = useCallback(async (id: string, data: Tables[T]['Update']) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()

      // Validate inputs
      if (!id) {
        throw new Error('ID tidak boleh kosong')
      }
      if (!data || typeof data !== 'object') {
        throw new Error('Data tidak valid')
      }

      const { data: result, error } = await supabase
        .from(table as any)
        .update(data as any)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      if (!result) {
        throw new Error('Data tidak ditemukan')
      }

      handleSuccess('update')
      return result
    } catch (error: unknown) {
      handleError(error as Error, 'update')
      throw error
    } finally {
      setLoading(false)
    }
  }, [table, handleError, handleSuccess])

  const deleteRecord = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()

      if (!id) {
        throw new Error('ID tidak boleh kosong')
      }

      // Check if record exists first
      const { data: existingRecord, error: fetchError } = await supabase
        .from(table as any)
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !existingRecord) {
        throw new Error('Data tidak ditemukan')
      }

      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      handleSuccess('delete')
      return true
    } catch (error: unknown) {
      handleError(error as Error, 'delete')
      throw error
    } finally {
      setLoading(false)
    }
  }, [table, handleError, handleSuccess])

  const bulkCreate = useCallback(async (records: Tables[T]['Insert'][]) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()

      if (!Array.isArray(records) || records.length === 0) {
        throw new Error('Data tidak valid atau kosong')
      }

      const { data: result, error } = await supabase
        .from(table as any)
        .insert(records as any)
        .select('*')

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      if (showSuccessToast) {
        successToast(
          'Berhasil!',
          `${records.length} data berhasil ditambahkan`
        )
      }

      return result
    } catch (error: unknown) {
      handleError(error as Error, 'create')
      throw error
    } finally {
      setLoading(false)
    }
  }, [table, handleError, showSuccessToast])

  const bulkUpdate = useCallback(async (
    updates: Array<{ id: string; data: Tables[T]['Update'] }>
  ) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()

      if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error('Data tidak valid atau kosong')
      }

      const results = []
      for (const update of updates) {
        const { data: result, error } = await supabase
          .from(table as any)
          .update(update.data as any)
          .eq('id', update.id)
          .select('*')
          .single()

        if (error) {
          throw new Error(`Gagal update record ${update.id}: ${error.message}`)
        }

        results.push(result)
      }

      if (showSuccessToast) {
        successToast(
          'Berhasil!',
          `${updates.length} data berhasil diperbarui`
        )
      }

      return results
    } catch (error: unknown) {
      handleError(error as Error, 'update')
      throw error
    } finally {
      setLoading(false)
    }
  }, [table, handleError, showSuccessToast])

  const bulkDelete = useCallback(async (ids: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('ID tidak valid atau kosong')
      }

      const { error } = await supabase
        .from(table as any)
        .delete()
        .in('id', ids)

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      if (showSuccessToast) {
        successToast(
          'Berhasil!',
          `${ids.length} data berhasil dihapus`
        )
      }

      return true
    } catch (error: unknown) {
      handleError(error as Error, 'delete')
      throw error
    } finally {
      setLoading(false)
    }
  }, [table, handleError, showSuccessToast])

  // Utility function to clear errors
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Core CRUD operations
    create: createRecord,
    update: updateRecord,
    delete: deleteRecord,

    // Bulk operations
    bulkCreate,
    bulkUpdate,
    bulkDelete,

    // State
    loading,
    error,

    // Utility
    clearError,
  }
}

// Utility hook for handling async operations with toast feedback
export function useAsyncOperation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
      showToasts?: boolean
    } = {}
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

  return { execute, loading, error, clearError: () => setError(null) }
}