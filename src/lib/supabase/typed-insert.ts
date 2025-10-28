/**
 * Helper untuk typed inserts ke Supabase
 * Workaround untuk issue dengan Supabase type inference
 */

import type { Database } from '@/types/supabase-generated'

// Helper type untuk extract Insert types
export type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

export type TablesRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

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
