/**
 * Typed Supabase Client Operations
 * Enhanced Supabase operations with proper typing
 */

import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database'

import { SupabaseClient } from '@supabase/supabase-js'

// Typed insert operation
export async function typedInsert<T extends keyof Database['public']['Tables']>(
  table: T,
  data: Database['public']['Tables'][T]['Insert'],
  client?: SupabaseClient<Database>
) {
  const supabase = client || createClient()
  return await supabase.from(table).insert(data)
}

// Typed update operation
export async function typedUpdate<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string | number,
  data: Database['public']['Tables'][T]['Update'],
  client?: SupabaseClient<Database>
) {
  const supabase = client || createClient()
  return await supabase.from(table).update(data).eq('id', id)
}

// Type casting helpers (re-exported for convenience)
export function castRow<T>(row: unknown): T {
  return row as T
}

export function castRows<T>(rows: unknown[]): T[] {
  return rows as T[]
}
