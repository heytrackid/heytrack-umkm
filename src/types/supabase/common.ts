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

export type DatabaseInternals = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
}
