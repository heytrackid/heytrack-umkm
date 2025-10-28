'use client'

import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'
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
  const [data, setData] = useState<Tables[T]['Row'][]>(options.initial ?? [])
  const [loading, setLoading] = useState(!options.initial)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      void setLoading(true)
      void setError(null)

      const supabase = createClient()
      let query = supabase.from(tableName).select(options.select || '*')

      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          if (value === undefined) {return}
          const column = key as keyof Tables[T]['Row'] & string
          if (value === null) {
            query = query.is(column, null)
          } else {
            query = query.eq(column, value)
          }
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

      if (queryError) {throw queryError}
      void setData(result || [])
    } catch (err) {
      void setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      void setLoading(false)
    }
  }, [tableName, JSON.stringify(options)])

  useEffect(() => {
    // Skip initial fetch if we have initial data and refetchOnMount is false
    if (options.initial && options.refetchOnMount === false) {
      return
    }

    void fetchData()

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
              setData((prev) => [payload.new as Tables[T]['Row'], ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) =>
                prev.map((item: Tables[T]['Row']) =>
                  item.id === (payload.new as Tables[T]['Row']).id ? payload.new as Tables[T]['Row'] : item
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setData((prev) =>
                prev.filter((item: Tables[T]['Row']) => item.id !== (payload.old as Tables[T]['Row']).id)
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
