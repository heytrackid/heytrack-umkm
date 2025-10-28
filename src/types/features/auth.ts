/**
 * Auth Feature Types
 * Re-exported from Supabase generated types
 */

import type { Database } from '@/types/supabase-generated'

// Re-export table types from generated
export type UserProfilesTable = Database['public']['Tables']['user_profiles']

// Convenience aliases
export type UserProfile = UserProfilesTable['Row']
export type UserProfileInsert = UserProfilesTable['Insert']
export type UserProfileUpdate = UserProfilesTable['Update']

// Re-export enums from generated
export type UserRole = Database['public']['Enums']['user_role']
export type BusinessUnit = Database['public']['Enums']['business_unit']

// Business logic types (not table types)
export interface SecurityContext {
  user_id: string
  role: UserRole
  business_unit: BusinessUnit
  permissions: string[]
}

export interface AuditFields {
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}
