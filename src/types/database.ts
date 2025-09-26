export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
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
      ingredients: {
        Row: {
          id: string
          name: string
          description?: string | null
          unit: string
          price_per_unit: number
          current_stock: number
          min_stock: number
          supplier?: string | null
          category?: string | null
          storage_requirements?: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          unit: string
          price_per_unit: number
          current_stock?: number
          min_stock?: number
          supplier?: string | null
          category?: string | null
          storage_requirements?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          unit?: string
          price_per_unit?: number
          current_stock?: number
          min_stock?: number
          supplier?: string | null
          category?: string | null
          storage_requirements?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          name: string
          description?: string | null
          category: string
          servings: number
          prep_time?: number | null
          cook_time?: number | null
          difficulty?: string | null
          instructions?: string | null
          notes?: string | null
          cost_per_unit?: number | null
          selling_price?: number | null
          margin_percentage?: number | null
          rating?: number | null
          times_made?: number | null
          image_url?: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          servings?: number
          prep_time?: number | null
          cook_time?: number | null
          difficulty?: string | null
          instructions?: string | null
          notes?: string | null
          cost_per_unit?: number | null
          selling_price?: number | null
          margin_percentage?: number | null
          rating?: number | null
          times_made?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          servings?: number
          prep_time?: number | null
          cook_time?: number | null
          difficulty?: string | null
          instructions?: string | null
          notes?: string | null
          cost_per_unit?: number | null
          selling_price?: number | null
          margin_percentage?: number | null
          rating?: number | null
          times_made?: number | null
          image_url?: string | null
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
          cost?: number | null
          notes?: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          ingredient_id: string
          quantity: number
          unit: string
          cost?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          ingredient_id?: string
          quantity?: number
          unit?: string
          cost?: number | null
          notes?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_no: string
          customer_id?: string | null
          customer_name?: string | null
          status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED'
          total_amount: number
          paid_amount: number
          discount: number
          delivery_date?: string | null
          notes?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
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
      payments: {
        Row: {
          id: string
          order_id: string
          amount: number
          method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER'
          reference?: string | null
          notes?: string | null
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
      productions: {
        Row: {
          id: string
          recipe_id: string
          quantity: number
          cost_per_unit: number
          total_cost: number
          status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
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
          unit_price?: number | null
          total_price?: number | null
          reference?: string | null
          notes?: string | null
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
      financial_records: {
        Row: {
          id: string
          type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'WITHDRAWAL'
          category: string
          amount: number
          description: string
          reference?: string | null
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
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED'
      payment_method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER'
      production_status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
      record_type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'WITHDRAWAL'
      transaction_type: 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'WASTE'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases
export type Customer = Database['public']['Tables']['customers']['Row']
export type Ingredient = Database['public']['Tables']['ingredients']['Row']
export type Recipe = Database['public']['Tables']['recipes']['Row']
export type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Production = Database['public']['Tables']['productions']['Row']
export type StockTransaction = Database['public']['Tables']['stock_transactions']['Row']
export type FinancialRecord = Database['public']['Tables']['financial_records']['Row']

// Insert types
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type IngredientInsert = Database['public']['Tables']['ingredients']['Insert']
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
export type RecipeIngredientInsert = Database['public']['Tables']['recipe_ingredients']['Insert']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type ProductionInsert = Database['public']['Tables']['productions']['Insert']
export type StockTransactionInsert = Database['public']['Tables']['stock_transactions']['Insert']
export type FinancialRecordInsert = Database['public']['Tables']['financial_records']['Insert']

// Update types
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']
export type IngredientUpdate = Database['public']['Tables']['ingredients']['Update']
export type RecipeUpdate = Database['public']['Tables']['recipes']['Update']
export type RecipeIngredientUpdate = Database['public']['Tables']['recipe_ingredients']['Update']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']
export type ProductionUpdate = Database['public']['Tables']['productions']['Update']
export type StockTransactionUpdate = Database['public']['Tables']['stock_transactions']['Update']
export type FinancialRecordUpdate = Database['public']['Tables']['financial_records']['Update']

// Enum types
export type OrderStatus = Database['public']['Enums']['order_status']
export type PaymentMethod = Database['public']['Enums']['payment_method']
export type ProductionStatus = Database['public']['Enums']['production_status']
export type RecordType = Database['public']['Enums']['record_type']
export type TransactionType = Database['public']['Enums']['transaction_type']

// Extended types with relations
export type RecipeWithIngredients = Recipe & {
  recipe_ingredients: (RecipeIngredient & {
    ingredient: Ingredient
  })[]
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    recipe: Recipe
  })[]
  payments: Payment[]
  customer?: Customer | null
}

export type ProductionWithRecipe = Production & {
  recipe: Recipe
}

export type StockTransactionWithIngredient = StockTransaction & {
  ingredient: Ingredient
}