/**
 * Auth Feature Types
 * Re-exported from Supabase generated types
 */

import type { 
  UserProfilesTable as UserProfilesTableType,
  UserProfilesInsert,
  UserProfilesUpdate,
  UserRole as UserRoleEnum,
  BusinessUnit as BusinessUnitEnum
} from '@/types/database'

// Re-export table types from generated
export type UserProfilesTable = UserProfilesTableType

// Convenience aliases
export type UserProfile = UserProfilesTable
export type UserProfileInsert = UserProfilesInsert
export type UserProfileUpdate = UserProfilesUpdate

// Re-export enums from generated

export type UserRole = UserRoleEnum
export type BusinessUnit = BusinessUnitEnum

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
