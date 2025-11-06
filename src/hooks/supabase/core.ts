'use client'

import type { Row, TableName } from '@/types/database'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { UseSupabaseQueryOptions } from './types'

/**
 * Core hook for Supabase queries with real-time support
 */
export function useSupabaseQuery<T extends TableName>(
  tableName: T,
  options: UseSupabaseQueryOptions<T> = {}
) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<Array<Row<T>>>(options.initial ?? [])
  const [loading, setLoading] = useState(!options.initial)
  const [error, setError] = useState<string | null>(null)

  const optionsRef = useRef(options)
  const fetchIdRef = useRef<symbol | null>(null)
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const fetchData = useCallback(async () => {
    const currentFetchId = Symbol('supabase-query')
    fetchIdRef.current = currentFetchId
    
    try {
      void setLoading(true)
      void setError(null)

      const currentOptions = optionsRef.current
      let query = supabase.from(tableName).select(currentOptions.select ?? '*')

      // Apply filters
      if (currentOptions.filter) {
        Object.entries(currentOptions.filter).forEach(([key, value]) => {
          if (value === undefined) {return}
          const column = key
          if (value === null) {
            query = query.is(column, null)
          } else {
            query = query.eq(column, value)
          }
        })
      }

      // Apply ordering
      if (currentOptions.orderBy) {
        query = query.order(currentOptions.orderBy.column, {
          ascending: currentOptions.orderBy.ascending ?? true,
        })
      }

      // Apply limit
      if (currentOptions.limit) {
        query = query.limit(currentOptions.limit)
      }

      const { data: result, error: queryError } = await query

      if (fetchIdRef.current !== currentFetchId) {
        return
      }

      if (queryError) {throw queryError}
      void setData((result || []) as unknown as Array<Row<T>>)
    } catch (err) {
      if (fetchIdRef.current !== currentFetchId) {
        return
      }
      void setError(err instanceof Error ? err.message : 'An error occurred')
     } finally {
       if (fetchIdRef.current === currentFetchId) {
         fetchIdRef.current = null
         void setLoading(false)
       }
     }
   }, [tableName, supabase])

  useEffect(() => {
    // Skip initial fetch if we have initial data and refetchOnMount is false
    if (options.initial && options.refetchOnMount === false) {
      return undefined
    }

    void fetchData()

    // Setup realtime subscription if enabled
    if (options.realtime === true) {
      const channel = supabase
        .channel(`${tableName}-changes`)
        .on(
          'postgres_changes' as const,
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload: unknown) => {
            const typedPayload = payload as {
              eventType: 'INSERT' | 'UPDATE' | 'DELETE';
              new: Row<T>;
              old: Row<T>;
            }
            if (typedPayload.eventType === 'INSERT') {
              setData((prev) => [typedPayload.new, ...prev])
            } else if (typedPayload.eventType === 'UPDATE') {
              setData((prev) =>
                prev.map((item: Row<T>) =>
                  (item as { id: string }).id === (typedPayload.new as { id: string }).id ? typedPayload.new : item
                )
              )
            } else if (typedPayload.eventType === 'DELETE') {
              setData((prev) =>
                prev.filter((item: Row<T>) => (item as { id: string }).id !== (typedPayload.old as { id: string }).id)
              )
            }
          }
        )
        .subscribe((status: string) => {
          // Suppress WebSocket errors in console - they're handled by Supabase internally
          if (status === 'CHANNEL_ERROR') {
            // Silently handle channel errors without logging to console
            // The subscription will automatically retry
          }
        })

      return () => {
        fetchIdRef.current = null
        void supabase.removeChannel(channel)
      }
    }
    
    return () => {
      fetchIdRef.current = null
    }
  }, [tableName, fetchData, options.realtime, options.refetchOnMount, options.initial, supabase])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}
