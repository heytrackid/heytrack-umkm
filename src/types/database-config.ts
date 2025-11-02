import type { Database as GeneratedDatabase } from './supabase-generated'




/**
 * Database Type Configuration
 * 
 * This file provides a flexible Database type that works with Supabase
 * without strict PostgrestVersion checking that causes type errors.
 */


/**
 * Flexible Database type without strict PostgrestVersion
 * This allows proper typing without 'as any' workarounds
 */
export type Database = Omit<GeneratedDatabase, '__InternalSupabase'>

/**
 * Re-export all types from database.ts for convenience
 */
export type * from './database'
