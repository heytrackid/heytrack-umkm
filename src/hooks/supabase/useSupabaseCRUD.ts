/**
 * Supabase CRUD Hook
 * Generic hook for CRUD operations with Supabase
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface UseSupabaseCRUDReturn<T> {
  data: T[] | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  remove: (id: string) => Promise<void>
  create: (data: Partial<T>) => Promise<T | null>
  update: (id: string, data: Partial<T>) => Promise<T | null>
}

export function useSupabaseCRUD<T = any>(
  table: string,
  options?: {
    select?: string
    filter?: Record<string, any>
    orderBy?: { column: string; ascending?: boolean }
  }
): UseSupabaseCRUDReturn<T> {
  const [data, setData] = useState<T[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      void setLoading(true)
      void setError(null)

      const supabase = createClient()
      let query = supabase.from(table).select(options?.select || '*')

      // Apply filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        })
      }

      const { data: result, error: queryError } = await query

      if (queryError) {throw queryError}

      void setData(result as T[])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      void setLoading(false)
    }
  }

  const remove = async (id: string) => {
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (deleteError) {throw deleteError}

      // Refresh data after delete
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Delete failed'))
      throw err
    }
  }

  const create = async (newData: Partial<T>): Promise<T | null> => {
    try {
      const supabase = createClient()
      const { data: result, error: createError } = await supabase
        .from(table)
        .insert(newData as any)
        .select()
        .single()

      if (createError) {throw createError}

      // Refresh data after create
      await fetchData()
      return result as T
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Create failed'))
      throw err
    }
  }

  const update = async (id: string, updateData: Partial<T>): Promise<T | null> => {
    try {
      const supabase = createClient()
      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {throw updateError}

      // Refresh data after update
      await fetchData()
      return result as T
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Update failed'))
      throw err
    }
  }

  useEffect(() => {
    void fetchData()
  }, [table, JSON.stringify(options)])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    remove,
    create,
    update
  }
}
