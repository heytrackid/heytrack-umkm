export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      hpp_calculations: {
        Row: {
          calculation_date: string | null
          cost_per_unit: number
          created_at: string | null
          id: string
          labor_cost: number
          material_cost: number
          notes: string | null
          overhead_cost: number
          production_quantity: number | null
          recipe_id: string | null
          total_hpp: number
          user_id: string | null
          wac_adjustment: number | null
        }
        Insert: {
          calculation_date?: string | null
          cost_per_unit?: number
          created_at?: string | null
          id?: string
          labor_cost?: number
          material_cost?: number
          notes?: string | null
          overhead_cost?: number
          production_quantity?: number | null
          recipe_id?: string | null
          total_hpp?: number
          user_id?: string | null
          wac_adjustment?: number | null
        }
        Update: {
          calculation_date?: string | null
          cost_per_unit?: number
          created_at?: string | null
          id?: string
          labor_cost?: number
          material_cost?: number
          notes?: string | null
          overhead_cost?: number
          production_quantity?: number | null
          recipe_id?: string | null
          total_hpp?: number
          user_id?: string | null
          wac_adjustment?: number | null
        }
      }
      recipes: {
        Row: {
          id: string
          name: string
          selling_price: number | null
          user_id: string
          servings: number | null
          cost_per_unit: number | null
          is_active: boolean | null
          category: string | null
          last_made_at: string | null
          times_made: number | null
          created_at: string | null
          updated_at: string | null
        }
      }
      hpp_alerts: {
        Row: {
          id: string
          recipe_id: string
          user_id: string | null
          alert_type: string
          message: string
          is_read: boolean | null
          created_at: string | null
        }
        Update: {
          is_read?: boolean | null
        }
      }
      customers: {
        Insert: {
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          customer_type?: string | null
          discount_percentage?: number | null
          notes?: string | null
          is_active?: boolean | null
          loyalty_points?: number | null
        }
      }
      expenses: {
        Row: {
          id: string
          amount: number
        }
      }
      notifications: {
        Insert: {
          type: string
          category: string
          title: string
          message: string
          entity_type?: string | null
          entity_id?: string | null
          priority?: string | null
        }
      }
      daily_sales_summary: {
        Insert: {
          sales_date: string
          total_revenue?: number | null
          total_orders?: number | null
          total_items_sold?: number | null
          average_order_value?: number | null
          expenses_total?: number | null
          profit_estimate?: number | null
          new_customers?: number | null
          metadata?: Json | null
        }
      }
      financial_records: {
        Insert: {
          user_id: string
          description: string
          category: string
          amount: number
          date?: string | null
          reference?: string | null
          type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'WITHDRAWAL'
        }
      }
      hpp_snapshots: {
        Insert: {
          recipe_id: string
          user_id?: string | null
          snapshot_date?: string
          hpp_value: number
          material_cost: number
          operational_cost: number
          cost_breakdown: Json
        }
      }
    }
  }
}
