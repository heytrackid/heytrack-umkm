export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'READY' 
  | 'DELIVERED' 
  | 'CANCELLED'

export type PaymentStatus = 
  | 'UNPAID' 
  | 'PARTIAL' 
  | 'PAID'

export type Priority = 
  | 'low' 
  | 'normal' 
  | 'high'

export interface OrderItem {
  id: string
  recipe_id: string
  product_name: string
  quantity: number
  price: number
  notes?: string
}

export interface Order {
  id: string
  order_no: string
  customer_name: string
  customer_phone?: string
  customer_email?: string
  customer_address?: string
  delivery_date: string
  delivery_time?: string
  status: OrderStatus
  payment_status: PaymentStatus
  priority: Priority
  total_amount?: number
  notes?: string
  order_items?: OrderItem[]
  created_at?: string
  updated_at?: string
}

export interface OrderFormData {
  customer_name: string
  customer_phone: string
  customer_email?: string
  customer_address?: string
  delivery_date: string
  delivery_time: string
  priority: Priority
  notes?: string
  order_items: Omit<OrderItem, 'id'>[]
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