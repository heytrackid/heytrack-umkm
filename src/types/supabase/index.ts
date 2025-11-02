

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
export * from './common'
export * from './enums'

// For now, re-export from the original generated file
// TODO: Gradually migrate tables to modular structure
export type { Database, Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes } from '../supabase-generated'
