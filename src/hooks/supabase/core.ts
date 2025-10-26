'use client'

import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types'
import { useCallback, useEffect, useState } from 'react'
import type { UseSupabaseQueryOptions } from './types'

type Tables = Database['public']['Tables']

/**
 * Core hook for Supabase queries with real-time support
 */
export function useSupabaseQuery<T extends keyof Tables>(
  tableName: T,
  options: UseSupabaseQueryOptions<T> = {}
) {
  const [data, setData] = useState<any[]>(options.initial ?? [])
  const [loading, setLoading] = useState(!options.initial)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      let query = supabase.from(tableName as any).select(options.select || '*')

      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = (query as any).eq(key, value)
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        })
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data: result, error: queryError } = await query

      if (queryError) throw queryError
      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [tableName, JSON.stringify(options)])

  useEffect(() => {
    // Skip initial fetch if we have initial data and refetchOnMount is false
    if (options.initial && options.refetchOnMount === false) {
      return
    }

    fetchData()

    // Setup realtime subscription if enabled
    if (options.realtime !== false) {
      const supabase = createClient()
      const channel = supabase
        .channel(`${tableName}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setData((prev) => [payload.new as any, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) =>
                prev.map((item) =>
                  (item as any).id === payload.new.id ? payload.new : item
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setData((prev) =>
                prev.filter((item) => (item as any).id !== payload.old.id)
              )
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [tableName, fetchData, options.realtime, options.refetchOnMount])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}
