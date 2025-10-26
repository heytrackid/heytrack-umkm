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
      setLoading(true)
      setError(null)

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

      if (queryError) throw queryError

      setData(result as T[])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [table, JSON.stringify(options)])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}
