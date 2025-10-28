export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          name: string
          user_id: string
          email: string | null
          phone: string | null
          customer_type: string | null
          discount_percentage: number | null
          notes: string | null
          is_active: boolean | null
          loyalty_points: number | null
          id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          name: string
          user_id: string
          email?: string | null
          phone?: string | null
          customer_type?: string | null
          discount_percentage?: number | null
          notes?: string | null
          is_active?: boolean | null
          loyalty_points?: number | null
        }
        Update: {
          address?: string | null
          name?: string
          email?: string | null
          phone?: string | null
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
          category: string
          description: string
          user_id: string
          subcategory: string | null
          expense_date: string | null
          is_recurring: boolean | null
          recurring_frequency: string | null
          supplier: string | null
          payment_method: string | null
          status: string | null
          receipt_number: string | null
          created_at: string | null
          updated_at: string | null
        }
        Update: {
          amount?: number
          category?: string
          description?: string
          subcategory?: string | null
          expense_date?: string | null
          is_recurring?: boolean | null
          recurring_frequency?: string | null
          supplier?: string | null
          payment_method?: string | null
          status?: string | null
          receipt_number?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_no: string
          user_id: string
          status: string | null
          total_amount: number | null
        }
      }
      order_items: {
        Insert: {
          order_id: string
          recipe_id: string
          quantity: number
          unit_price: number
          total_price: number
          user_id: string
        }
      }
      ingredients: {
        Row: {
          id: string
          name: string
          user_id: string
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
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
