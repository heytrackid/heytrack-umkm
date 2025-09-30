import type { Json } from './common'

// Finance-related enums
export type RecordType = "INCOME" | "EXPENSE" | "INVESTMENT" | "WITHDRAWAL"

// Finance tables
export type FinancialRecordsTable = {
  Row: {
    amount: number
    category: string
    created_at: string | null
    created_by: string | null
    date: string | null
    description: string
    id: string
    reference: string | null
    type: RecordType
  }
  Insert: {
    amount: number
    category: string
    created_at?: string | null
    created_by?: string | null
    date?: string | null
    description: string
    id?: string
    reference?: string | null
    type: RecordType
  }
  Update: {
    amount?: number
    category?: string
    created_at?: string | null
    created_by?: string | null
    date?: string | null
    description?: string
    id?: string
    reference?: string | null
    type?: RecordType
  }
  Relationships: []
}

export type DailySalesSummaryTable = {
  Row: {
    average_order_value: number | null
    created_at: string | null
    expenses_total: number | null
    id: string
    metadata: Json | null
    new_customers: number | null
    profit_estimate: number | null
    sales_date: string
    top_selling_recipe_id: string | null
    total_items_sold: number | null
    total_orders: number | null
    total_revenue: number | null
    updated_at: string | null
  }
  Insert: {
    average_order_value?: number | null
    created_at?: string | null
    expenses_total?: number | null
    id?: string
    metadata?: Json | null
    new_customers?: number | null
    profit_estimate?: number | null
    sales_date: string
    top_selling_recipe_id?: string | null
    total_items_sold?: number | null
    total_orders?: number | null
    total_revenue?: number | null
    updated_at?: string | null
  }
  Update: {
    average_order_value?: number | null
    created_at?: string | null
    expenses_total?: number | null
    id?: string
    metadata?: Json | null
    new_customers?: number | null
    profit_estimate?: number | null
    sales_date?: string
    top_selling_recipe_id?: string | null
    total_items_sold?: number | null
    total_orders?: number | null
    total_revenue?: number | null
    updated_at?: string | null
  }
  Relationships: []
}
