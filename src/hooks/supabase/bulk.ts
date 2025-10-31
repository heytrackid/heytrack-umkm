// @ts-nocheck - Supabase bulk operation type constraints
'use client'

import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/database'
import type { BulkUpdateItem } from './types'

type TablesMap = Database['public']['Tables']

/**
 * Bulk operations for Supabase tables
 */
export class useSupabaseBulk {
  static async createMultiple<T extends keyof TablesMap>(
    table: T,
    records: Array<TablesMap[T]['Insert']>
  ) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from(table)
      .insert(records)
      .select('*') as { data: Array<TablesMap[T]['Row']> | null; error: Error | null }

    if (error) {
      throw new Error((error instanceof Error ? error.message : String(error)))
    }

    return data as Array<TablesMap[T]['Row']>
  }

  static async updateMultiple<T extends keyof TablesMap>(
    table: T,
    updates: Array<BulkUpdateItem<T>>
  ) {
    const supabase = createClient()
    const results = []

    for (const update of updates) {
      const { data, error } = await supabase
        .from(table)
        .update(update.data)
        .eq('id', update.id)
        .select('*')
        .single() as { data: TablesMap[T]['Row'] | null; error: Error | null }

      if (error) {
        throw new Error(`Failed to update record ${update.id}: ${error.message}`)
      }

      results.push(data as TablesMap[T]['Row'])
    }

    return results
  }

  static async deleteMultiple<T extends keyof TablesMap>(
    table: T,
    ids: string[]
  ) {
    const supabase = createClient()

    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids)

    if (error) {
      throw new Error((error instanceof Error ? error.message : String(error)))
    }

    return true
  }

  static async upsertMultiple<T extends keyof TablesMap>(
    table: T,
    records: Array<TablesMap[T]['Insert']>,
    conflictColumns: string[] = ['id']
  ) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from(table)
      .upsert(records, { onConflict: conflictColumns.join(',') })
      .select('*') as { data: Array<TablesMap[T]['Row']> | null; error: Error | null }

    if (error) {
      throw new Error((error instanceof Error ? error.message : String(error)))
    }

    return data as Array<TablesMap[T]['Row']>
  }
}
