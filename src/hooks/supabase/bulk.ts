'use client'

import type { Database, Insert, Row, TableName } from '@/types/database'
import { typed } from '@/types/type-utilities'
import { createClient } from '@/utils/supabase/client'

import type { BulkUpdateItem } from '@/hooks/supabase/types'

type TableKey = keyof Database['public']['Tables']

/**
 * Bulk operations for Supabase tables
 */
export class useSupabaseBulk {
  static async createMultiple<T extends TableName>(
    table: T,
    records: Array<Insert<T>>
  ): Promise<Array<Row<T>>> {
    const supabase = typed(createClient())

    const { data, error } = await supabase
      .from(table as never)
      .insert(records as never)
      .select('*')

    if (error) {
      throw new Error((error instanceof Error ? error.message : String(error)))
    }

    return data as Array<Row<T>>
  }

  static async updateMultiple<T extends TableName>(
    table: T,
    updates: Array<BulkUpdateItem<TableKey>>
  ): Promise<Array<Row<T>>> {
    const supabase = typed(createClient())
    const results: Array<Row<T>> = []

    for (const update of updates) {
      const { data, error } = await supabase
        .from(table as never)
        .update(update.data as never)
        .eq('id', update.id)
        .select('*')
        .single()

      if (error) {
        throw new Error(`Failed to update record ${update['id']}: ${error.message}`)
      }

      results.push(data as Row<T>)
    }

    return results
  }

  static async deleteMultiple<T extends TableName>(
    table: T,
    ids: string[]
  ): Promise<boolean> {
    const supabase = typed(createClient())

    const { error } = await supabase
      .from(table as never)
      .delete()
      .in('id', ids)

    if (error) {
      throw new Error((error instanceof Error ? error.message : String(error)))
    }

    return true
  }

  static async upsertMultiple<T extends TableName>(
    table: T,
    records: Array<Insert<T>>,
    conflictColumns: string[] = ['id']
  ): Promise<Array<Row<T>>> {
    const supabase = typed(createClient())

    const { data, error } = await supabase
      .from(table as never)
      .upsert(records as never, { onConflict: conflictColumns.join(',') })
      .select('*')

    if (error) {
      throw new Error((error instanceof Error ? error.message : String(error)))
    }

    return data as Array<Row<T>>
  }
}
