import { Database } from '@/types'

// Base types dari database
export type Ingredient = Database['public']['Tables']['ingredients']['Row']
export type StockTransaction = Database['public']['Tables']['stock_transactions']['Row']
export type InsertIngredient = Database['public']['Tables']['ingredients']['Insert']
export type UpdateIngredient = Database['public']['Tables']['ingredients']['Update']

// Extended types untuk UI dan business logic
export interface IngredientWithStats extends Ingredient {
  totalValue: number
  daysUntilReorder: number
  usageRate: number
  lastTransactionDate?: string
  alertLevel: 'safe' | 'warning' | 'critical'
}

export interface StockTransactionWithDetails extends StockTransaction {
  ingredient?: Ingredient
  formattedAmount: string
  transactionTypeLabel: string
}

export interface InventoryStats {
  totalIngredients: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
  monthlyUsage: number
  averagePrice: number
  topUsedIngredients: IngredientUsage[]
}

export interface IngredientUsage {
  ingredient: Ingredient
  usageCount: number
  totalValue: number
  lastUsed: string
}

export interface StockAlert {
  id: string
  ingredient: Ingredient
  type: 'low_stock' | 'out_of_stock' | 'overstocked' | 'expired'
  message: string
  severity: 'low' | 'medium' | 'high'
  actionRequired: string
  daysUntilCritical?: number
}

export interface ReorderPoint {
  ingredient_id: string
  min_stock: number
  recommended_order_quantity: number
  lead_time_days: number
  safety_stock: number
  average_daily_usage: number
}

export interface StockMovement {
  date: string
  type: 'in' | 'out'
  quantity: number
  value: number
  reference?: string
  notes?: string
}

export interface InventoryFilters {
  category?: string
  stockLevel?: 'all' | 'low' | 'out' | 'normal'
  supplier?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface InventorySearchParams {
  query?: string
  filters: InventoryFilters
  sortBy?: 'name' | 'stock' | 'value' | 'lastUpdated'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}