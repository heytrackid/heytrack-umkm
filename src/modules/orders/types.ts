// Orders Domain Types
// Comprehensive type definitions for order management system

export type OrderStatus = 
  | 'draft'         // Order sedang dibuat
  | 'pending'       // Menunggu konfirmasi
  | 'confirmed'     // Dikonfirmasi, siap produksi
  | 'in_production' // Sedang diproduksi
  | 'ready'         // Siap diambil/dikirim  
  | 'completed'     // Selesai/sudah diambil
  | 'cancelled'     // Dibatalkan

export type PaymentStatus = 
  | 'unpaid'        // Belum dibayar
  | 'partial'       // Dibayar sebagian (DP)
  | 'paid'          // Lunas
  | 'refunded'      // Dikembalikan

export type PaymentMethod = 
  | 'cash'          // Tunai
  | 'transfer'      // Transfer bank
  | 'qris'          // QRIS
  | 'card'          // Kartu kredit/debit
  | 'ewallet'       // E-wallet (GoPay, OVO, dll)

export type DeliveryMethod = 
  | 'pickup'        // Ambil sendiri
  | 'delivery'      // Diantar
  | 'shipping'      // Dikirim via ekspedisi

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  recipe_id: string
  recipe?: {
    id: string
    name: string
    price: number
    category: string
    servings: number
    description?: string
  }
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  order_id: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id?: string
  customer?: Customer
  customer_name: string
  customer_phone?: string
  customer_email?: string
  customer_address?: string
  
  // Order details
  order_number: string
  status: OrderStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  
  // Timing
  order_date: string
  due_date: string
  delivery_date?: string
  completed_date?: string
  
  // Items and pricing
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  tax_rate: number
  discount_amount: number
  discount_percentage: number
  total_amount: number
  
  // Payment
  payments: Payment[]
  payment_status: PaymentStatus
  paid_amount: number
  remaining_amount: number
  
  // Delivery
  delivery_method: DeliveryMethod
  delivery_address?: string
  delivery_fee: number
  delivery_notes?: string
  
  // Additional info
  notes?: string
  internal_notes?: string
  special_requirements?: string
  
  // Metadata
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
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
  priority?: ('low' | 'normal' | 'high' | 'urgent')[]
  date_from?: string
  date_to?: string
  customer_search?: string
  order_number_search?: string
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
  order?: Order
  onSubmit: (data: CreateOrderRequest | UpdateOrderRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string
}

export interface OrderDetailProps {
  order: Order
  onEdit: (order: Order) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>
  onAddPayment: (orderId: string, payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  loading?: boolean
}

export interface OrdersListProps {
  orders: Order[]
  loading?: boolean
  onEdit: (order: Order) => void
  onView: (order: Order) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>
  filters: OrderFilters
  onFiltersChange: (filters: OrderFilters) => void
}

// Hook return types
export interface UseOrdersDataReturn {
  orders: Order[]
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
  updateFormData: (field: keyof CreateOrderRequest, value: any) => void
  addItem: () => void
  updateItem: (index: number, field: keyof OrderItem, value: any) => void
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
  draft: 'Draft',
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Dikonfirmasi', 
  in_production: 'Sedang Diproduksi',
  ready: 'Siap Diambil',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Belum Dibayar',
  partial: 'Dibayar Sebagian',
  paid: 'Lunas',
  refunded: 'Dikembalikan'
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  transfer: 'Transfer Bank',
  qris: 'QRIS',
  card: 'Kartu',
  ewallet: 'E-Wallet'
}

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  pickup: 'Ambil Sendiri',
  delivery: 'Diantar',
  shipping: 'Dikirim'
}