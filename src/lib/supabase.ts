import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For client components
export const createClientSupabase = () => createClientComponentClient()

// For server components
export const createServerSupabase = () => createServerComponentClient({ cookies })

// Database types (we'll define these based on our schema)
export type Database = {
  public: {
    Tables: {
      ingredients: {
        Row: {
          id: string
          name: string
          description: string | null
          unit: string
          price_per_unit: number
          stock: number
          min_stock: number
          supplier: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          unit: string
          price_per_unit: number
          stock?: number
          min_stock?: number
          supplier?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          unit?: string
          price_per_unit?: number
          stock?: number
          min_stock?: number
          supplier?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          name: string
          description: string | null
          instructions: string | null
          servings: number
          prep_time: number | null
          cook_time: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          instructions?: string | null
          servings?: number
          prep_time?: number | null
          cook_time?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          instructions?: string | null
          servings?: number
          prep_time?: number | null
          cook_time?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          ingredient_id: string
          quantity: number
          unit: string
        }
        Insert: {
          id?: string
          recipe_id: string
          ingredient_id: string
          quantity: number
          unit: string
        }
        Update: {
          id?: string
          recipe_id?: string
          ingredient_id?: string
          quantity?: number
          unit?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_no: string
          customer_id: string | null
          customer_name: string | null
          status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED'
          total_amount: number
          paid_amount: number
          discount: number
          delivery_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_no: string
          customer_id?: string | null
          customer_name?: string | null
          status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED'
          total_amount?: number
          paid_amount?: number
          discount?: number
          delivery_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_no?: string
          customer_id?: string | null
          customer_name?: string | null
          status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED'
          total_amount?: number
          paid_amount?: number
          discount?: number
          delivery_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          recipe_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          order_id: string
          recipe_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          id?: string
          order_id?: string
          recipe_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      productions: {
        Row: {
          id: string
          recipe_id: string
          quantity: number
          cost_per_unit: number
          total_cost: number
          status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          started_at: string | null
          completed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          quantity: number
          cost_per_unit: number
          total_cost: number
          status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          quantity?: number
          cost_per_unit?: number
          total_cost?: number
          status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stock_transactions: {
        Row: {
          id: string
          ingredient_id: string
          type: 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'WASTE'
          quantity: number
          unit_price: number | null
          total_price: number | null
          reference: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ingredient_id: string
          type: 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'WASTE'
          quantity: number
          unit_price?: number | null
          total_price?: number | null
          reference?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ingredient_id?: string
          type?: 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'WASTE'
          quantity?: number
          unit_price?: number | null
          total_price?: number | null
          reference?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          amount: number
          method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER'
          reference: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          amount: number
          method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER'
          reference?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          amount?: number
          method?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER'
          reference?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      financial_records: {
        Row: {
          id: string
          type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'WITHDRAWAL'
          category: string
          amount: number
          description: string
          reference: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'WITHDRAWAL'
          category: string
          amount: number
          description: string
          reference?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'WITHDRAWAL'
          category?: string
          amount?: number
          description?: string
          reference?: string | null
          date?: string
          created_at?: string
        }
      }
    }
  }
}