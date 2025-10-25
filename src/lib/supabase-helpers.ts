/**
 * Supabase Type Helpers
 * Helper functions to properly type Supabase queries
 */

import type { Database } from '@/types/database'

// Helper type for Supabase insert operations
export type InsertData<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

// Helper type for Supabase update operations  
export type UpdateData<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// Helper type for Supabase row data
export type RowData<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

// Type guard for error handling
export function isPostgrestError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

// Helper to extract error message
export function getSupabaseErrorMessage(error: unknown): string {
  if (isPostgrestError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}
