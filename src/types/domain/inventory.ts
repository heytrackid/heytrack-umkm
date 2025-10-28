import type { Json } from '../shared/common'

// Inventory-related enums
export type TransactionType = "PURCHASE" | "USAGE" | "ADJUSTMENT" | "WASTE"

// Inventory tables
export interface IngredientsTable {
  Row: {
    category: string | null
    cost_per_batch: number | null
    created_at: string | null
    created_by: string | null
    current_stock: number | null
    description: string | null
    id: string
    is_active: boolean | null
    last_ordered_at: string | null
    lead_time: number | null
    max_stock: number | null
    min_stock: number | null
    name: string
    price_per_unit: number
    reorder_point: number | null
    supplier: string | null
    supplier_contact: string | null
    unit: string
    updated_at: string | null
    updated_by: string | null
    usage_rate: number | null
    user_id: string
    weighted_average_cost: number
  }
  Insert: {
    category?: string | null
    cost_per_batch?: number | null
    created_at?: string | null
    created_by?: string | null
    current_stock?: number | null
    description?: string | null
    id?: string
    is_active?: boolean | null
    last_ordered_at?: string | null
    lead_time?: number | null
    max_stock?: number | null
    min_stock?: number | null
    name: string
    price_per_unit: number
    reorder_point?: number | null
    supplier?: string | null
    supplier_contact?: string | null
    unit: string
    updated_at?: string | null
    updated_by?: string | null
    usage_rate?: number | null
    user_id: string
    weighted_average_cost?: number
  }
  Update: {
    category?: string | null
    cost_per_batch?: number | null
    created_at?: string | null
    created_by?: string | null
    current_stock?: number | null
    description?: string | null
    id?: string
    is_active?: boolean | null
    last_ordered_at?: string | null
    lead_time?: number | null
    max_stock?: number | null
    min_stock?: number | null
    name?: string
    price_per_unit?: number
    reorder_point?: number | null
    supplier?: string | null
    supplier_contact?: string | null
    unit?: string
    updated_at?: string | null
    updated_by?: string | null
    usage_rate?: number | null
    user_id?: string
    weighted_average_cost?: number
  }
  Relationships: []
}

export interface InventoryAlertsTable {
  Row: {
    acknowledged_at: string | null
    alert_type: string
    created_at: string | null
    id: string
    ingredient_id: string | null
    is_active: boolean | null
    message: string
    metadata: Json | null
    resolved_at: string | null
    severity: string | null
    updated_at: string | null
    user_id: string
  }
  Insert: {
    acknowledged_at?: string | null
    alert_type: string
    created_at?: string | null
    id?: string
    ingredient_id?: string | null
    is_active?: boolean | null
    message: string
    metadata?: Json | null
    resolved_at?: string | null
    severity?: string | null
    updated_at?: string | null
    user_id: string
  }
  Update: {
    acknowledged_at?: string | null
    alert_type?: string
    created_at?: string | null
    id?: string
    ingredient_id?: string | null
    is_active?: boolean | null
    message?: string
    metadata?: Json | null
    resolved_at?: string | null
    severity?: string | null
    updated_at?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "inventory_alerts_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "ingredients"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "inventory_alerts_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "inventory_status"
      referencedColumns: ["id"]
    },
  ]
}

export interface InventoryStockLogsTable {
  Row: {
    change_type: string
    created_at: string | null
    id: string
    ingredient_id: string
    metadata: Json | null
    quantity_after: number
    quantity_before: number
    quantity_changed: number
    reason: string | null
    reference_id: string | null
    reference_type: string | null
    triggered_by: string | null
  }
  Insert: {
    change_type: string
    created_at?: string | null
    id?: string
    ingredient_id: string
    metadata?: Json | null
    quantity_after: number
    quantity_before: number
    quantity_changed: number
    reason?: string | null
    reference_id?: string | null
    reference_type?: string | null
    triggered_by?: string | null
  }
  Update: {
    change_type?: string
    created_at?: string | null
    id?: string
    ingredient_id?: string
    metadata?: Json | null
    quantity_after?: number
    quantity_before?: number
    quantity_changed?: number
    reason?: string | null
    reference_id?: string | null
    reference_type?: string | null
    triggered_by?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "inventory_stock_logs_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "ingredients"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "inventory_stock_logs_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "inventory_status"
      referencedColumns: ["id"]
    },
  ]
}

export interface StockTransactionsTable {
  Row: {
    created_at: string | null
    created_by: string | null
    id: string
    ingredient_id: string
    notes: string | null
    quantity: number
    reference: string | null
    total_price: number | null
    type: TransactionType
    unit_price: number | null
    user_id: string
  }
  Insert: {
    created_at?: string | null
    created_by?: string | null
    id?: string
    ingredient_id: string
    notes?: string | null
    quantity: number
    reference?: string | null
    total_price?: number | null
    type: TransactionType
    unit_price?: number | null
    user_id: string
  }
  Update: {
    created_at?: string | null
    created_by?: string | null
    id?: string
    ingredient_id?: string
    notes?: string | null
    quantity?: number
    reference?: string | null
    total_price?: number | null
    type?: TransactionType
    unit_price?: number | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "stock_transactions_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "ingredients"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "stock_transactions_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "inventory_status"
      referencedColumns: ["id"]
    },
  ]
}

export interface SupplierIngredientsTable {
  Row: {
    id: string
    ingredient_id: string | null
    is_preferred: boolean | null
    last_price_update: string | null
    minimum_quantity: number | null
    package_size: number | null
    package_unit: string | null
    supplier_id: string | null
    supplier_price: number
    user_id: string
  }
  Insert: {
    id?: string
    ingredient_id?: string | null
    is_preferred?: boolean | null
    last_price_update?: string | null
    minimum_quantity?: number | null
    package_size?: number | null
    package_unit?: string | null
    supplier_id?: string | null
    supplier_price: number
    user_id: string
  }
  Update: {
    id?: string
    ingredient_id?: string | null
    is_preferred?: boolean | null
    last_price_update?: string | null
    minimum_quantity?: number | null
    package_size?: number | null
    package_unit?: string | null
    supplier_id?: string | null
    supplier_price?: number
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "supplier_ingredients_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "ingredients"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "supplier_ingredients_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "inventory_status"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "supplier_ingredients_supplier_id_fkey"
      columns: ["supplier_id"]
      isOneToOne: false
      referencedRelation: "suppliers"
      referencedColumns: ["id"]
    },
  ]
}

export interface UsageAnalyticsTable {
  Row: {
    cost_impact: number | null
    created_at: string | null
    date: string
    id: string
    ingredient_id: string | null
    prediction_next_7_days: number | null
    quantity_purchased: number | null
    quantity_used: number
    quantity_wasted: number | null
    running_average: number | null
    trend: string | null
    user_id: string
  }
  Insert: {
    cost_impact?: number | null
    created_at?: string | null
    date: string
    id?: string
    ingredient_id?: string | null
    prediction_next_7_days?: number | null
    quantity_purchased?: number | null
    quantity_used: number
    quantity_wasted?: number | null
    running_average?: number | null
    trend?: string | null
    user_id: string
  }
  Update: {
    cost_impact?: number | null
    created_at?: string | null
    date?: string
    id?: string
    ingredient_id?: string | null
    prediction_next_7_days?: number | null
    quantity_purchased?: number | null
    quantity_used?: number
    quantity_wasted?: number | null
    running_average?: number | null
    trend?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "usage_analytics_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "ingredients"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "usage_analytics_ingredient_id_fkey"
      columns: ["ingredient_id"]
      isOneToOne: false
      referencedRelation: "inventory_status"
      referencedColumns: ["id"]
    },
  ]
}

// Inventory-related views
export interface InventoryStatusView {
  Row: {
    alert_level: string | null
    category: string | null
    cost_per_batch: number | null
    created_at: string | null
    current_stock: number | null
    days_remaining: number | null
    description: string | null
    id: string | null
    last_ordered_at: string | null
    lead_time: number | null
    max_stock: number | null
    min_stock: number | null
    name: string | null
    price_per_unit: number | null
    reorder_point: number | null
    stock_percentage: number | null
    stock_status: string | null
    supplier: string | null
    supplier_contact: string | null
    unit: string | null
    updated_at: string | null
    usage_rate: number | null
  }
  Insert: {
    alert_level?: never
    category?: string | null
    cost_per_batch?: number | null
    created_at?: string | null
    current_stock?: number | null
    days_remaining?: never
    description?: string | null
    id?: string | null
    last_ordered_at?: string | null
    lead_time?: number | null
    max_stock?: number | null
    min_stock?: number | null
    name?: string | null
    price_per_unit?: number | null
    reorder_point?: number | null
    stock_percentage?: never
    stock_status?: never
    supplier?: string | null
    supplier_contact?: string | null
    unit?: string | null
    updated_at?: string | null
    usage_rate?: number | null
  }
  Update: {
    alert_level?: never
    category?: string | null
    cost_per_batch?: number | null
    created_at?: string | null
    current_stock?: number | null
    days_remaining?: never
    description?: string | null
    id?: string | null
    last_ordered_at?: string | null
    lead_time?: number | null
    max_stock?: number | null
    min_stock?: number | null
    name?: string | null
    price_per_unit?: number | null
    reorder_point?: number | null
    stock_percentage?: never
    stock_status?: never
    supplier?: string | null
    supplier_contact?: string | null
    unit?: string | null
    updated_at?: string | null
    usage_rate?: number | null
  }
  Relationships: []
}

// Inventory stock logs types
export interface InventoryStockLog {
  id: string
  ingredient_id: string
  change_type: 'increase' | 'decrease' | 'adjustment' | 'consumption'
  quantity_before: number
  quantity_after: number
  quantity_changed: number
  reason?: string
  reference_type?: string
  reference_id?: string
  triggered_by?: string
  metadata?: Json
  created_at: string
}

// Bahan Baku (Indonesian ingredients table) types
export interface BahanBaku {
  id: string
  account_id: string
  nama_bahan: string
  satuan: string
  harga_per_satuan: number
  stok_tersedia: number
  stok_minimum: number
  wac_harga: number | null
  jenis_kemasan: string | null
  created_at: string
}

// Form data type for create/update operations
export interface BahanBakuFormData {
  nama_bahan: string
  satuan: string
  harga_per_satuan: number
  stok_tersedia: number
  stok_minimum: number
  jenis_kemasan?: string
}

// Type aliases for convenience
export type Ingredient = IngredientsTable['Row']
export type IngredientInsert = IngredientsTable['Insert']
export type IngredientUpdate = IngredientsTable['Update']

export type StockTransaction = StockTransactionsTable['Row']
export type InventoryAlert = InventoryAlertsTable['Row']
export type InventoryStockLog = InventoryStockLogsTable['Row']
