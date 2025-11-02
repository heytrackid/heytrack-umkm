

/**
 * Common Supabase Types
 * Shared types used across all table definitions
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface DatabaseInternals {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
}
