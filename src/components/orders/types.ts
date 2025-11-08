import type { Row, OrderStatus as OrderStatusEnum } from '@/types/database'

// Use generated types from Supabase

export type Order = Row<'orders'>
export type OrderItem = Row<'order_items'>
export type OrderStatus = OrderStatusEnum

// Order with items for display
export type OrderWithItems = Order & {
  order_items?: OrderItem[]
}

// Extended types for UI
export type PaymentStatus = 
  | 'PAID'
  | 'PARTIAL' 
  | 'UNPAID'

export type Priority = 
  | 'high'
  | 'low' 
  | 'normal' 
  | 'urgent'

export interface OrderFormItem {
  id?: string
  order_id?: string
  recipe_id: string
  product_name: string | null
  quantity: number
  unit_price: number
  total_price: number
  special_requests: string | null
  updated_at?: string | null
  user_id?: string
}

export interface OrderFormData {
  customer_name: string
  customer_phone: string
  customer_address?: string | null
  delivery_date: string
  delivery_time: string
  priority: Priority | null
  notes?: string | null
  order_items: OrderFormItem[]
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  averageOrderValue: number
}

export interface StatusInfo {
  label: string
  color: string
}

export interface OrderFilters {
  status: string
  paymentStatus: string
  priority: string
  dateFrom?: string
  dateTo?: string
  searchTerm: string
}
