/**
 * Order types that match the actual Supabase database schema
 * These types are generated based on the actual database structure
 */

import type { Database } from '@/types/supabase-generated'

// Base types from database
export type OrderRow = Database['public']['Tables']['orders']['Row']
export type OrderItemRow = Database['public']['Tables']['order_items']['Row']
export type OrderStatus = Database['public']['Enums']['order_status']

// Extended types with relations
export interface Order extends Omit<OrderRow, 'priority'> {
  items: OrderItem[]
  order_number?: string
  discount_amount?: number
  tax_rate?: number
  special_requirements?: string
  notes?: string
  priority: string | null
}

export interface OrderItem extends OrderItemRow {
  notes?: string
  recipe?: {
    id: string
    name: string
    price: number
    category: string
    servings: number
    description?: string
  }
}

// Form props
export interface OrderFormProps {
  order?: Order
  onSubmit: (data: OrderFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string
}

// Form data for creating/updating orders
export interface OrderFormData {
  order_number: string
  customer_name: string
  customer_phone?: string
  customer_address?: string
  status: string
  order_date: string
  delivery_date?: string
  delivery_time?: string
  delivery_fee: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  payment_method: string
  priority: string
  notes?: string
  special_instructions?: string
  items: Array<{
    recipe_id: string
    quantity: number
    unit_price: number
    total_price: number
    notes?: string
  }>
}

// Payment method type
export type PaymentMethod = 'cash' | 'transfer' | 'qris' | 'card' | 'ewallet'
