/**
 * Comprehensive Typed Supabase Client
 * Manual type definitions to overcome Supabase type inference limitations
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/database'

// ============================================================================
// Type Utilities
// ============================================================================

type TableName = keyof Database['public']['Tables']
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert']
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update']

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
// Typed CRUD Operations
// ============================================================================

export class TypedSupabaseClient {
  constructor(private supabase: SupabaseClient<Database>) {}

  // --------------------------------------------------------------------------
  // SELECT Operations
  // --------------------------------------------------------------------------

  async selectOne<T extends TableName>(
    table: T,
    id: string
  ): Promise<QueryResult<TableRow<T>>> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq('id', id as any)
        .single()

      return {
        data: data as unknown as TableRow<T> | null,
        error: error as Error | null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async selectAll<T extends TableName>(
    table: T,
    filters?: Record<string, any>
  ): Promise<QueryArrayResult<TableRow<T>>> {
    try {
      let query = this.supabase.from(table).select('*')

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value) as any
        })
      }

      const { data, error } = await query

      return {
        data: data as unknown as TableRow<T>[] | null,
        error: error as Error | null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async selectWithQuery<T extends TableName>(
    table: T,
    queryString: string,
    filters?: Record<string, any>
  ): Promise<QueryArrayResult<any>> {
    try {
      let query = this.supabase.from(table).select(queryString)

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value) as any
        })
      }

      const { data, error } = await query

      return {
        data: data as any[] | null,
        error: error as Error | null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  // --------------------------------------------------------------------------
  // INSERT Operations
  // --------------------------------------------------------------------------

  async insert<T extends TableName>(
    table: T,
    data: Partial<TableInsert<T>>
  ): Promise<QueryResult<TableRow<T>>> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data as any)
        .select()
        .single()

      return {
        data: result as unknown as TableRow<T> | null,
        error: error as Error | null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async insertMany<T extends TableName>(
    table: T,
    data: Partial<TableInsert<T>>[]
  ): Promise<QueryArrayResult<TableRow<T>>> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data as any)
        .select()

      return {
        data: result as unknown as TableRow<T>[] | null,
        error: error as Error | null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  // --------------------------------------------------------------------------
  // UPDATE Operations
  // --------------------------------------------------------------------------

  async update<T extends TableName>(
    table: T,
    id: string,
    data: Partial<TableUpdate<T>>
  ): Promise<QueryResult<TableRow<T>>> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .update(data as any)
        .eq('id', id as any)
        .select()
        .single()

      return {
        data: result as unknown as TableRow<T> | null,
        error: error as Error | null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  async updateMany<T extends TableName>(
    table: T,
    filters: Record<string, any>,
    data: Partial<TableUpdate<T>>
  ): Promise<QueryArrayResult<TableRow<T>>> {
    try {
      let query = this.supabase
        .from(table)
        .update(data as any)

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value) as any
      })

      const { data: result, error } = await query.select()

      return {
        data: result as unknown as TableRow<T>[] | null,
        error: error as Error | null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  // --------------------------------------------------------------------------
  // DELETE Operations
  // --------------------------------------------------------------------------

  async delete<T extends TableName>(
    table: T,
    id: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id as any)

      return {
        error: error as Error | null
      }
    } catch (error) {
      return {
        error: error as Error
      }
    }
  }

  async deleteMany<T extends TableName>(
    table: T,
    filters: Record<string, any>
  ): Promise<{ error: Error | null }> {
    try {
      let query = this.supabase.from(table).delete()

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value) as any
      })

      const { error } = await query

      return {
        error: error as Error | null
      }
    } catch (error) {
      return {
        error: error as Error
      }
    }
  }

  // --------------------------------------------------------------------------
  // Utility Methods
  // --------------------------------------------------------------------------

  async count<T extends TableName>(
    table: T,
    filters?: Record<string, any>
  ): Promise<{ count: number; error: Error | null }> {
    try {
      let query = this.supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value) as any
        })
      }

      const { count, error } = await query

      return {
        count: count ?? 0,
        error: error as Error | null
      }
    } catch (error) {
      return {
        count: 0,
        error: error as Error
      }
    }
  }

  async exists<T extends TableName>(
    table: T,
    id: string
  ): Promise<{ exists: boolean; error: Error | null }> {
    try {
      const { count, error } = await this.supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('id', id as any)

      return {
        exists: (count ?? 0) > 0,
        error: error as Error | null
      }
    } catch (error) {
      return {
        exists: false,
        error: error as Error
      }
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createTypedClient(supabase: SupabaseClient<Database>): TypedSupabaseClient {
  return new TypedSupabaseClient(supabase)
}

// Type guards
export function isQueryError(result: QueryResult<any> | QueryArrayResult<any>): result is { data: null; error: Error } {
  return result.error !== null
}

export function hasData<T>(result: QueryResult<T>): result is { data: T; error: null } {
  return result.data !== null && result.error === null
}

export function hasArrayData<T>(result: QueryArrayResult<T>): result is { data: T[]; error: null } {
  return result.data !== null && result.error === null
}

// Cast helpers for complex queries
export function castToTableRow<T extends TableName>(data: any): TableRow<T> {
  return data as TableRow<T>
}

export function castToTableRows<T extends TableName>(data: any[]): TableRow<T>[] {
  return data as TableRow<T>[]
}
