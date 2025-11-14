import type { Database as GeneratedDatabase } from '@/types/supabase-generated'

/**
 * Database Type Configuration
 *
 * This file provides a flexible Database type that works with Supabase
 * without strict PostgrestVersion checking that causes type errors.
 */

/**
 * Full Database type with PostgrestVersion
 */
export type Database = GeneratedDatabase

/**
 * Development-friendly Database type that bypasses RLS type constraints
 * Use this for client-side operations where RLS is handled at runtime
 */
export type DatabaseDev = {
  public: {
    Tables: GeneratedDatabase['public']['Tables']
    Views: GeneratedDatabase['public']['Views']
    Functions: GeneratedDatabase['public']['Functions']
    Enums: GeneratedDatabase['public']['Enums']
    CompositeTypes: GeneratedDatabase['public']['CompositeTypes']
  }
}

/**
 * Type helper to bypass RLS type constraints during development
 * Use this when TypeScript infers 'never' due to RLS policies
 */
export type BypassRLS<T> = any

/**
 * Database type override that removes RLS constraints for development
 * This allows TypeScript to work properly while runtime RLS still functions
 */
export type DatabaseNoRLS = {
  public: {
    Tables: {
      [K in keyof GeneratedDatabase['public']['Tables']]: {
        Row: GeneratedDatabase['public']['Tables'][K]['Row']
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
    Views: GeneratedDatabase['public']['Views']
    Functions: GeneratedDatabase['public']['Functions']
    Enums: GeneratedDatabase['public']['Enums']
    CompositeTypes: GeneratedDatabase['public']['CompositeTypes']
  }
}

/**
 * Simple type assertion helper for database operations
 * Use this instead of 'as any' for better type safety
 */
export function asDbValue<T>(value: any): T {
  return value as T
}

/**
 * Re-export all types from database.ts for convenience
 */
export type * from './database'
