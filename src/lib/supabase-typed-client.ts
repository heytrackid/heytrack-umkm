/**
 * Typed Supabase Client Helpers
 * Helper functions for typed Supabase operations
 */

import { createClient } from '@/utils/supabase/client'

// Re-export standard client
export const createTypedClient = createClient

// Type guards for query results
export function hasData<T>(result: any): result is { data: T } {
  return result && 'data' in result && result.data !== null
}

export function hasArrayData<T>(result: any): result is { data: T[] } {
  return result && 'data' in result && Array.isArray(result.data)
}

export function isQueryError(result: any): result is { error: any } {
  return result && 'error' in result && result.error !== null
}

// Type casting helpers
export function castRow<T>(row: any): T {
  return row as T
}

export function castRows<T>(rows: any[]): T[] {
  return rows as T[]
}
