/**
 * Helper utilities for working with Supabase types
 */

import type { Database } from '@/types/supabase-generated'
import type { SupabaseClient } from '@supabase/supabase-js'

export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Type helper for Supabase query results
 * Use this when TypeScript can't infer the correct type from a query
 */
export function assertQueryResult<T>(data: unknown): T {
  return data as T
}

/**
 * Type helper for Supabase single() results
 * Ensures the result is not null
 */
export function assertSingleResult<T>(data: T | null): T {
  if (!data) {
    throw new Error('Expected single result but got null')
  }
  return data
}

/**
 * Type helper for array results
 */
export function assertArrayResult<T>(data: unknown): T[] {
  if (!Array.isArray(data)) {
    return []
  }
  return data as T[]
}
