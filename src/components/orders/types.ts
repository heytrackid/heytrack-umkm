// Use generated types from Supabase
import type { Database } from '@/types/supabase-generated'

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderStatus = Database['public']['Enums']['order_status']

// Extended types for UI
export type PaymentStatus = 
  | 'UNPAID' 
  | 'PARTIAL' 
  | 'PAID'

export type Priority = 
  | 'low' 
  | 'normal' 
  | 'high'

export interface OrderFormData {
  customer_name: string
  customer_phone: string
  customer_address?: string
  delivery_date: string
  delivery_time: string
  priority: Priority
  notes?: string
  order_items: Array<Omit<OrderItem, 'id'>>
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