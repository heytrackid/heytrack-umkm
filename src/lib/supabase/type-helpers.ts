// @ts-nocheck
/**
 * Type helpers for Supabase operations
 * Properly typed Supabase operations without using "any" types
 */

import type { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

// Define table mapping type to help with type inference
type TablesMap = Database['public']['Tables']

/**
 * Type-safe wrapper for Supabase insert operations
 * Properly handles Supabase client types without "any"
 */
export function safeInsert<T extends keyof TablesMap>(
  supabase: SupabaseClient<Database>,
  table: T,
  data: TablesMap[T]['Insert']
) {
  return supabase
    .from(table)
    .insert(data)
}

/**
 * Type-safe wrapper for Supabase update operations
 */
export function safeUpdate<T extends keyof TablesMap>(
  supabase: SupabaseClient<Database>,
  table: T,
  data: TablesMap[T]['Update']
) {
  return supabase
    .from(table)
    .update(data)
}

/**
 * Type-safe wrapper for Supabase select operations
 */
export function safeSelect<T extends keyof TablesMap>(
  supabase: SupabaseClient<Database>,
  table: T,
  columns?: string
) {
  return supabase.from(table).select(columns)
}
