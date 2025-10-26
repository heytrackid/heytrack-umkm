/**
 * Typed Supabase Client Operations
 * Enhanced Supabase operations with proper typing
 */

import { createClient } from '@/utils/supabase/client'

// Typed insert operation
export async function typedInsert<T>(
  table: string,
  data: Partial<T>,
  client?: any
) {
  const supabase = client || createClient()
  return await supabase.from(table).insert(data as any)
}

// Typed update operation
export async function typedUpdate<T>(
  table: string,
  id: string | number,
  data: Partial<T>,
  client?: any
) {
  const supabase = client || createClient()
  return await supabase.from(table).update(data as any).eq('id', id)
}

// Type casting helpers (re-exported for convenience)
export function castRow<T>(row: any): T {
  return row as T
}

export function castRows<T>(rows: any[]): T[] {
  return rows as T[]
}
