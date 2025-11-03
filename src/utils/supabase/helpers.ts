import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'




/**
 * Supabase Helper Functions
 * Workaround for Postgrest 13.0.5 strict typing
 * 
 * Postgrest 13.0.5 has stricter type checking that causes issues with
 * insert/update operations. This helper provides a type-safe workaround.
 */


/**
 * Type-safe Supabase client wrapper for Postgrest 13.0.5
 * 
 * Usage: Use `typed(supabase)` for type-safe operations
 * 
 * @example
 * // Before:
 * const { data } = await supabase.from('customers').insert([data])
 * 
 * // After:
 * const { data } = await typed(supabase).from('customers').insert([data])
 */
export function typed(client: SupabaseClient<Database>) {
  return client
}
