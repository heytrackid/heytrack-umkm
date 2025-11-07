

/**
 * Common Supabase Types
 * Shared types used across all table definitions
 */

export type Json =
  Json[] | boolean | number | string | { [key: string]: Json | undefined } | null

export interface DatabaseInternals {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
}
