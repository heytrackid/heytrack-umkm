import type { Json } from './common'

// Auth-related types
export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  role: UserRole
  business_unit: BusinessUnit
  permissions: string[]
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface SecurityContext {
  user_id: string
  role: UserRole
  business_unit: BusinessUnit
  permissions: string[]
}

// Helper types for RLS policies
export interface AuditFields {
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

// Enums used in auth
export type UserRole = "admin" | "user"
export type BusinessUnit = "all"

// Database table types for auth
export type UserProfilesTable = {
  Row: {
    business_unit: BusinessUnit | null
    created_at: string | null
    created_by: string | null
    email: string
    full_name: string
    id: string
    is_active: boolean | null
    last_login: string | null
    permissions: string[] | null
    role: UserRole | null
    updated_at: string | null
    user_id: string
  }
  Insert: {
    business_unit?: BusinessUnit | null
    created_at?: string | null
    created_by?: string | null
    email: string
    full_name: string
    id?: string
    is_active?: boolean | null
    last_login?: string | null
    permissions?: string[] | null
    role?: UserRole | null
    updated_at?: string | null
    user_id: string
  }
  Update: {
    business_unit?: BusinessUnit | null
    created_at?: string | null
    created_by?: string | null
    email?: string
    full_name?: string
    id?: string
    is_active?: boolean | null
    last_login?: string | null
    permissions?: string[] | null
    role?: UserRole | null
    updated_at?: string | null
    user_id?: string
  }
  Relationships: []
}
