'use client'

import { useCallback, useState } from 'react'
import { successToast } from '@/hooks/use-toast'
import { createClient as createSupabaseClient } from '@/utils/supabase'
import type { Database } from '@/types'
import type { EnhancedCRUDOptions, BulkUpdateItem } from './types'
import { handleCRUDError, validateCRUDInputs, validateBulkInputs } from './utils'

type Tables = Database['public']['Tables']

/**
 * Enhanced CRUD hook with toast notifications and error handling
 */
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

  const handleSuccess = useCallback((operation: 'create' | 'update' | 'delete') => {
    void setError(null)

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
    validateCRUDInputs('create', data)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

      const { data: result, error } = await supabase
        .from(table as any)
        .insert(data as any)
        .select('*')
        .single()

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      void handleSuccess('create')
      return result
    } catch (error: unknown) {
      void handleCRUDError(error as Error, 'create', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, handleSuccess, showErrorToast, customErrorHandler])

  const updateRecord = useCallback(async (id: string, data: Tables[T]['Update']) => {
    validateCRUDInputs('update', data, id)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

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

      void handleSuccess('update')
      return result
    } catch (error: unknown) {
      void handleCRUDError(error as Error, 'update', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, handleSuccess, showErrorToast, customErrorHandler])

  const deleteRecord = useCallback(async (id: string) => {
    validateCRUDInputs('delete', undefined, id)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

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

      void handleSuccess('delete')
      return true
    } catch (error: unknown) {
      void handleCRUDError(error as Error, 'delete', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, handleSuccess, showErrorToast, customErrorHandler])

  const bulkCreate = useCallback(async (records: Array<Tables[T]['Insert']>) => {
    validateBulkInputs('create', records)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

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
      void handleCRUDError(error as Error, 'create', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, showSuccessToast, showErrorToast, customErrorHandler])

  const bulkUpdate = useCallback(async (
    updates: Array<BulkUpdateItem<T>>
  ) => {
    validateBulkInputs('update', updates)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()
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
      void handleCRUDError(error as Error, 'update', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, showSuccessToast, showErrorToast, customErrorHandler])

  const bulkDelete = useCallback(async (ids: string[]) => {
    validateBulkInputs('delete', ids)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

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
      void handleCRUDError(error as Error, 'delete', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, showSuccessToast, showErrorToast, customErrorHandler])

  const clearError = useCallback(() => {
    void setError(null)
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
