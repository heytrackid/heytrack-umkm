import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { createClient } from '@/utils/supabase/client'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('ClientFile')


/**
 * Consolidated Supabase Client Utilities
 * Single source for all Supabase client operations and utilities
 */


// ============================================================================
// TYPE UTILITIES
// ============================================================================

// Import types from database
type Tables = Database['public']['Tables']
type TableName = keyof Tables
type TableRow<T extends TableName> = Tables[T]['Row']
type TableInsert<T extends TableName> = Tables[T]['Insert']
type TableUpdate<T extends TableName> = Tables[T]['Update']

// Query Result Types
export interface QueryResult<T> {
  data: T | null
  error: Error | null
}

export interface QueryArrayResult<T> {
  data: T[] | null
  error: Error | null
}

// ============================================================================
// TYPED CRUD OPERATIONS
// ============================================================================

/**
 * Generic insert wrapper with proper typing
 */
export async function typedInsert<T extends TableName>(
  supabase: SupabaseClient<Database>,
  table: T,
  data: TableInsert<T> | Array<TableInsert<T>>
) {
  const result = await supabase
    .from(table)
    .insert(data as never)
    .select()

  // Log error if there's one, but don't crash the function
  if (result.error) {
    logger.error({
      table,
      operation: 'insert',
      error: result.error,
      data
    }, 'Supabase insert error')
  }

  return result as {
    data: Array<TableRow<T>> | null
    error: Error | null
  }
}

/**
 * Generic update wrapper with proper typing
 */
export async function typedUpdate<T extends TableName>(
  supabase: SupabaseClient<Database>,
  table: T,
  id: string,
  data: Partial<TableUpdate<T>>
) {
  const result = await supabase
    .from(table)
    .update(data as never)
    .eq('id', id as never)
    .select()

  // Log error if there's one, but don't crash the function
  if (result.error) {
    logger.error({
      table,
      operation: 'update',
      id,
      error: result.error,
      data
    }, 'Supabase update error')
  }

  return result as {
    data: Array<TableRow<T>> | null
    error: Error | null
  }
}

/**
 * Generic delete wrapper with proper typing
 */
export async function typedDelete<T extends TableName>(
  supabase: SupabaseClient<Database>,
  table: T,
  id: string
) {
  const result = await supabase
    .from(table)
    .delete()
    .eq('id', id as never)
    .select()

  // Log error if there's one, but don't crash the function
  if (result.error) {
    logger.error({
      table,
      operation: 'delete',
      id,
      error: result.error
    }, 'Supabase delete error')
  }

  return result as {
    data: Array<TableRow<T>> | null
    error: Error | null
  }
}

/**
 * Generic select wrapper with proper typing
 */
export async function typedSelect<T extends TableName>(
  supabase: SupabaseClient<Database>,
  table: T,
  query?: {
    select?: string
    filter?: Record<string, unknown>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
    single?: boolean
  }
) {
  let queryBuilder = supabase.from(table).select(query?.select ?? '*')

  // Apply filters
  if (query?.filter) {
    Object.entries(query.filter).forEach(([key, value]) => {
      if (value === undefined) {return}
      const column = key
      if (value === null) {
        queryBuilder = queryBuilder.is(column as never, null)
      } else {
        queryBuilder = queryBuilder.eq(column as never, value as never)
      }
    })
  }

  // Apply ordering
  if (query?.orderBy) {
    queryBuilder = queryBuilder.order(query.orderBy.column, {
      ascending: query.orderBy.ascending ?? true
    })
  }

  // Apply limit
  if (query?.limit) {
    queryBuilder = queryBuilder.limit(query.limit)
  }

  const result = query?.single
    ? await queryBuilder.single()
    : await queryBuilder

  // Log error if there's one, but don't crash the function
  if ('error' in result && result.error) {
    logger.error({
      table,
      operation: 'select',
      query,
      error: result.error
    }, 'Supabase select error')
  }

  return result as {
    data: TableRow<T> | Array<TableRow<T>> | null
    error: Error | null
  }
}

// ============================================================================
// CLIENT INSTANCES
// ============================================================================

/**
 * Get Supabase client instance (client-side)
 */
export function getSupabaseClient() {
  return createClient()
}

/**
 * Update session middleware utility
 */
export { updateSession } from '@/utils/supabase/middleware'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch (_error) {
    return false
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const supabase = getSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {throw error}
    return user
  } catch (_err) {
    return null
  }
}

/**
 * Sign out user
 */
export async function signOut() {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) {throw error}
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  Database,
  TableName,
  TableRow,
  TableInsert,
  TableUpdate
}
