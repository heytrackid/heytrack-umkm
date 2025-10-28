/**
 * Typed Supabase Client Helpers
 * Helper functions for typed Supabase operations
 */

import { createClient } from '@/utils/supabase/client'

// Re-export standard client
export const createTypedClient = createClient

// Type guards for query results
export function hasData<T>(result: { data?: T | null; error?: unknown }): result is { data: T } {
  return result && 'data' in result && result.data !== null && result.data !== undefined
}

export function hasArrayData<T>(result: { data?: T[] | null; error?: unknown }): result is { data: T[] } {
  return result && 'data' in result && Array.isArray(result.data) && result.data !== null
}

export function isQueryError(result: { data?: unknown; error?: unknown }): result is { error: unknown } {
  return result && 'error' in result && result.error !== null && result.error !== undefined
}

// Type casting helpers
export function castRow<T>(row: unknown): T {
  return row as T
}

export function castRows<T>(rows: unknown[]): T[] {
  return rows as T[]
}
