/**
 * Typed Supabase Client Wrappers
 * Provides properly typed wrappers for Supabase operations to avoid 'never' type issues
 */

import type { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

// Generic insert wrapper
export async function typedInsert<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<Database>,
  table: T,
  data: Database['public']['Tables'][T]['Insert'] | Database['public']['Tables'][T]['Insert'][]
) {
  const isArray = Array.isArray(data)
  const result = await supabase
    .from(table)
    .insert(data as any)
    .select()

  return result as {
    data: Database['public']['Tables'][T]['Row'][] | null
    error: any
  }
}

// Generic update wrapper
export async function typedUpdate<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<Database>,
  table: T,
  id: string,
  data: Database['public']['Tables'][T]['Update']
) {
  const result = await supabase
    .from(table)
    .update(data as any)
    .eq('id', id)
    .select()
    .single()

  return result as {
    data: Database['public']['Tables'][T]['Row'] | null
    error: any
  }
}

// Generic select wrapper
export async function typedSelect<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<Database>,
  table: T,
  id?: string
) {
  let query = supabase.from(table).select('*')
  
  if (id) {
    const singleResult = await query.eq('id', id).single()
    return singleResult as {
      data: Database['public']['Tables'][T]['Row'] | null
      error: any
    }
  }

  const result = await query
  return result as {
    data: Database['public']['Tables'][T]['Row'][] | null
    error: any
  }
}

// Generic delete wrapper
export async function typedDelete<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<Database>,
  table: T,
  id: string
) {
  const result = await supabase
    .from(table)
    .delete()
    .eq('id', id)

  return result
}

// Helper to cast query results
export function castRow<T extends keyof Database['public']['Tables']>(
  data: unknown
): Database['public']['Tables'][T]['Row'] {
  return data as Database['public']['Tables'][T]['Row']
}

// Helper to cast query array results  
export function castRows<T extends keyof Database['public']['Tables']>(
  data: unknown[]
): Database['public']['Tables'][T]['Row'][] {
  return data as Database['public']['Tables'][T]['Row'][]
}
