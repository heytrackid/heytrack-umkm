'use client'

import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'
import type { BulkUpdateItem } from './types'

type Tables = Database['public']['Tables']

/**
 * Bulk operations for Supabase tables
 */
export class useSupabaseBulk {
  static async createMultiple<T extends keyof Tables>(
    table: T,
    records: Array<Tables[T]['Insert']>
  ) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from(table)
      .insert(records)
      .select('*')

    if (error) {
      throw new Error((error instanceof Error ? error.message : String(error)))
    }

    return data
  }

  static async updateMultiple<T extends keyof Tables>(
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
        .single()

      if (error) {
        throw new Error(`Failed to update record ${update.id}: ${error.message}`)
      }

      results.push(data)
    }

    return results
  }

  static async deleteMultiple<T extends keyof Tables>(
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

  static async upsertMultiple<T extends keyof Tables>(
    table: T,
    records: Array<Tables[T]['Insert']>,
    conflictColumns: string[] = ['id']
  ) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from(table)
      .upsert(records, { onConflict: conflictColumns.join(',') })
      .select('*')

    if (error) {
      throw new Error((error instanceof Error ? error.message : String(error)))
    }

    return data
  }
}
