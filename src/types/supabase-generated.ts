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
          user_id: string
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
      chat_context_cache: {
        Row: {
          context_type: string
          created_at: string
          data: Json
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          context_type: string
          created_at?: string
          data: Json
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          context_type?: string
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          context_snapshot: Json | null
          created_at: string
          deleted_at: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_snapshot?: Json | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_snapshot?: Json | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_history: {
        Row: {
          content: string
          context: Json | null
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          context?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          context?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_sessions: {
        Row: {
          context_summary: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          message_count: number | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context_summary?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context_summary?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          title?: string | null
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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
      error_logs: {
        Row: {
          created_at: string | null
          endpoint: string
          error_message: string
          error_type: string
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          request_data: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          stack_trace: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          error_message: string
          error_type: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          request_data?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          stack_trace?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          error_message?: string
          error_type?: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          request_data?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          stack_trace?: string | null
          timestamp?: string
          user_id?: string | null
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
          user_id: string
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
          user_id: string
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
          user_id?: string
        }
        Relationships: []
      }
      hpp_alerts: {
        Row: {
          affected_components: Json | null
          alert_type: string
          change_percentage: number | null
          created_at: string | null
          dismissed_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          new_value: number | null
          old_value: number | null
          read_at: string | null
          recipe_id: string
          severity: string
          threshold: number | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          affected_components?: Json | null
          alert_type: string
          change_percentage?: number | null
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          new_value?: number | null
          old_value?: number | null
          read_at?: string | null
          recipe_id: string
          severity: string
          threshold?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          affected_components?: Json | null
          alert_type?: string
          change_percentage?: number | null
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          new_value?: number | null
          old_value?: number | null
          read_at?: string | null
          recipe_id?: string
          severity?: string
          threshold?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hpp_alerts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hpp_alerts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
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
        Relationships: [
          {
            foreignKeyName: "hpp_calculations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hpp_calculations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      hpp_history: {
        Row: {
          change_percentage: number | null
          change_reason: string | null
          created_at: string | null
          hpp_value: number
          id: string
          ingredient_cost: number
          operational_cost: number
          recipe_id: string
          recorded_at: string | null
          user_id: string
        }
        Insert: {
          change_percentage?: number | null
          change_reason?: string | null
          created_at?: string | null
          hpp_value: number
          id?: string
          ingredient_cost: number
          operational_cost: number
          recipe_id: string
          recorded_at?: string | null
          user_id: string
        }
        Update: {
          change_percentage?: number | null
          change_reason?: string | null
          created_at?: string | null
          hpp_value?: number
          id?: string
          ingredient_cost?: number
          operational_cost?: number
          recipe_id?: string
          recorded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hpp_history_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hpp_history_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      hpp_recommendations: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_implemented: boolean | null
          potential_savings: number | null
          priority: string | null
          recipe_id: string | null
          recommendation_type: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_implemented?: boolean | null
          potential_savings?: number | null
          priority?: string | null
          recipe_id?: string | null
          recommendation_type: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_implemented?: boolean | null
          potential_savings?: number | null
          priority?: string | null
          recipe_id?: string | null
          recommendation_type?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hpp_recommendations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hpp_recommendations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_purchases: {
        Row: {
          cost_per_unit: number | null
          created_at: string
          expense_id: string | null
          id: string
          ingredient_id: string
          notes: string | null
          purchase_date: string
          quantity: number
          supplier: string | null
          total_price: number
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string
          expense_id?: string | null
          id?: string
          ingredient_id: string
          notes?: string | null
          purchase_date?: string
          quantity: number
          supplier?: string | null
          total_price: number
          unit_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string
          expense_id?: string | null
          id?: string
          ingredient_id?: string
          notes?: string | null
          purchase_date?: string
          quantity?: number
          supplier?: string | null
          total_price?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_purchases_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_purchases_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "inventory_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_purchases_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "inventory_status"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          available_stock: number | null
          category: string | null
          cost_per_batch: number | null
          created_at: string | null
          created_by: string | null
          current_stock: number | null
          description: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          last_ordered_at: string | null
          last_purchase_date: string | null
          lead_time: number | null
          lead_time_days: number | null
          max_stock: number | null
          min_stock: number | null
          name: string
          price_per_unit: number
          reorder_point: number | null
          reserved_stock: number | null
          supplier: string | null
          supplier_contact: string | null
          tags: string[] | null
          unit: string
          updated_at: string | null
          updated_by: string | null
          usage_rate: number | null
          user_id: string
          weighted_average_cost: number
        }
        Insert: {
          available_stock?: number | null
          category?: string | null
          cost_per_batch?: number | null
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          last_ordered_at?: string | null
          last_purchase_date?: string | null
          lead_time?: number | null
          lead_time_days?: number | null
          max_stock?: number | null
          min_stock?: number | null
          name: string
          price_per_unit: number
          reorder_point?: number | null
          reserved_stock?: number | null
          supplier?: string | null
          supplier_contact?: string | null
          tags?: string[] | null
          unit: string
          updated_at?: string | null
          updated_by?: string | null
          usage_rate?: number | null
          user_id: string
          weighted_average_cost?: number
        }
        Update: {
          available_stock?: number | null
          category?: string | null
          cost_per_batch?: number | null
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          last_ordered_at?: string | null
          last_purchase_date?: string | null
          lead_time?: number | null
          lead_time_days?: number | null
          max_stock?: number | null
          min_stock?: number | null
          name?: string
          price_per_unit?: number
          reorder_point?: number | null
          reserved_stock?: number | null
          supplier?: string | null
          supplier_contact?: string | null
          tags?: string[] | null
          unit?: string
          updated_at?: string | null
          updated_by?: string | null
          usage_rate?: number | null
          user_id?: string
          weighted_average_cost?: number
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
            referencedRelation: "inventory_availability"
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
      inventory_reorder_rules: {
        Row: {
          created_at: string | null
          id: string
          ingredient_id: string
          is_active: boolean | null
          reorder_point: number
          reorder_quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_id: string
          is_active?: boolean | null
          reorder_point?: number
          reorder_quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_id?: string
          is_active?: boolean | null
          reorder_point?: number
          reorder_quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reorder_rules_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: true
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reorder_rules_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: true
            referencedRelation: "inventory_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reorder_rules_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: true
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
            referencedRelation: "inventory_availability"
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
      notification_preferences: {
        Row: {
          alert_enabled: boolean | null
          created_at: string | null
          email_digest: boolean | null
          email_digest_frequency: string | null
          email_enabled: boolean | null
          error_enabled: boolean | null
          finance_enabled: boolean | null
          group_similar_enabled: boolean | null
          group_time_window: number | null
          id: string
          info_enabled: boolean | null
          inventory_enabled: boolean | null
          min_priority: string | null
          orders_enabled: boolean | null
          production_enabled: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sound_enabled: boolean | null
          sound_for_urgent_only: boolean | null
          sound_volume: number | null
          success_enabled: boolean | null
          system_enabled: boolean | null
          updated_at: string | null
          user_id: string
          warning_enabled: boolean | null
        }
        Insert: {
          alert_enabled?: boolean | null
          created_at?: string | null
          email_digest?: boolean | null
          email_digest_frequency?: string | null
          email_enabled?: boolean | null
          error_enabled?: boolean | null
          finance_enabled?: boolean | null
          group_similar_enabled?: boolean | null
          group_time_window?: number | null
          id?: string
          info_enabled?: boolean | null
          inventory_enabled?: boolean | null
          min_priority?: string | null
          orders_enabled?: boolean | null
          production_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sound_enabled?: boolean | null
          sound_for_urgent_only?: boolean | null
          sound_volume?: number | null
          success_enabled?: boolean | null
          system_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          warning_enabled?: boolean | null
        }
        Update: {
          alert_enabled?: boolean | null
          created_at?: string | null
          email_digest?: boolean | null
          email_digest_frequency?: string | null
          email_enabled?: boolean | null
          error_enabled?: boolean | null
          finance_enabled?: boolean | null
          group_similar_enabled?: boolean | null
          group_time_window?: number | null
          id?: string
          info_enabled?: boolean | null
          inventory_enabled?: boolean | null
          min_priority?: string | null
          orders_enabled?: boolean | null
          production_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sound_enabled?: boolean | null
          sound_for_urgent_only?: boolean | null
          sound_volume?: number | null
          success_enabled?: boolean | null
          system_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          warning_enabled?: boolean | null
        }
        Relationships: []
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      operational_costs: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string
          frequency: string | null
          id: string
          is_active: boolean
          notes: string | null
          payment_method: string | null
          recurring: boolean | null
          reference: string | null
          supplier: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description: string
          frequency?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          payment_method?: string | null
          recurring?: boolean | null
          reference?: string | null
          supplier?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string
          frequency?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          payment_method?: string | null
          recurring?: boolean | null
          reference?: string | null
          supplier?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          hpp_at_order: number | null
          id: string
          order_id: string
          product_name: string | null
          profit_amount: number | null
          profit_margin: number | null
          quantity: number
          recipe_id: string
          special_requests: string | null
          total_price: number
          unit_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          hpp_at_order?: number | null
          id?: string
          order_id: string
          product_name?: string | null
          profit_amount?: number | null
          profit_margin?: number | null
          quantity: number
          recipe_id: string
          special_requests?: string | null
          total_price: number
          unit_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          hpp_at_order?: number | null
          id?: string
          order_id?: string
          product_name?: string | null
          profit_amount?: number | null
          profit_margin?: number | null
          quantity?: number
          recipe_id?: string
          special_requests?: string | null
          total_price?: number
          unit_price?: number
          updated_at?: string | null
          user_id?: string
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
          estimated_production_time: number | null
          financial_record_id: string | null
          id: string
          notes: string | null
          order_date: string | null
          order_no: string
          paid_amount: number | null
          payment_method: string | null
          payment_status: string | null
          priority: string | null
          production_batch_id: string | null
          production_priority: string | null
          special_instructions: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
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
          estimated_production_time?: number | null
          financial_record_id?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_no: string
          paid_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          priority?: string | null
          production_batch_id?: string | null
          production_priority?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
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
          estimated_production_time?: number | null
          financial_record_id?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_no?: string
          paid_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          priority?: string | null
          production_batch_id?: string | null
          production_priority?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_financial_record_id_fkey"
            columns: ["financial_record_id"]
            isOneToOne: false
            referencedRelation: "financial_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_production_batch_id_fkey"
            columns: ["production_batch_id"]
            isOneToOne: false
            referencedRelation: "productions"
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
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          order_id: string
          reference?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          order_id?: string
          reference?: string | null
          user_id?: string
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
      performance_logs: {
        Row: {
          created_at: string | null
          duration_ms: number
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          request_body: Json | null
          response_body: Json | null
          status: number
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms: number
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          request_body?: Json | null
          response_body?: Json | null
          status: number
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          request_body?: Json | null
          response_body?: Json | null
          status?: number
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      production_batches: {
        Row: {
          actual_cost: number | null
          batch_number: string
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          planned_date: string
          quantity: number
          recipe_id: string
          started_at: string | null
          status: string
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          batch_number: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          planned_date: string
          quantity: number
          recipe_id: string
          started_at?: string | null
          status?: string
          unit: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          batch_number?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          planned_date?: string
          quantity?: number
          recipe_id?: string
          started_at?: string | null
          status?: string
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_batches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_batches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
          actual_end_time: string | null
          actual_labor_cost: number | null
          actual_material_cost: number | null
          actual_overhead_cost: number | null
          actual_quantity: number | null
          actual_start_time: string | null
          actual_total_cost: number | null
          batch_status: string | null
          completed_at: string | null
          completed_time: string | null
          cost_per_unit: number
          created_at: string | null
          created_by: string | null
          id: string
          labor_cost: number
          notes: string | null
          planned_start_time: string | null
          quantity: number
          recipe_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["production_status"] | null
          total_cost: number
          total_orders: number | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_labor_cost?: number | null
          actual_material_cost?: number | null
          actual_overhead_cost?: number | null
          actual_quantity?: number | null
          actual_start_time?: string | null
          actual_total_cost?: number | null
          batch_status?: string | null
          completed_at?: string | null
          completed_time?: string | null
          cost_per_unit: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          labor_cost?: number
          notes?: string | null
          planned_start_time?: string | null
          quantity: number
          recipe_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["production_status"] | null
          total_cost: number
          total_orders?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          actual_end_time?: string | null
          actual_labor_cost?: number | null
          actual_material_cost?: number | null
          actual_overhead_cost?: number | null
          actual_quantity?: number | null
          actual_start_time?: string | null
          actual_total_cost?: number | null
          batch_status?: string | null
          completed_at?: string | null
          completed_time?: string | null
          cost_per_unit?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          labor_cost?: number
          notes?: string | null
          planned_start_time?: string | null
          quantity?: number
          recipe_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["production_status"] | null
          total_cost?: number
          total_orders?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
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
          user_id: string
        }
        Insert: {
          id?: string
          ingredient_id: string
          quantity: number
          recipe_id: string
          unit: string
          user_id: string
        }
        Update: {
          id?: string
          ingredient_id?: string
          quantity?: number
          recipe_id?: string
          unit?: string
          user_id?: string
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
            referencedRelation: "inventory_availability"
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
          previous_cost: number | null
          rating: number | null
          seasonal: boolean | null
          selling_price: number | null
          servings: number | null
          times_made: number | null
          total_revenue: number | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
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
          previous_cost?: number | null
          rating?: number | null
          seasonal?: boolean | null
          selling_price?: number | null
          servings?: number | null
          times_made?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
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
          previous_cost?: number | null
          rating?: number | null
          seasonal?: boolean | null
          selling_price?: number | null
          servings?: number | null
          times_made?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stock_reservations: {
        Row: {
          consumed_at: string | null
          created_at: string | null
          id: string
          ingredient_id: string
          notes: string | null
          order_id: string
          released_at: string | null
          reserved_at: string | null
          reserved_quantity: number
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string | null
          id?: string
          ingredient_id: string
          notes?: string | null
          order_id: string
          released_at?: string | null
          reserved_at?: string | null
          reserved_quantity: number
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string | null
          id?: string
          ingredient_id?: string
          notes?: string | null
          order_id?: string
          released_at?: string | null
          reserved_at?: string | null
          reserved_quantity?: number
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_reservations_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "inventory_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "inventory_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          type: Database["public"]["Enums"]["transaction_type"]
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
          type?: Database["public"]["Enums"]["transaction_type"]
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
            referencedRelation: "inventory_availability"
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
            referencedRelation: "inventory_availability"
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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
          quantity_used?: number
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
            referencedRelation: "inventory_availability"
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
          user_id: string
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
          user_id: string
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
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      inventory_availability: {
        Row: {
          availability_status: string | null
          available_stock: number | null
          current_stock: number | null
          id: string | null
          min_stock: number | null
          name: string | null
          reorder_point: number | null
          reserved_stock: number | null
          unit: string | null
          user_id: string | null
        }
        Insert: {
          availability_status?: never
          available_stock?: number | null
          current_stock?: number | null
          id?: string | null
          min_stock?: number | null
          name?: string | null
          reorder_point?: number | null
          reserved_stock?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          availability_status?: never
          available_stock?: number | null
          current_stock?: number | null
          id?: string | null
          min_stock?: number | null
          name?: string | null
          reorder_point?: number | null
          reserved_stock?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      calculate_ingredient_wac: {
        Args: { p_ingredient_id: string }
        Returns: number
      }
      calculate_recipe_hpp: {
        Args: { recipe_uuid: string }
        Returns: {
          can_produce: boolean
          cost_per_serving: number
          max_possible_batches: number
          total_ingredient_cost: number
        }[]
      }
      clean_old_logs: { Args: never; Returns: undefined }
      cleanup_expired_context_cache: { Args: never; Returns: undefined }
      create_default_whatsapp_templates: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      decrement_ingredient_stock: {
        Args: { p_ingredient_id: string; p_quantity: number }
        Returns: {
          current_stock: number
          id: string
          updated_at: string
        }[]
      }
      get_active_connections: { Args: never; Returns: number }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_database_size: { Args: never; Returns: string }
      get_foreign_key_constraints: {
        Args: never
        Returns: {
          column_name: string
          constraint_name: string
          foreign_column: string
          foreign_table: string
          table_name: string
        }[]
      }
      get_table_sizes: {
        Args: never
        Returns: {
          index_size: string
          row_count: number
          table_name: string
          table_size: string
        }[]
      }
      get_total_rows: { Args: never; Returns: number }
      get_unread_alert_count: { Args: { p_user_id: string }; Returns: number }
      get_user_role: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      increment_ingredient_stock: {
        Args: { p_ingredient_id: string; p_quantity: number }
        Returns: {
          current_stock: number
          id: string
          updated_at: string
        }[]
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
      validate_data_integrity: {
        Args: never
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
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
