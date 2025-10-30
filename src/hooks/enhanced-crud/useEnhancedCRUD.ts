'use client'

import { useCallback, useState } from 'react'
import { successToast } from '@/hooks/use-toast'
import { createClient as createSupabaseClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'
import type { EnhancedCRUDOptions } from './types'
import { handleCRUDError, validateCRUDInputs, validateBulkInputs } from './utils'
import { getErrorMessage } from '@/lib/type-guards'

type Tables = Database['public']['Tables']

/**
 * Enhanced CRUD hook with toast notifications and error handling
 * 
 * Generic type parameters:
 * - TTable: Table name from database
 * - TRow: Row type for query results
 * - TInsert: Insert type for create operations
 * - TUpdate: Update type for update operations
 */
export function useEnhancedCRUD<
  TTable extends keyof Tables,
  TRow = Tables[TTable]['Row'],
  TInsert = Tables[TTable]['Insert'],
  TUpdate = Tables[TTable]['Update']
>(
  table: TTable,
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

  const createRecord = useCallback(async (data: TInsert): Promise<TRow> => {
    validateCRUDInputs('create', data)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

      const { data: result, error } = await supabase
        .from(table)
        .insert(data as never)
        .select('*')
        .single()

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      void handleSuccess('create')
      return result as TRow
    } catch (error: unknown) {
      void handleCRUDError(error as Error, 'create', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, handleSuccess, showErrorToast, customErrorHandler])

  const updateRecord = useCallback(async (id: string, data: TUpdate): Promise<TRow> => {
    validateCRUDInputs('update', data, id)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

      const { data: result, error } = await supabase
        .from(table)
        .update(data as never)
        .eq('id', id as never)
        .select('*')
        .single()

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      if (!result) {
        throw new Error('Data tidak ditemukan')
      }

      void handleSuccess('update')
      return result as TRow
    } catch (error: unknown) {
      void handleCRUDError(new Error(getErrorMessage(error)), 'update', showErrorToast, customErrorHandler)
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
        .from(table)
        .select('*')
        .eq('id', id as never)
        .single()

      if (fetchError || !existingRecord) {
        throw new Error('Data tidak ditemukan')
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id as never)

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      void handleSuccess('delete')
      return true
    } catch (error: unknown) {
      void handleCRUDError(new Error(getErrorMessage(error)), 'delete', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, handleSuccess, showErrorToast, customErrorHandler])

  const bulkCreate = useCallback(async (records: TInsert[]): Promise<TRow[]> => {
    validateBulkInputs('create', records as Array<Record<string, unknown>>)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

      const { data: result, error } = await supabase
        .from(table)
        .insert(records as never)
        .select('*')

      if (error) {
        throw new Error(getErrorMessage(error))
      }

      if (showSuccessToast) {
        successToast(
          'Berhasil!',
          `${records.length} data berhasil ditambahkan`
        )
      }

      return result as TRow[]
    } catch (error: unknown) {
      void handleCRUDError(new Error(getErrorMessage(error)), 'create', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, showSuccessToast, showErrorToast, customErrorHandler])

  const bulkUpdate = useCallback(async (
    updates: Array<{ id: string; data: TUpdate }>
  ): Promise<TRow[]> => {
    validateBulkInputs('update', updates as Array<Record<string, unknown>>)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()
      const results: TRow[] = []

      for (const update of updates) {
        const { data: result, error } = await supabase
          .from(table)
          .update(update.data as never)
          .eq('id', update.id as never)
          .select('*')
          .single()

        if (error) {
          throw new Error(`Gagal update record ${update.id}: ${error.message}`)
        }

        results.push(result as TRow)
      }

      if (showSuccessToast) {
        successToast(
          'Berhasil!',
          `${updates.length} data berhasil diperbarui`
        )
      }

      return results
    } catch (error: unknown) {
      void handleCRUDError(new Error(getErrorMessage(error)), 'update', showErrorToast, customErrorHandler)
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, showSuccessToast, showErrorToast, customErrorHandler])

  const bulkDelete = useCallback(async (ids: string[]) => {
    validateBulkInputs('delete', ids as unknown as Array<Record<string, unknown>>)

    void setLoading(true)
    void setError(null)

    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids as never)

      if (error) {
        throw new Error(getErrorMessage(error))
      }

      if (showSuccessToast) {
        successToast(
          'Berhasil!',
          `${ids.length} data berhasil dihapus`
        )
      }

      return true
    } catch (error: unknown) {
      void handleCRUDError(new Error(getErrorMessage(error)), 'delete', showErrorToast, customErrorHandler)
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
