/**
 * Order types that match the actual Supabase database schema
 * These types are generated based on the actual database structure
 */

import type { OrdersTable, OrderItemsTable, OrderStatus, PaymentMethod } from '@/types/database'

// Base types from database
export type OrderRow = OrdersTable
export type OrderItemRow = OrderItemsTable
export type { OrderStatus, PaymentMethod }

// Backwards compatible aliases
export type Order = OrderRow
export // type OrderItem = OrderItemRow

// Extended types with relations for UI
export interface OrderWithItems extends OrderRow {
  items: OrderItemWithRecipe[]
}

export interface OrderItemWithRecipe extends OrderItemRow {
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
  order?: OrderWithItems
  onSubmit: (data: OrderFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string
}

// Form data for creating/updating orders
export interface OrderFormData {
  order_no: string
  customer_name: string
  customer_phone?: string
  customer_address?: string
  status: OrderStatus  // Use database enum
  order_date: string
  delivery_date?: string
  delivery_time?: string
  delivery_fee: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  payment_method: PaymentMethod  // Use database enum
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
