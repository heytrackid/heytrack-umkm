import type { Row, TablesInsert as SupabaseTablesInsert, TablesUpdate as SupabaseTablesUpdate, Database, Tables } from '@/types/database'


/**
 * Helper untuk typed inserts ke Supabase
 * Workaround untuk issue dengan Supabase type inference
 */


// Helper type untuk extract Insert types - re-export from database.ts
export type TablesInsert<T extends keyof Database['public']['Tables']> = SupabaseTablesInsert<T>
export type TablesUpdate<T extends keyof Database['public']['Tables']> = SupabaseTablesUpdate<T>
export type TablesRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

/**
 * Type-safe insert helper
 * Menggunakan type assertion yang aman untuk bypass Supabase type inference issue
 */
export function typedInsert<T extends keyof Database['public']['Tables']>(
  data: TablesInsert<T>
): TablesInsert<T> {
  return data
}

/**
 * Type-safe update helper
 */
export function typedUpdate<T extends keyof Database['public']['Tables']>(
  data: TablesUpdate<T>
): TablesUpdate<T> {
  return data
}
