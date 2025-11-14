

/**
 * Modular Supabase Types
 * 
 * This is a modular alternative to the monolithic supabase-generated.ts
 * 
 * Usage:
 * - Import from '@/types/supabase' instead of '@/types/supabase-generated'
 * - Or import specific modules: '@/types/supabase/enums', '@/types/supabase/tables/recipes'
 * 
 * Structure:
 * - common.ts: Shared types (Json, etc)
 * - enums.ts: All database enums
 * - tables/: Individual table definitions by domain
 * - views/: Database views
 * - functions.ts: Database functions
 */

// Re-export everything for backward compatibility
export type * from '@/types/supabase/common'
export * from './enums'

// For now, re-export from the original generated file
// Gradually migrate tables to modular structure
export type { Database, Enums, Insert, Row, Update } from '@/types/database'

