import type { Json } from './common'

// Order-related enums
export type OrderStatus = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "READY" | "DELIVERED" | "CANCELLED"
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "DIGITAL_WALLET" | "OTHER"

// Order tables
export type OrdersTable = {
  Row: {
    created_at: string | null
    created_by: string | null
    customer_address: string | null
    customer_id: string | null
    customer_name: string | null
    customer_phone: string | null
    delivery_date: string | null
    delivery_fee: number | null
    delivery_time: string | null
    discount: number | null
    id: string
    notes: string | null
    order_date: string | null
    order_no: string
    paid_amount: number | null
    payment_method: string | null
    payment_status: string | null
    priority: string | null
    special_instructions: string | null
    status: OrderStatus | null
    tax_amount: number | null
    total_amount: number | null
    updated_at: string | null
    updated_by: string | null
  }
  Insert: {
    created_at?: string | null
    created_by?: string | null
    customer_address?: string | null
    customer_id?: string | null
    customer_name?: string | null
    customer_phone?: string | null
    delivery_date?: string | null
    delivery_fee?: number | null
    delivery_time?: string | null
    discount?: number | null
    id?: string
    notes?: string | null
    order_date?: string | null
    order_no: string
    paid_amount?: number | null
    payment_method?: string | null
    payment_status?: string | null
    priority?: string | null
    special_instructions?: string | null
    status?: OrderStatus | null
    tax_amount?: number | null
    total_amount?: number | null
    updated_at?: string | null
    updated_by?: string | null
  }
  Update: {
    created_at?: string | null
    created_by?: string | null
    customer_address?: string | null
    customer_id?: string | null
    customer_name?: string | null
    customer_phone?: string | null
    delivery_date?: string | null
    delivery_fee?: number | null
    delivery_time?: string | null
    discount?: number | null
    id?: string
    notes?: string | null
    order_date?: string | null
    order_no?: string
    paid_amount?: number | null
    payment_method?: string | null
    payment_status?: string | null
    priority?: string | null
    special_instructions?: string | null
    status?: OrderStatus | null
    tax_amount?: number | null
    total_amount?: number | null
    updated_at?: string | null
    updated_by?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "orders_customer_id_fkey"
      columns: ["customer_id"]
      isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },
  ]
}

export type OrderItemsTable = {
  Row: {
    id: string
    order_id: string
    product_name: string | null
    quantity: number
    recipe_id: string
    special_requests: string | null
    total_price: number
    unit_price: number
  }
  Insert: {
    id?: string
    order_id: string
    product_name?: string | null
    quantity: number
    recipe_id: string
    special_requests?: string | null
    total_price: number
    unit_price: number
  }
  Update: {
    id?: string
    order_id?: string
    product_name?: string | null
    quantity?: number
    recipe_id?: string
    special_requests?: string | null
    total_price?: number
    unit_price?: number
  }
  Relationships: [
    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
      isOneToOne: false
      referencedRelation: "order_summary"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
      isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "order_items_recipe_id_fkey"
      columns: ["recipe_id"]
      isOneToOne: false
      referencedRelation: "recipe_availability"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "order_items_recipe_id_fkey"
      columns: ["recipe_id"]
      isOneToOne: false
      referencedRelation: "recipes"
      referencedColumns: ["id"]
    },
  ]
}

export type PaymentsTable = {
  Row: {
    amount: number
    created_at: string | null
    id: string
    method: PaymentMethod
    notes: string | null
    order_id: string
    reference: string | null
  }
  Insert: {
    amount: number
    created_at?: string | null
    id?: string
    method: PaymentMethod
    notes?: string | null
    order_id: string
    reference?: string | null
  }
  Update: {
    amount?: number
    created_at?: string | null
    id?: string
    method?: PaymentMethod
    notes?: string | null
    order_id?: string
    reference?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "payments_order_id_fkey"
      columns: ["order_id"]
      isOneToOne: false
      referencedRelation: "order_summary"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "payments_order_id_fkey"
      columns: ["order_id"]
      isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },
  ]
}

// Order-related views
export type OrderSummaryView = {
  Row: {
    created_at: string | null
    customer_address: string | null
    customer_full_name: string | null
    customer_id: string | null
    customer_name: string | null
    customer_order_count: number | null
    customer_phone: string | null
    customer_phone_verified: string | null
    customer_type: string | null
    delivery_date: string | null
    delivery_fee: number | null
    delivery_time: string | null
    discount: number | null
    id: string | null
    items_detail: Json[] | null
    notes: string | null
    order_date: string | null
    order_no: string | null
    paid_amount: number | null
    payment_method: string | null
    payment_status: string | null
    priority: string | null
    special_instructions: string | null
    status: OrderStatus | null
    tax_amount: number | null
    total_amount: number | null
    total_items: number | null
    updated_at: string | null
  }
  Relationships: [
    {
      foreignKeyName: "orders_customer_id_fkey"
      columns: ["customer_id"]
      isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },
  ]
}
