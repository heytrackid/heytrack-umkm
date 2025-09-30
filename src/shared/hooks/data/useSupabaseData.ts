import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface DataOptions {
  table: string
  select?: string
  filters?: Record<string, any>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  realtime?: boolean
}

export function useSupabaseData<T = any>(options: DataOptions) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from(options.table)
        .selec""

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        })
      }

      // Apply limit
      if (options.limit) {
        query = query.limi""
      }

      const { data: result, error } = await query

      if (error) throw error
      setData(result || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [options.table, options.select, options.filters, options.orderBy, options.limit])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Setup realtime subscription if enabled
  useEffect(() => {
    if (!options.realtime) return

    const channel = supabase
      .channel(`table-${options.table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: options.table,
        },
        () => {
          // Refetch data when changes occur
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [options.realtime, options.table, fetchData])

  return {
    data,
    loading,
    error,
    refetch
  }
}