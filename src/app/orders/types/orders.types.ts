import type { Row, OrderStatus, PaymentMethod } from '@/types/database'

// Orders module types and interfaces with multi-currency support
// Use generated types from Supabase as base
export type Order = Row<'orders'>
export type OrderItem = Row<'order_items'>

// Re-export enums for external use
export type { OrderStatus, PaymentMethod }

// Extended Order type with relations for UI

export interface OrderWithRelations extends Order {
  items: OrderItem[]
  customer?: Row<'customers'>
  payments?: OrderPayment[]
}

// Payment tracking
export interface OrderPayment {
  id: string
  order_id: string
  amount: number
  currency: string
  payment_method: PaymentMethod
  payment_date: string
  reference_number?: string // Bank transfer reference, etc.
  notes?: string
  created_at: string
}

// Import types from config to ensure consistency
// Note: Using the Supabase enum type instead of locally defined ones
// export type OrderStatus = 
//   | 'draft'
//   | 'confirmed'
//   | 'payment_pending'
//   | 'paid'
//   | 'in_production'
//   | 'ready'
//   | 'delivered'
//   | 'cancelled'
//   | 'refunded'

export type OrderPriority =
  | 'high'
  | 'low'
  | 'normal'
  | 'urgent'

// export type PaymentMethod = 
//   | 'cash'
//   | 'bank_transfer'
//   | 'card'
//   | 'qris'
//   | 'ewallet'
//   | 'check'
//   | 'credit'

// Order creation and update interfaces
export interface CreateOrderData {
  customer_id: string
  customer_name: string
  currency?: string // Allow currency selection
  priority?: OrderPriority
  delivery_date?: string
  payment_method?: PaymentMethod
  payment_terms_days?: number
  
  // Tax configuration
  tax_enabled?: boolean
  tax_rate?: number
  tax_inclusive?: boolean
  
  // Additional amounts
  discount_amount?: number
  shipping_amount?: number
  advance_payment_amount?: number
  
  notes?: string
  internal_notes?: string
  tags?: string[]
  items: CreateOrderItemData[]
}

export interface CreateOrderItemData {
  recipe_id: string
  quantity: number
  unit_price?: number // Allow price override
  currency?: string
  tax_rate?: number // Item-specific tax rate
  discount_amount?: number // Item-specific discount
  notes?: string
}

export interface UpdateOrderData extends Partial<CreateOrderData> {
  status?: OrderStatus
  payment_status?: 'paid' | 'partial' | 'refunded' | 'unpaid'
}

// Order summary for dashboards with multi-currency support
export interface OrderSummary {
  total_orders: number
  total_revenue: number
  revenue_by_currency: Record<string, number>
  pending_orders: number
  completed_orders: number
  cancelled_orders: number
  average_order_value: number
  top_selling_items: Array<{
    recipe_id: string
    recipe_name: string
    quantity_sold: number
    revenue: number
  }>
}

// Order filters for listing and search with multi-currency support
export interface OrderFilters {
  status?: OrderStatus[]
  priority?: OrderPriority[]
  customer_id?: string
  currency?: string[]
  payment_status?: Array<'paid' | 'partial' | 'refunded' | 'unpaid'>
  payment_method?: PaymentMethod[]
  date_from?: string
  date_to?: string
  delivery_date_from?: string
  delivery_date_to?: string
  min_amount?: number
  max_amount?: number
  tags?: string[]
  search?: string
}

// Order analytics interfaces with multi-currency support
export interface OrderAnalytics {
  revenue_trend: Array<{
    date: string
    revenue: number
    revenue_by_currency: Record<string, number>
    orders_count: number
    average_order_value: number
  }>
  top_products: Array<{
    recipe_id: string
    recipe_name: string
    quantity_sold: number
    revenue: number
    revenue_by_currency: Record<string, number>
  }>
  status_distribution: Record<OrderStatus, number>
  priority_distribution: Record<OrderPriority, number>
  payment_method_distribution: Record<PaymentMethod, number>
  currency_distribution: Record<string, {
    orders_count: number
    total_revenue: number
    average_order_value: number
  }>
  tax_summary: {
    total_tax_collected: number
    tax_by_currency: Record<string, number>
    tax_exempt_orders: number
  }
}

// Order workflow types
export interface OrderStatusTransition {
  from_status: OrderStatus
  to_status: OrderStatus
  timestamp: string
  user_id?: string
  reason?: string
  automated?: boolean // Whether transition was automated
}

// Currency conversion interface
export interface CurrencyConversion {
  from_currency: string
  to_currency: string
  exchange_rate: number
  converted_amount: number
  conversion_date: string
}

// Order totals breakdown
export interface OrderTotalsBreakdown {
  items_subtotal: number
  discount_amount: number
  taxable_amount: number
  tax_amount: number
  shipping_amount: number
  total_amount: number
  currency: string
  tax_rate: number
  tax_inclusive: boolean
  conversions?: CurrencyConversion[] // If order has multi-currency items
}

// Invoice generation data
export interface InvoiceData {
  order: Order
  company_info?: {
    name: string
    address: string
    phone: string
    email: string
    tax_id?: string
  }
  totals_breakdown: OrderTotalsBreakdown
  payment_terms: string
  due_date: string
   invoice_number: string
   notes?: string | null | undefined
 }

// Order validation errors
export interface OrderValidationError {
  field: string
  message: string
  code: string
}

// Order export formats
export type OrderExportFormat = 'csv' | 'excel' | 'json' | 'pdf'

export interface OrderExportOptions {
  format: OrderExportFormat
  filters?: OrderFilters
  include_items?: boolean
  include_customer_details?: boolean
  include_payments?: boolean
  currency?: string // Convert all amounts to specific currency
  date_range?: {
    start: string
    end: string
  }
}
