import type { Json } from './common'

// Import enums
import type { DatabaseEnums } from './enums'
import type { UserRole, BusinessUnit, OrderStatus, PaymentMethod, ProductionStatus, RecordType, TransactionType } from './enums'

// Import table types
import type { CustomersTable } from './customers'
import type { SuppliersTable } from './suppliers'
import type {
  IngredientsTable,
  InventoryAlertsTable,
  InventoryStatusView,
  InventoryStockLogsTable,
  StockTransactionsTable,
  SupplierIngredientsTable,
  UsageAnalyticsTable
} from './inventory'
import type { NotificationsTable } from './notifications'
import type {
  OrdersTable,
  OrderItemsTable,
  OrderSummaryView,
  PaymentsTable
} from './orders'
import type {
  ProductionsTable,
  ProductionSchedulesTable,
  RecipeAvailabilityView,
  RecipeIngredientsTable,
  RecipesTable
} from './recipes'
import type { DailySalesSummaryTable, FinancialRecordsTable } from './finance'
import type { SyncEventsTable, SystemMetricsTable, RecentSyncEventsView } from './sync'
import type { UserProfilesTable } from './auth'

// Import functions
import type { DatabaseFunctions } from './functions'

// Import additional types
import type { UserProfile, SecurityContext, AuditFields } from './auth'
import type { SyncEvent, SystemMetric } from './sync'
import type { InventoryStockLog } from './inventory'

// Main Database type
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      customers: CustomersTable
      suppliers: SuppliersTable
      ingredients: IngredientsTable
      inventory_alerts: InventoryAlertsTable
      inventory_stock_logs: InventoryStockLogsTable
      notifications: NotificationsTable
      order_items: OrderItemsTable
      orders: OrdersTable
      payments: PaymentsTable
      production_schedules: ProductionSchedulesTable
      productions: ProductionsTable
      recipe_ingredients: RecipeIngredientsTable
      recipes: RecipesTable
      stock_transactions: StockTransactionsTable
      supplier_ingredients: SupplierIngredientsTable
      sync_events: SyncEventsTable
      system_metrics: SystemMetricsTable
      usage_analytics: UsageAnalyticsTable
      user_profiles: UserProfilesTable
      daily_sales_summary: DailySalesSummaryTable
      financial_records: FinancialRecordsTable
      whatsapp_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          template_content: string
          variables: Json | null
          is_active: boolean | null
          is_default: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string
          template_content: string
          variables?: Json | null
          is_active?: boolean | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          template_content?: string
          variables?: Json | null
          is_active?: boolean | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          user_id: string
          settings_data: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          settings_data: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          settings_data?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          amount: number
          category: string
          description: string
          expense_date: string | null
          receipt_number: string | null
          supplier: string | null
          tax_amount: number | null
          is_recurring: boolean | null
          recurring_frequency: string | null
          payment_method: string | null
          status: string | null
          subcategory: string | null
          tags: Json | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          amount: number
          category: string
          description: string
          expense_date?: string | null
          receipt_number?: string | null
          supplier?: string | null
          tax_amount?: number | null
          is_recurring?: boolean | null
          recurring_frequency?: string | null
          payment_method?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: Json | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          amount?: number
          category?: string
          description?: string
          expense_date?: string | null
          receipt_number?: string | null
          supplier?: string | null
          tax_amount?: number | null
          is_recurring?: boolean | null
          recurring_frequency?: string | null
          payment_method?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: Json | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      inventory_status: InventoryStatusView
      order_summary: OrderSummaryView
      recent_sync_events: RecentSyncEventsView
      recipe_availability: RecipeAvailabilityView
    }
    Functions: DatabaseFunctions
    Enums: DatabaseEnums
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
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

// Type aliases for inline table definitions
export type ExpensesTable = Database['public']['Tables']['expenses']
export type AppSettingsTable = Database['public']['Tables']['app_settings']
export type WhatsAppTemplatesTable = Database['public']['Tables']['whatsapp_templates']

// Re-export all types
export type {
  // Core types
  DatabaseEnums,
  DatabaseFunctions,
  Json,
  
  // Enum types
  UserRole,
  BusinessUnit,
  OrderStatus,
  PaymentMethod,
  ProductionStatus,
  RecordType,
  TransactionType,
  
  // Table types
  CustomersTable,
  SuppliersTable,
  IngredientsTable,
  InventoryAlertsTable,
  InventoryStatusView,
  InventoryStockLogsTable,
  StockTransactionsTable,
  SupplierIngredientsTable,
  UsageAnalyticsTable,
  OrdersTable,
  OrderItemsTable,
  OrderSummaryView,
  PaymentsTable,
  RecipesTable,
  RecipeIngredientsTable,
  ProductionSchedulesTable,
  ProductionsTable,
  RecipeAvailabilityView,
  FinancialRecordsTable,
  DailySalesSummaryTable,
  NotificationsTable,
  SyncEventsTable,
  SystemMetricsTable,
  RecentSyncEventsView,
  UserProfilesTable,
  
  // Additional types
  UserProfile,
  SecurityContext,
  AuditFields,
  SyncEvent,
  SystemMetric,
  InventoryStockLog
}

// Constants
export const Constants = {
  public: {
    Enums: DatabaseEnums,
  },
} as const
