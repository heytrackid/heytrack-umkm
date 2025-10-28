import type { Json } from '../shared/common'

// Supplier-related types
export interface SuppliersTable {
  Row: {
    address: string | null
    contact_person: string | null
    created_at: string | null
    delivery_fee: number | null
    email: string | null
    id: string
    is_active: boolean | null
    last_order_date: string | null
    lead_time_days: number | null
    metadata: Json | null
    minimum_order: number | null
    name: string
    notes: string | null
    payment_terms: string | null
    phone: string | null
    rating: number | null
    total_orders: number | null
    total_spent: number | null
    updated_at: string | null
    user_id: string
  }
  Insert: {
    address?: string | null
    contact_person?: string | null
    created_at?: string | null
    delivery_fee?: number | null
    email?: string | null
    id?: string
    is_active?: boolean | null
    last_order_date?: string | null
    lead_time_days?: number | null
    metadata?: Json | null
    minimum_order?: number | null
    name: string
    notes?: string | null
    payment_terms?: string | null
    phone?: string | null
    rating?: number | null
    total_orders?: number | null
    total_spent?: number | null
    updated_at?: string | null
    user_id: string
  }
  Update: {
    address?: string | null
    contact_person?: string | null
    created_at?: string | null
    delivery_fee?: number | null
    email?: string | null
    id?: string
    is_active?: boolean | null
    last_order_date?: string | null
    lead_time_days?: number | null
    metadata?: Json | null
    minimum_order?: number | null
    name?: string
    notes?: string | null
    payment_terms?: string | null
    phone?: string | null
    rating?: number | null
    total_orders?: number | null
    total_spent?: number | null
    updated_at?: string | null
    user_id?: string
  }
  Relationships: []
}

// Type aliases for convenience
export type Supplier = SuppliersTable['Row']
export type SupplierInsert = SuppliersTable['Insert']
export type SupplierUpdate = SuppliersTable['Update']
