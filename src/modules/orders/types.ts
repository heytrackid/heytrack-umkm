// Orders Domain Types
// Comprehensive type definitions for order management system
// Uses generated Supabase types as base

import type { Database } from '@/types/supabase-generated'

// Table helpers for convenience
export type CustomersTable = Database['public']['Tables']['customers']
export type OrdersTable = Database['public']['Tables']['orders']
export type OrderItemsTable = Database['public']['Tables']['order_items']
export type PaymentsTable = Database['public']['Tables']['payments']

// Use generated types from Supabase
export type Customer = CustomersTable['Row']
export type CustomerInsert = CustomersTable['Insert']
export type CustomerUpdate = CustomersTable['Update']

export type OrderItem = OrderItemsTable['Row']
export type OrderItemInsert = OrderItemsTable['Insert']
export type OrderItemUpdate = OrderItemsTable['Update']

export type Order = OrdersTable['Row']
export type OrderInsert = OrdersTable['Insert']
export type OrderUpdate = OrdersTable['Update']

// Type aliases for enums from database
export type OrderStatus = Database['public']['Enums']['order_status']
export type PaymentMethod = Database['public']['Enums']['payment_method']

// Custom types (not in database enums)
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED'
export type DeliveryMethod = 'PICKUP' | 'DELIVERY' | 'DINE_IN'

// Extended types with relations for UI
export interface OrderItemWithRecipe extends OrderItem {
  recipe?: {
    id: string
    name: string
    price: number
    category: string
    servings: number
    description?: string
  }
}

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

// Extended Order type with relations for UI
export interface OrderWithRelations extends Order {
  customer?: Customer
  items?: OrderItemWithRecipe[]
  payments?: Payment[]
}

// Service types for order-recipe operations
export interface RecipeOption {
  id: string
  name: string
  category: string
  servings: number
  description?: string | null
  price: number
  hpp_cost: number
  margin: number
  is_available: boolean
  estimated_prep_time: number
}

export interface OrderItemCalculation {
  recipe_id: string
  recipe_name: string
  quantity: number
  unit_price: number
  total_price: number
  estimated_cost: number
  total_cost: number
  profit: number
  margin_percentage: number
}

export interface OrderPricing {
  items: OrderItemCalculation[]
  subtotal: number
  tax_amount: number
  tax_rate: number
  discount_amount: number
  total_amount: number
  total_estimated_cost: number
  total_profit: number
  overall_margin: number
}

// API Response types
export interface CreateOrderRequest {
  customer_name: string
  customer_phone?: string
  customer_email?: string
  customer_address?: string
  customer_id?: string
  
  due_date: string
  delivery_method: DeliveryMethod
  delivery_address?: string
  delivery_fee?: number
  
  items: Array<{
    recipe_id: string
    quantity: number
    unit_price?: number // Optional, will be calculated if not provided
    notes?: string
  }>
  
  tax_rate?: number
  discount_amount?: number
  discount_percentage?: number
  
  notes?: string
  internal_notes?: string
  special_requirements?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  status?: OrderStatus
}

export interface OrderFilters {
  status?: OrderStatus[]
  payment_status?: PaymentStatus[]
  delivery_method?: DeliveryMethod[]
  priority?: Array<'low' | 'normal' | 'high' | 'urgent'>
  date_from?: string
  date_to?: string
  customer_search?: string
  order_no_search?: string
  min_amount?: number
  max_amount?: number
}

export interface OrderStats {
  total_orders: number
  pending_orders: number
  confirmed_orders: number
  in_production_orders: number
  completed_orders: number
  cancelled_orders: number
  
  total_revenue: number
  pending_revenue: number
  paid_revenue: number
  
  average_order_value: number
  total_customers: number
  repeat_customers: number
  
  // Period comparison
  period_growth: number
  revenue_growth: number
  order_growth: number
}

export interface OrderAnalytics {
  daily_orders: Array<{
    date: string
    orders: number
    revenue: number
  }>
  
  popular_products: Array<{
    recipe_id: string
    recipe_name: string
    quantity_sold: number
    revenue: number
  }>
  
  customer_insights: Array<{
    customer_name: string
    total_orders: number
    total_spent: number
    last_order: string
  }>
  
  payment_methods: Array<{
    method: PaymentMethod
    count: number
    percentage: number
  }>
  
  delivery_methods: Array<{
    method: DeliveryMethod
    count: number
    percentage: number
  }>
}

// UI Component Props
export interface OrderFormProps {
  order?: OrderWithRelations
  onSubmit: (data: CreateOrderRequest | UpdateOrderRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string
}

export interface OrderDetailProps {
  order: OrderWithRelations
  onEdit: (order: OrderWithRelations) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>
  onAddPayment: (orderId: string, payment: PaymentInsert) => Promise<void>
  loading?: boolean
}

export interface OrdersListProps {
  orders: OrderWithRelations[]
  loading?: boolean
  onEdit: (order: OrderWithRelations) => void
  onView: (order: OrderWithRelations) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>
  filters: OrderFilters
  onFiltersChange: (filters: OrderFilters) => void
}

// Hook return types
export interface UseOrdersDataReturn {
  orders: OrderWithRelations[]
  loading: boolean
  error: string | null
  stats: OrderStats | null
  refetch: () => Promise<void>
  updateOrder: (orderId: string, data: UpdateOrderRequest) => Promise<void>
  deleteOrder: (orderId: string) => Promise<void>
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>
}

export interface UseOrderFormReturn {
  formData: CreateOrderRequest
  updateFormData: <K extends keyof CreateOrderRequest>(field: K, value: CreateOrderRequest[K]) => void
  addItem: () => void
  updateItem: <K extends keyof OrderItem>(index: number, field: K, value: OrderItem[K]) => void
  removeItem: (index: number) => void
  calculateTotals: () => {
    subtotal: number
    tax_amount: number
    total_amount: number
  }
  validateForm: () => { isValid: boolean; errors: string[] }
  resetForm: () => void
}

// Constants
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Menunggu Konfirmasi',
  CONFIRMED: 'Dikonfirmasi', 
  IN_PROGRESS: 'Sedang Diproduksi',
  READY: 'Siap Diambil',
  DELIVERED: 'Selesai',
  CANCELLED: 'Dibatalkan'
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Belum Dibayar',
  PARTIAL: 'Dibayar Sebagian',
  PAID: 'Lunas',
  REFUNDED: 'Dikembalikan'
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Tunai',
  BANK_TRANSFER: 'Transfer Bank',
  CREDIT_CARD: 'Kartu Kredit',
  DIGITAL_WALLET: 'E-Wallet',
  OTHER: 'Lainnya'
}

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  PICKUP: 'Ambil Sendiri',
  DELIVERY: 'Diantar',
  DINE_IN: 'Dine In'
}
