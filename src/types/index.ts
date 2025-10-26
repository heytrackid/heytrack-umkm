import type { Json } from './common'

// Import enums
import type { BusinessUnit, OrderStatus, PaymentMethod, ProductionStatus, RecordType, TransactionType, UserRole } from './enums'
import { DatabaseEnums } from './enums'

// Import table types
import type { UserProfilesTable } from './auth'
import type { CustomersTable } from './customers'
import type { DailySalesSummaryTable, FinancialRecordsTable } from './finance'
import type { IngredientPurchasesTable } from './ingredient-purchases'
import type {
  IngredientsTable,
  InventoryAlertsTable,
  InventoryStatusView,
  InventoryStockLogsTable,
  StockTransactionsTable,
  SupplierIngredientsTable,
  UsageAnalyticsTable
} from './inventory'
import type { InventoryReorderRulesTable } from './inventory-reorder'
import type { NotificationsTable } from './notifications'
import type { OperationalCostsTable } from './operational-costs'
import type {
  OrderItemsTable,
  OrdersTable,
  OrderSummaryView,
  PaymentsTable
} from './orders'
import type {
  ProductionSchedulesTable,
  ProductionsTable,
  RecipeAvailabilityView,
  RecipeIngredientsTable,
  RecipesTable
} from './recipes'
import type { SuppliersTable } from './suppliers'
import type { RecentSyncEventsView, SyncEventsTable, SystemMetricsTable } from './sync'

// Import functions
import type { DatabaseFunctions } from './functions'

// Import additional types
import type { AuditFields, SecurityContext, UserProfile } from './auth'
import type { BahanBaku, BahanBakuFormData, InventoryStockLog } from './inventory'
import type { SyncEvent, SystemMetric } from './sync'

// Import HPP tracking types
import type { CostBreakdown } from './hpp-tracking'

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
      bahan_baku: {
        Row: BahanBaku
        Insert: Omit<BahanBaku, 'id' | 'created_at'>
        Update: Partial<Omit<BahanBaku, 'id' | 'account_id' | 'created_at'>>
        Relationships: []
      }
      inventory_alerts: InventoryAlertsTable
      inventory_stock_logs: InventoryStockLogsTable
      inventory_reorder_rules: InventoryReorderRulesTable
      ingredient_purchases: IngredientPurchasesTable
      operational_costs: OperationalCostsTable
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
      hpp_snapshots: {
        Row: {
          id: string
          recipe_id: string
          snapshot_date: string
          hpp_value: number
          material_cost: number
          operational_cost: number
          cost_breakdown: CostBreakdown
          selling_price: number | null
          margin_percentage: number | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          recipe_id: string
          snapshot_date?: string
          hpp_value: number
          material_cost: number
          operational_cost: number
          cost_breakdown: CostBreakdown
          selling_price?: number | null
          margin_percentage?: number | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          recipe_id?: string
          snapshot_date?: string
          hpp_value?: number
          material_cost?: number
          operational_cost?: number
          cost_breakdown?: CostBreakdown
          selling_price?: number | null
          margin_percentage?: number | null
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hpp_snapshots_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hpp_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      hpp_alerts: {
        Row: {
          id: string
          recipe_id: string
          alert_type: string
          severity: string
          title: string
          message: string
          old_value: number
          new_value: number
          change_percentage: number
          affected_components: Json | null
          is_read: boolean
          is_dismissed: boolean
          read_at: string | null
          dismissed_at: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          recipe_id: string
          alert_type: string
          severity: string
          title: string
          message: string
          old_value: number
          new_value: number
          change_percentage: number
          affected_components?: Json | null
          is_read?: boolean
          is_dismissed?: boolean
          read_at?: string | null
          dismissed_at?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          recipe_id?: string
          alert_type?: string
          severity?: string
          title?: string
          message?: string
          old_value?: number
          new_value?: number
          change_percentage?: number
          affected_components?: Json | null
          is_read?: boolean
          is_dismissed?: boolean
          read_at?: string | null
          dismissed_at?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hpp_alerts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hpp_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
          reference_type: string | null
          reference_id: string | null
          created_at: string | null
          updated_at: string | null
          user_id: string
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
          reference_type?: string | null
          reference_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id: string
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
          reference_type?: string | null
          reference_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string
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
    Enums: typeof DatabaseEnums
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
export type HPPSnapshotsTable = Database['public']['Tables']['hpp_snapshots']
export type HPPAlertsTable = Database['public']['Tables']['hpp_alerts']

// Re-export all types
export type {
  AuditFields, BahanBaku, BahanBakuFormData, BusinessUnit,
  // Table types
  CustomersTable, DailySalesSummaryTable,
  // Core types
  DatabaseEnums,
  DatabaseFunctions, FinancialRecordsTable, IngredientPurchasesTable, IngredientsTable,
  InventoryAlertsTable,
  InventoryStatusView, InventoryStockLog, InventoryStockLogsTable, Json, NotificationsTable, OrderItemsTable, OrdersTable, OrderStatus, OrderSummaryView, PaymentMethod, PaymentsTable, ProductionSchedulesTable,
  ProductionsTable, ProductionStatus, RecentSyncEventsView, RecipeAvailabilityView, RecipeIngredientsTable, RecipesTable, RecordType, SecurityContext, StockTransactionsTable,
  SupplierIngredientsTable, SuppliersTable, SyncEvent, SyncEventsTable, SystemMetric, SystemMetricsTable, TransactionType, UsageAnalyticsTable,
  // Additional types
  UserProfile, UserProfilesTable,
  // Enum types
  UserRole
}

// Re-export HPP tracking types
export type {
  AffectedComponents,
  ComponentChange,
  CostBreakdown,
  HPPAlert,
  HPPComparison,
  HPPExportData,
  HPPRecommendation,
  HPPSnapshot,
  HPPTrendData,
  IngredientCost,
  OperationalCost,
  TimePeriod
} from './hpp-tracking'

// Re-export form types
export type {
  ArrayItemUpdate,
  FormAction,
  FormFieldUpdate,
  FormFieldUpdater,
  FormState,
  FormValidationError,
  FormValidationResult,
  OrderItemUpdate
} from './forms'

// Re-export analytics types
export type {
  BusinessSummary,
  CompetitorPrice,
  CostBreakdownAnalysis,
  CustomerSegment,
  DashboardAnalytics,
  ExpenseCategory,
  FinancialAnalytics,
  InventoryAlert,
  InventoryAnalysis,
  InventoryMetrics,
  InventoryStatus,
  MarketComparison,
  PricingAnalysis,
  PricingImpact,
  PricingRecommendation,
  PricingTier,
  PricingTiers,
  ProductPerformance,
  RevenueCategory,
  SalesAnalytics,
  SalesTrend,
  SystemAlert,
  TimePeriod as AnalyticsTimePeriod
} from './analytics'

// Re-export export types
export type {
  BatchExportConfig,
  BorderStyle,
  CSVExportOptions,
  CellStyle,
  ColumnConfig,
  ExcelExportOptions,
  ExcelStyles,
  ExportData,
  ExportFormat,
  ExportMetadata,
  ExportOptions,
  ExportResult,
  ExportTemplate,
  ImportData,
  ImportError,
  ImportMetadata,
  ImportOptions,
  ImportWarning
} from './export'

// Re-export chart types
export type {
  BarChartData,
  BarChartSeries,
  ChartConfig,
  ChartDataPoint,
  ChartDataset,
  ChartDataTransformer,
  ChartFilterOptions,
  ChartFont,
  ChartLegend,
  ChartOptions,
  ChartProps,
  ChartScale,
  ChartScales,
  ChartSeriesConfig,
  ChartTitle,
  ChartTooltip,
  ChartType,
  HeatmapData,
  LineChartData,
  LineChartSeries,
  MultiSeriesChartData,
  PieChartData,
  ScatterDataPoint,
  TimeSeriesDataPoint
} from './charts'

// Re-export notification types
export type {
  NotificationCategory,
  NotificationData,
  NotificationPreferences,
  NotificationPriority,
  NotificationType,
  SmartNotification
} from './notifications'

// Re-export common aliases
export type Ingredient = IngredientsTable['Row']
export type Recipe = RecipesTable['Row']
export type RecipeIngredient = RecipeIngredientsTable['Row']
export type Order = OrdersTable['Row']
export type OrderItem = OrderItemsTable['Row']
export type Customer = CustomersTable['Row']
export type Supplier = SuppliersTable['Row']

export type RecipeWithIngredients = Recipe & {
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: Ingredient
  }>
}

// Re-export type guards and validation functions
export {
  assertArrayOf,
  assertCustomer,
  assertIngredient,
  assertNonNull,
  assertOrder,
  assertOrderItem,
  assertRecipe,
  assertRecipeIngredient,
  assertRecipeWithIngredients,
  assertSupplier,
  isApiError,
  isApiResponse,
  isArrayOf,
  isBoolean,
  isCustomer,
  isDateString,
  isHppSnapshot,
  isIngredient,
  isIngredientPurchase,
  isNonNegativeNumber,
  isNonNull,
  isNumber,
  isOrder,
  isOrderItem,
  isOrderStatus,
  isPartialOf,
  isPaymentStatus,
  isPositiveNumber,
  isRecord,
  isRecipe,
  isRecipeIngredient,
  isRecipeWithIngredients,
  isString,
  isSupplier,
  isUserProfile,
  isUUID,
  validateIngredient,
  validateOrder,
  validateOrderItem,
  validateRecipe
} from './guards'

// Constants
export const Constants = {
  public: {
    Enums: DatabaseEnums,
  },
} as const
