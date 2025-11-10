

// Common types used across the database schema
export type Json =
  Json[] | boolean | number | string | { [key: string]: Json | undefined } | null
