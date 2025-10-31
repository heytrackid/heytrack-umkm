/**
 * Helper functions for type-safe Supabase inserts
 * Workaround for Supabase SSR client type inference issues
 */

import type { Database } from '@/types/database'

type TablesMap = Database['public']['Tables']
type TableName = keyof TablesMap

/**
 * Type-safe insert helper that properly handles Supabase SSR client types
 */
export function prepareInsert<T extends TableName>(
  _tableName: T,
  data: TablesMap[T]['Insert']
): TablesMap[T]['Insert'] {
  return data
}

/**
 * Type-safe update helper
 */
export function prepareUpdate<T extends TableName>(
  _tableName: T,
  data: TablesMap[T]['Update']
): TablesMap[T]['Update'] {
  return data
}

/**
 * Cast query result to proper type
 */
export function castRow<T extends TableName>(
  _tableName: T,
  data: unknown
): TablesMap[T]['Row'] {
  return data as TablesMap[T]['Row']
}

/**
 * Cast array of query results
 */
export function castRows<T extends TableName>(
  _tableName: T,
  data: unknown
): Array<TablesMap[T]['Row']> {
  return data as Array<TablesMap[T]['Row']>
}
