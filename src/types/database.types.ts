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
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          settings_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings_data: Json
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          settings_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string | null
          customer_type: string | null
          discount_percentage: number | null
          email: string | null
          favorite_items: Json | null
          id: string
          is_active: boolean | null
          last_order_date: string | null
          loyalty_points: number | null
          name: string
          notes: string | null
          phone: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string | null
          discount_percentage?: number | null
          email?: string | null
          favorite_items?: Json | null
          id?: string
          is_active?: boolean | null
          last_order_date?: string | null
          loyalty_points?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: string | null
          discount_percentage?: number | null
          email?: string | null
          favorite_items?: Json | null
          id?: string
          is_active?: boolean | null
          last_order_date?: string | null
          loyalty_points?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      daily_sales_summary: {
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
        Relationships: [
          {
            foreignKeyName: "daily_sales_summary_top_selling_recipe_id_fkey"
            columns: ["top_selling_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_sales_summary_top_selling_recipe_id_fkey"
            columns: ["top_selling_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          expense_date: string | null
          id: string
          is_recurring: boolean | null
          metadata: Json | null
          payment_method: string | null
          receipt_number: string | null
          recurring_frequency: string | null
          status: string | null
          subcategory: string | null
          supplier: string | null
          tags: Json | null
          tax_amount: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description: string
          expense_date?: string | null
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          payment_method?: string | null
          receipt_number?: string | null
          recurring_frequency?: string | null
          status?: string | null
          subcategory?: string | null
          supplier?: string | null
          tags?: Json | null
          tax_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          expense_date?: string | null
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          payment_method?: string | null
          receipt_number?: string | null
          recurring_frequency?: string | null
          status?: string | null
          subcategory?: string | null
          supplier?: string | null
          tags?: Json | null
          tax_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_records: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string
          id: string
          reference: string | null
          type: Database["public"]["Enums"]["record_type"]
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
          type: Database["public"]["Enums"]["record_type"]
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
          type?: Database["public"]["Enums"]["record_type"]
        }
        Relationships: []
      }
      ingredients: {
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
          minimum_stock: number | null
          name: string
          price_per_unit: number
          reorder_point: number | null
          supplier: string | null
          supplier_contact: string | null
          unit: string
          updated_at: string | null
          updated_by: string | null
          usage_rate: number | null
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
          minimum_stock?: number | null
          name: string
          price_per_unit: number
          reorder_point?: number | null
          supplier?: string | null
          supplier_contact?: string | null
          unit: string
          updated_at?: string | null
          updated_by?: string | null
          usage_rate?: number | null
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
          minimum_stock?: number | null
          name?: string
          price_per_unit?: number
          reorder_point?: number | null
          supplier?: string | null
          supplier_contact?: string | null
          unit?: string
          updated_at?: string | null
          updated_by?: string | null
          usage_rate?: number | null
        }
        Relationships: []
      }
      inventory_alerts: {
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
      inventory_stock_logs: {
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
      notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          action_url?: string | null
          category: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
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
      orders: {
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
          status: Database["public"]["Enums"]["order_status"] | null
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
          status?: Database["public"]["Enums"]["order_status"] | null
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
          status?: Database["public"]["Enums"]["order_status"] | null
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
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          order_id: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          order_id: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
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
      production_schedules: {
        Row: {
          actual_duration: number | null
          actual_quantity: number | null
          assigned_staff: string | null
          cost_estimate: number | null
          created_at: string | null
          dependencies: Json | null
          estimated_duration: number | null
          id: string
          notes: string | null
          planned_quantity: number
          priority: number | null
          profit_estimate: number | null
          recipe_id: string | null
          resource_requirements: Json | null
          scheduled_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_duration?: number | null
          actual_quantity?: number | null
          assigned_staff?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          dependencies?: Json | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          planned_quantity: number
          priority?: number | null
          profit_estimate?: number | null
          recipe_id?: string | null
          resource_requirements?: Json | null
          scheduled_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_duration?: number | null
          actual_quantity?: number | null
          assigned_staff?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          dependencies?: Json | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          planned_quantity?: number
          priority?: number | null
          profit_estimate?: number | null
          recipe_id?: string | null
          resource_requirements?: Json | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_schedules_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_schedules_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      productions: {
        Row: {
          completed_at: string | null
          cost_per_unit: number
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          quantity: number
          recipe_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["production_status"] | null
          total_cost: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          completed_at?: string | null
          cost_per_unit: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          quantity: number
          recipe_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["production_status"] | null
          total_cost: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          completed_at?: string | null
          cost_per_unit?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          recipe_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["production_status"] | null
          total_cost?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          id: string
          ingredient_id: string
          quantity: number
          recipe_id: string
          unit: string
        }
        Insert: {
          id?: string
          ingredient_id: string
          quantity: number
          recipe_id: string
          unit: string
        }
        Update: {
          id?: string
          ingredient_id?: string
          quantity?: number
          recipe_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "inventory_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          batch_size: number | null
          category: string | null
          cook_time: number | null
          cost_per_unit: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_active: boolean | null
          last_made_at: string | null
          margin_percentage: number | null
          name: string
          prep_time: number | null
          rating: number | null
          seasonal: boolean | null
          selling_price: number | null
          servings: number | null
          times_made: number | null
          total_revenue: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          batch_size?: number | null
          category?: string | null
          cook_time?: number | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          last_made_at?: string | null
          margin_percentage?: number | null
          name: string
          prep_time?: number | null
          rating?: number | null
          seasonal?: boolean | null
          selling_price?: number | null
          servings?: number | null
          times_made?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          batch_size?: number | null
          category?: string | null
          cook_time?: number | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          last_made_at?: string | null
          margin_percentage?: number | null
          name?: string
          prep_time?: number | null
          rating?: number | null
          seasonal?: boolean | null
          selling_price?: number | null
          servings?: number | null
          times_made?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      stock_transactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          ingredient_id: string
          notes: string | null
          quantity: number
          reference: string | null
          total_price: number | null
          type: Database["public"]["Enums"]["transaction_type"]
          unit_price: number | null
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
          type: Database["public"]["Enums"]["transaction_type"]
          unit_price?: number | null
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
          type?: Database["public"]["Enums"]["transaction_type"]
          unit_price?: number | null
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
      supplier_ingredients: {
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
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          delivery_fee: number | null
          email: string | null
          id: string
          is_active: boolean | null
          last_order_date: string | null
          lead_time_days: number | null
          metadata: Json | null
          minimum_order: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          rating: number | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_order_date?: string | null
          lead_time_days?: number | null
          metadata?: Json | null
          minimum_order?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_order_date?: string | null
          lead_time_days?: number | null
          metadata?: Json | null
          minimum_order?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_events: {
        Row: {
          created_at: string | null
          data: Json
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          metadata: Json | null
          processed_at: string | null
          sync_status: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          sync_status?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          sync_status?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string | null
          status: string | null
          unit: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value?: number
          recorded_at?: string | null
          status?: string | null
          unit?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
          status?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      usage_analytics: {
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
        }
        Insert: {
          cost_impact?: number | null
          created_at?: string | null
          date: string
          id?: string
          ingredient_id?: string | null
          prediction_next_7_days?: number | null
          quantity_purchased?: number | null
          quantity_used?: number
          quantity_wasted?: number | null
          running_average?: number | null
          trend?: string | null
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
      user_profiles: {
        Row: {
          business_unit: Database["public"]["Enums"]["business_unit"] | null
          created_at: string | null
          created_by: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          permissions: string[] | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_unit?: Database["public"]["Enums"]["business_unit"] | null
          created_at?: string | null
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_unit?: Database["public"]["Enums"]["business_unit"] | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          template_content: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          template_content: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          template_content?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      inventory_status: {
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
      order_summary: {
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
          status: Database["public"]["Enums"]["order_status"] | null
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
      recent_sync_events: {
        Row: {
          created_at: string | null
          data: Json | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          event_type: string | null
          id: string | null
          metadata: Json | null
          processed_at: string | null
          seconds_ago: number | null
          sync_status: string | null
        }
        Relationships: []
      }
      recipe_availability: {
        Row: {
          category: string | null
          cost_per_unit: number | null
          id: string | null
          is_active: boolean | null
          is_available: boolean | null
          max_possible_quantity: number | null
          missing_ingredients: Json[] | null
          name: string | null
          selling_price: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      analyze_inventory_needs: {
        Args: Record<PropertyKey, never>
        Returns: {
          ingredient_id: string
          needed_quantity: number
          priority: string
        }[]
      }
      calculate_recipe_hpp: {
        Args: { recipe_id: string }
        Returns: number
      }
      consume_ingredients_for_order: {
        Args: { order_uuid: string }
        Returns: undefined
      }
      get_sync_dashboard_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_role: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      log_sync_event: {
        Args: {
          entity_id?: string
          entity_type?: string
          event_data?: Json
          event_type: string
        }
        Returns: string
      }
      optimize_production_schedule: {
        Args: { max_duration_hours?: number; target_date: string }
        Returns: {
          estimated_duration: number
          ingredient_availability: boolean
          priority_score: number
          profit_potential: number
          recipe_id: string
          recipe_name: string
          suggested_quantity: number
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      test_confirm_order: {
        Args: Record<PropertyKey, never> | { p_order_id: string }
        Returns: Json
      }
      test_create_order: {
        Args:
          | Record<PropertyKey, never>
          | { p_customer_name?: string; p_customer_phone?: string }
        Returns: Json
      }
      update_customer_analytics: {
        Args: { customer_uuid: string }
        Returns: undefined
      }
      user_has_business_unit_access: {
        Args: {
          business_unit_val: Database["public"]["Enums"]["business_unit"]
          user_uuid?: string
        }
        Returns: boolean
      }
      user_has_permission: {
        Args: { permission_name: string; user_uuid?: string }
        Returns: boolean
      }
    }
    Enums: {
      business_unit: "kitchen" | "sales" | "inventory" | "finance" | "all"
      order_status:
        | "PENDING"
        | "CONFIRMED"
        | "IN_PROGRESS"
        | "READY"
        | "DELIVERED"
        | "CANCELLED"
      payment_method:
        | "CASH"
        | "BANK_TRANSFER"
        | "CREDIT_CARD"
        | "DIGITAL_WALLET"
        | "OTHER"
      production_status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
      record_type: "INCOME" | "EXPENSE" | "INVESTMENT" | "WITHDRAWAL"
      transaction_type: "PURCHASE" | "USAGE" | "ADJUSTMENT" | "WASTE"
      user_role: "super_admin" | "admin" | "manager" | "staff" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      business_unit: ["kitchen", "sales", "inventory", "finance", "all"],
      order_status: [
        "PENDING",
        "CONFIRMED",
        "IN_PROGRESS",
        "READY",
        "DELIVERED",
        "CANCELLED",
      ],
      payment_method: [
        "CASH",
        "BANK_TRANSFER",
        "CREDIT_CARD",
        "DIGITAL_WALLET",
        "OTHER",
      ],
      production_status: ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      record_type: ["INCOME", "EXPENSE", "INVESTMENT", "WITHDRAWAL"],
      transaction_type: ["PURCHASE", "USAGE", "ADJUSTMENT", "WASTE"],
      user_role: ["super_admin", "admin", "manager", "staff", "viewer"],
    },
  },
} as const
