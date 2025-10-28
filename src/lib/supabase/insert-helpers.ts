/**
 * Helper functions for type-safe Supabase inserts
 * Workaround for Supabase SSR client type inference issues
 */

import type { Database } from '@/types/supabase-generated'

type Tables = Database['public']['Tables']
type TableName = keyof Tables

/**
 * Type-safe insert helper that properly handles Supabase SSR client types
 */
export function prepareInsert<T extends TableName>(
  _tableName: T,
  data: Tables[T]['Insert']
): Tables[T]['Insert'] {
  return data
}

/**
 * Type-safe update helper
 */
export function prepareUpdate<T extends TableName>(
  _tableName: T,
  data: Tables[T]['Update']
): Tables[T]['Update'] {
  return data
}

/**
 * Cast query result to proper type
 */
export function castRow<T extends TableName>(
  _tableName: T,
  data: unknown
): Tables[T]['Row'] {
  return data as Tables[T]['Row']
}

/**
 * Cast array of query results
 */
export function castRows<T extends TableName>(
  _tableName: T,
  data: unknown
): Tables[T]['Row'][] {
  return data as Tables[T]['Row'][]
}
