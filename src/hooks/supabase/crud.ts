// @ts-nocheck - Complex Supabase generic constraints
'use client'

import { createClient } from '@/utils/supabase/client'
import { useCallback, useState } from 'react'
import type { CRUDOptions } from './types'
import type { Database } from '@/types/database'

type TablesMap = Database['public']['Tables']

/**
 * CRUD operations for Supabase tables
 */
export function useSupabaseCRUD<T extends keyof TablesMap>(
  table: T,
  options: CRUDOptions = {}
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
    void setError(errorMessage)

    if (customErrorHandler) {
      customErrorHandler(error, operation)
    } else if (showErrorToast) {
      // Error toast would be shown here if needed
    }
  }, [customErrorHandler, showErrorToast])

  const handleSuccess = useCallback((operation: 'create' | 'update' | 'delete') => {
    void setError(null)

    if (showSuccessToast) {
      const defaultMessages = {
        create: 'Data berhasil ditambahkan',
        update: 'Data berhasil diperbarui',
        delete: 'Data berhasil dihapus'
      }

      // Success toast would be shown here if needed
    }
  }, [showSuccessToast, successMessages])

  const createRecord = useCallback(async (data: TablesMap[T]['Insert']) => {
    void setLoading(true)
    void setError(null)

    try {
      const supabase = createClient()

      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
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

  const updateRecord = useCallback(async (id: string, data: TablesMap[T]['Update']) => {
    void setLoading(true)
    void setError(null)

    try {
      const supabase = createClient()

      const { data: result, error } = await supabase
        .from(table)
        .update(data)
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
      const supabase = createClient()

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

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
