/**
 * Typed Supabase Client Operations
 * Enhanced Supabase operations with proper typing
 * 
 * Note: This file provides type-safe wrappers for Supabase operations.
 * Use the generated types from @/types/supabase-generated as source of truth.
 */

import type { Database } from '@/types/supabase-generated'
import type { SupabaseClient } from '@supabase/supabase-js'

// Type casting helpers for Supabase query results
export function castRow<T>(row: unknown): T {
  return row as T
}

export function castRows<T>(rows: unknown[]): T[] {
  return rows as T[]
}

// Type helper to get table row type
export type TableRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

// Type helper to get table insert type
export type TableInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

// Type helper to get table update type
export type TableUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// Type helper for typed Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>
