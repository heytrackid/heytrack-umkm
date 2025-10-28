/**
 * Type helpers for Supabase operations
 * Workaround for Supabase SSR client type inference issues
 */

import type { Database } from '@/types/supabase-generated'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Type-safe wrapper for Supabase insert operations
 * This helps bypass the SSR client type inference issues
 */
export function safeInsert<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<any>,
  table: T,
  data: Database['public']['Tables'][T]['Insert']
) {
  return supabase
    .from(table)
    .insert(data as any)
}

/**
 * Type-safe wrapper for Supabase update operations
 */
export function safeUpdate<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<any>,
  table: T,
  data: Database['public']['Tables'][T]['Update']
) {
  return supabase
    .from(table)
    .update(data as any)
}

/**
 * Type-safe wrapper for Supabase select operations
 */
export function safeSelect<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<any>,
  table: T
) {
  return supabase.from(table).select()
}
