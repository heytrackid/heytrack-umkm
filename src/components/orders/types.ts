// Use generated types from Supabase
import type { OrdersTable, OrderItemsTable, OrderStatus as OrderStatusEnum } from '@/types/database'

export type Order = OrdersTable
export type OrderItem = OrderItemsTable
export type OrderStatus = OrderStatusEnum

// Extended types for UI
export type PaymentStatus = 
  | 'UNPAID' 
  | 'PARTIAL' 
  | 'PAID'

export type Priority = 
  | 'low' 
  | 'normal' 
  | 'high'
  | 'urgent'

export interface OrderFormData {
  customer_name: string
  customer_phone: string
  customer_address?: string | null
  delivery_date: string
  delivery_time: string
  priority: Priority | null
  notes?: string | null
  order_items: Array<{
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
  }>
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