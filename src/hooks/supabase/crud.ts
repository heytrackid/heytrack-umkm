'use client'

import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types'
import { useCallback, useState } from 'react'
import type { CRUDOptions } from './types'

type Tables = Database['public']['Tables']

/**
 * CRUD operations for Supabase tables
 */
export function useSupabaseCRUD<T extends keyof Tables>(
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
    setError(errorMessage)

    if (customErrorHandler) {
      customErrorHandler(error, operation)
    } else if (showErrorToast) {
      // For now, just log the error - toast would be imported if needed
      console.error(`Gagal ${operation}:`, errorMessage)
    }
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
      // Toast would be called here if imported
      console.log(message)
    }
  }, [showSuccessToast, successMessages])

  const createRecord = useCallback(async (data: Tables[T]['Insert']) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

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
      const supabase = createClient()

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
      const supabase = createClient()

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

  const clearError = useCallback(() => {
    setError(null)
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
