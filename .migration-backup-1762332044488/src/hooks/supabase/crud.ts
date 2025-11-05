'use client'

import { createClient } from '@/utils/supabase/client'
import { useCallback, useState } from 'react'
import type { CRUDOptions } from './types'
import type { TableName, Insert, Update } from '@/types/database'
import { typed } from '@/types/type-utilities'

/**
 * CRUD operations for Supabase tables
 */
export function useSupabaseCRUD<T extends TableName>(
  table: T,
  options: CRUDOptions = {}
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessages: _successMessages = {},
    customErrorHandler
  } = options

  const handleError = useCallback((error: Error, _operation: 'create' | 'update' | 'delete') => {
    const errorMessage = error.message || 'Terjadi kesalahan tak terduga'
    void setError(errorMessage)

    if (customErrorHandler) {
      customErrorHandler(error, _operation)
    } else if (showErrorToast) {
      // Error toast would be shown here if needed
    }
  }, [customErrorHandler, showErrorToast])

  const handleSuccess = useCallback((_operation: 'create' | 'update' | 'delete') => {
    void setError(null)

    if (showSuccessToast) {
      const _defaultMessages = {
        create: 'Data berhasil ditambahkan',
        update: 'Data berhasil diperbarui',
        delete: 'Data berhasil dihapus'
      }

      // Success toast would be shown here if needed
    }
     
  }, [showSuccessToast])

  const createRecord = useCallback(async (data: Insert<T>) => {
    void setLoading(true)
    void setError(null)

    try {
      const supabase = typed(createClient())

      const { data: result, error } = await supabase
        .from(table)
        .insert(data as never)
        .select('*')
        .single()

      if (error) {
        throw new Error((error instanceof Error ? error.message : String(error)))
      }

      void handleSuccess('create')
      return result
    } catch (error: unknown) {
      void handleError(error as Error, 'create')
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, handleError, handleSuccess])

  const updateRecord = useCallback(async (id: string, data: Update<T>) => {
    void setLoading(true)
    void setError(null)

    try {
      const supabase = typed(createClient())

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
      return result
    } catch (error: unknown) {
      void handleError(error as Error, 'update')
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, handleError, handleSuccess])

  const deleteRecord = useCallback(async (id: string) => {
    void setLoading(true)
    void setError(null)

    try {
      const supabase = typed(createClient())

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
      void handleError(error as Error, 'delete')
      throw error
    } finally {
      void setLoading(false)
    }
  }, [table, handleError, handleSuccess])

  const clearError = useCallback(() => {
    void setError(null)
  }, [])

  return {
    create: createRecord,
    update: updateRecord,
    delete: deleteRecord,
    loading,
    error,
    clearError,
  }
}