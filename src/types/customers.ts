import type { Json } from './common'

// Customer-related types
export type CustomersTable = {
  Row: {
    address: string | null
    created_at: string | null
    created_by: string | null
    customer_type: string | null
    discount_percentage: number | null
    email: string | null
    favorite_items: Json | null
    id: string
    is_active: boolean | null
    last_order_date: string | null
    loyalty_points: number | null
    name: string
    notes: string | null
    phone: string | null
    total_orders: number | null
    total_spent: number | null
    updated_at: string | null
    updated_by: string | null
  }
  Insert: {
    address?: string | null
    created_at?: string | null
    created_by?: string | null
    customer_type?: string | null
    discount_percentage?: number | null
    email?: string | null
    favorite_items?: Json | null
    id?: string
    is_active?: boolean | null
    last_order_date?: string | null
    loyalty_points?: number | null
    name: string
    notes?: string | null
    phone?: string | null
    total_orders?: number | null
    total_spent?: number | null
    updated_at?: string | null
    updated_by?: string | null
  }
  Update: {
    address?: string | null
    created_at?: string | null
    created_by?: string | null
    customer_type?: string | null
    discount_percentage?: number | null
    email?: string | null
    favorite_items?: Json | null
    id?: string
    is_active?: boolean | null
    last_order_date?: string | null
    loyalty_points?: number | null
    name?: string
    notes?: string | null
    phone?: string | null
    total_orders?: number | null
    total_spent?: number | null
    updated_at?: string | null
    updated_by?: string | null
  }
  Relationships: []
}
