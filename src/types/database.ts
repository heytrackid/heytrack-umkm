import type {
    Database as DatabaseType,
    Enums as SupabaseEnums,
    Tables as SupabaseTables,
    TablesInsert as SupabaseTablesInsert,
    TablesUpdate as SupabaseTablesUpdate,
} from '@/types/supabase-generated'

// Core Supabase-generated helpers
export type {
    CompositeTypes,
    Database,
    Enums, Json, Tables,
    TablesInsert,
    TablesUpdate
} from './supabase-generated'

// Generic type helpers for table operations
export type TableName = string
export type ViewName = string
export type Row<T extends TableName> = T extends keyof DatabaseType['public']['Tables'] ? DatabaseType['public']['Tables'][T]['Row'] : Record<string, unknown>
export type Insert<T extends TableName> = T extends keyof DatabaseType['public']['Tables'] ? DatabaseType['public']['Tables'][T]['Insert'] : Record<string, unknown>
export type Update<T extends TableName> = T extends keyof DatabaseType['public']['Tables'] ? DatabaseType['public']['Tables'][T]['Update'] : Record<string, unknown>

// Fallback types for tables that might not exist in generated types
export type SafeRow<T extends string> = T extends TableName ? Row<T> : Record<string, unknown>
export type SafeInsert<T extends string> = T extends TableName
  ? Insert<T>
  : Record<string, unknown>
export type SafeUpdate<T extends string> = T extends TableName
  ? Update<T>
  : Record<string, unknown>

// Helper type for nested relations
export type WithNestedRelation<T, K extends string, R> = T & Record<K, R>

// Table Row types (for SELECT queries) - using Tables helper from supabase-generated
export type AppSettingsTable = SupabaseTables<'app_settings'>
export type ChatContextCacheTable = SupabaseTables<'chat_context_cache'>
export type ChatMessagesTable = SupabaseTables<'chat_messages'>
export type ChatSessionsTable = SupabaseTables<'chat_sessions'>
export type ConversationHistoryTable = SupabaseTables<'conversation_history'>
export type ConversationSessionsTable = SupabaseTables<'conversation_sessions'>
export type CustomersTable = SupabaseTables<'customers'>
export type DailySalesSummaryTable = SupabaseTables<'daily_sales_summary'>
export type ErrorLogsTable = SupabaseTables<'error_logs'>
export type FinancialRecordsTable = SupabaseTables<'financial_records'>
export type HppAlertsTable = SupabaseTables<'hpp_alerts'>
export type HppCalculationsTable = SupabaseTables<'hpp_calculations'>
export type HppHistoryTable = SupabaseTables<'hpp_history'>
export type HppRecommendationsTable = SupabaseTables<'hpp_recommendations'>
export type IngredientPurchasesTable = SupabaseTables<'ingredient_purchases'>
export type IngredientsTable = SupabaseTables<'ingredients'>
export type InventoryAlertsTable = SupabaseTables<'inventory_alerts'>
export type InventoryReorderRulesTable = SupabaseTables<'inventory_reorder_rules'>
export type InventoryStockLogsTable = SupabaseTables<'inventory_stock_logs'>
export type NotificationPreferencesTable = SupabaseTables<'notification_preferences'>
export type NotificationsTable = SupabaseTables<'notifications'>
export type OperationalCostsTable = SupabaseTables<'operational_costs'>
export type OrderItemsTable = SupabaseTables<'order_items'>
export type OrdersTable = SupabaseTables<'orders'>
export type PaymentsTable = SupabaseTables<'payments'>
export type PerformanceLogsTable = SupabaseTables<'performance_logs'>
export type ProductionBatchesTable = SupabaseTables<'production_batches'>
export type ProductionSchedulesTable = SupabaseTables<'production_schedules'>
export type ProductionsTable = SupabaseTables<'productions'>
export type RecipeIngredientsTable = SupabaseTables<'recipe_ingredients'>
export type RecipesTable = SupabaseTables<'recipes'>
export type StockTransactionsTable = SupabaseTables<'stock_transactions'>
export type SupplierIngredientsTable = SupabaseTables<'supplier_ingredients'>
export type SuppliersTable = SupabaseTables<'suppliers'>
export type StockReservationsTable = SupabaseTables<'stock_reservations'>
export type UsageAnalyticsTable = SupabaseTables<'usage_analytics'>
export type UserProfilesTable = SupabaseTables<'user_profiles'>
export type WhatsappTemplatesTable = SupabaseTables<'whatsapp_templates'>

// View types - using Tables helper (works for both tables and views)
export type InventoryAvailabilityView = SupabaseTables<'inventory_availability'>
export type InventoryStatusView = SupabaseTables<'inventory_status'>
export type OrderSummaryView = SupabaseTables<'order_summary'>
export type RecipeAvailabilityView = SupabaseTables<'recipe_availability'>

// Insert types (for INSERT operations) - using TablesInsert helper from supabase-generated
export type AppSettingsInsert = SupabaseTablesInsert<'app_settings'>
export type ChatContextCacheInsert = SupabaseTablesInsert<'chat_context_cache'>
export type ChatMessagesInsert = SupabaseTablesInsert<'chat_messages'>
export type ChatSessionsInsert = SupabaseTablesInsert<'chat_sessions'>
export type ConversationHistoryInsert = SupabaseTablesInsert<'conversation_history'>
export type ConversationSessionsInsert = SupabaseTablesInsert<'conversation_sessions'>
export type CustomersInsert = SupabaseTablesInsert<'customers'>
export type DailySalesSummaryInsert = SupabaseTablesInsert<'daily_sales_summary'>
export type ErrorLogsInsert = SupabaseTablesInsert<'error_logs'>
export type FinancialRecordsInsert = SupabaseTablesInsert<'financial_records'>
export type HppAlertsInsert = SupabaseTablesInsert<'hpp_alerts'>
export type HppCalculationsInsert = SupabaseTablesInsert<'hpp_calculations'>
export type HppHistoryInsert = SupabaseTablesInsert<'hpp_history'>
export type HppRecommendationsInsert = SupabaseTablesInsert<'hpp_recommendations'>
export type IngredientPurchasesInsert = SupabaseTablesInsert<'ingredient_purchases'>
export type IngredientsInsert = SupabaseTablesInsert<'ingredients'>
export type InventoryAlertsInsert = SupabaseTablesInsert<'inventory_alerts'>
export type InventoryReorderRulesInsert = SupabaseTablesInsert<'inventory_reorder_rules'>
export type InventoryStockLogsInsert = SupabaseTablesInsert<'inventory_stock_logs'>
export type NotificationPreferencesInsert = SupabaseTablesInsert<'notification_preferences'>
export type NotificationsInsert = SupabaseTablesInsert<'notifications'>
export type OperationalCostsInsert = SupabaseTablesInsert<'operational_costs'>
export type OrderItemsInsert = SupabaseTablesInsert<'order_items'>
export type OrdersInsert = SupabaseTablesInsert<'orders'>
export type PaymentsInsert = SupabaseTablesInsert<'payments'>
export type PerformanceLogsInsert = SupabaseTablesInsert<'performance_logs'>
export type ProductionBatchesInsert = SupabaseTablesInsert<'production_batches'>
export type ProductionSchedulesInsert = SupabaseTablesInsert<'production_schedules'>
export type ProductionsInsert = SupabaseTablesInsert<'productions'>
export type RecipeIngredientsInsert = SupabaseTablesInsert<'recipe_ingredients'>
export type RecipesInsert = SupabaseTablesInsert<'recipes'>
export type StockTransactionsInsert = SupabaseTablesInsert<'stock_transactions'>
export type SupplierIngredientsInsert = SupabaseTablesInsert<'supplier_ingredients'>
export type SuppliersInsert = SupabaseTablesInsert<'suppliers'>
export type StockReservationsInsert = SupabaseTablesInsert<'stock_reservations'>
export type UsageAnalyticsInsert = SupabaseTablesInsert<'usage_analytics'>
export type UserProfilesInsert = SupabaseTablesInsert<'user_profiles'>
export type WhatsappTemplatesInsert = SupabaseTablesInsert<'whatsapp_templates'>

// Update types (for UPDATE operations) - using TablesUpdate helper from supabase-generated
export type AppSettingsUpdate = SupabaseTablesUpdate<'app_settings'>
export type ChatContextCacheUpdate = SupabaseTablesUpdate<'chat_context_cache'>
export type ChatMessagesUpdate = SupabaseTablesUpdate<'chat_messages'>
export type ChatSessionsUpdate = SupabaseTablesUpdate<'chat_sessions'>
export type ConversationHistoryUpdate = SupabaseTablesUpdate<'conversation_history'>
export type ConversationSessionsUpdate = SupabaseTablesUpdate<'conversation_sessions'>
export type CustomersUpdate = SupabaseTablesUpdate<'customers'>
export type DailySalesSummaryUpdate = SupabaseTablesUpdate<'daily_sales_summary'>
export type ErrorLogsUpdate = SupabaseTablesUpdate<'error_logs'>
export type FinancialRecordsUpdate = SupabaseTablesUpdate<'financial_records'>
export type HppAlertsUpdate = SupabaseTablesUpdate<'hpp_alerts'>
export type HppCalculationsUpdate = SupabaseTablesUpdate<'hpp_calculations'>
export type HppHistoryUpdate = SupabaseTablesUpdate<'hpp_history'>
export type HppRecommendationsUpdate = SupabaseTablesUpdate<'hpp_recommendations'>
export type IngredientPurchasesUpdate = SupabaseTablesUpdate<'ingredient_purchases'>
export type IngredientsUpdate = SupabaseTablesUpdate<'ingredients'>
export type InventoryAlertsUpdate = SupabaseTablesUpdate<'inventory_alerts'>
export type InventoryReorderRulesUpdate = SupabaseTablesUpdate<'inventory_reorder_rules'>
export type InventoryStockLogsUpdate = SupabaseTablesUpdate<'inventory_stock_logs'>
export type NotificationPreferencesUpdate = SupabaseTablesUpdate<'notification_preferences'>
export type NotificationsUpdate = SupabaseTablesUpdate<'notifications'>
export type OperationalCostsUpdate = SupabaseTablesUpdate<'operational_costs'>
export type OrderItemsUpdate = SupabaseTablesUpdate<'order_items'>
export type OrdersUpdate = SupabaseTablesUpdate<'orders'>
export type PaymentsUpdate = SupabaseTablesUpdate<'payments'>
export type PerformanceLogsUpdate = SupabaseTablesUpdate<'performance_logs'>
export type ProductionBatchesUpdate = SupabaseTablesUpdate<'production_batches'>
export type ProductionSchedulesUpdate = SupabaseTablesUpdate<'production_schedules'>
export type ProductionsUpdate = SupabaseTablesUpdate<'productions'>
export type RecipeIngredientsUpdate = SupabaseTablesUpdate<'recipe_ingredients'>
export type RecipesUpdate = SupabaseTablesUpdate<'recipes'>
export type StockTransactionsUpdate = SupabaseTablesUpdate<'stock_transactions'>
export type SupplierIngredientsUpdate = SupabaseTablesUpdate<'supplier_ingredients'>
export type SuppliersUpdate = SupabaseTablesUpdate<'suppliers'>
export type StockReservationsUpdate = SupabaseTablesUpdate<'stock_reservations'>
export type UsageAnalyticsUpdate = SupabaseTablesUpdate<'usage_analytics'>
export type UserProfilesUpdate = SupabaseTablesUpdate<'user_profiles'>
export type WhatsappTemplatesUpdate = SupabaseTablesUpdate<'whatsapp_templates'>

// Enum types - using Enums helper from supabase-generated
export type BusinessUnit = SupabaseEnums<'business_unit'>
export type OrderStatus = SupabaseEnums<'order_status'>
export type PaymentMethod = SupabaseEnums<'payment_method'>
export type ProductionStatus = SupabaseEnums<'production_status'>
export type RecordType = SupabaseEnums<'record_type'>
export type TransactionType = SupabaseEnums<'transaction_type'>
export type UserRole = SupabaseEnums<'user_role'>

// Note: payment_status is stored as string in the database, not an enum
// This is just for type consistency in our code
export type PaymentStatus = 'CANCELLED' | 'PAID' | 'PARTIAL' | 'PENDING' | 'REFUNDED'

// Stock reservation status (stored as string in database)
export type StockReservationStatus = 'ACTIVE' | 'CONSUMED' | 'EXPIRED' | 'RELEASED'

// Batch status (stored as string in database)
export type BatchStatus = 'CANCELLED' | 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED'

// ==================================
// EXTENDED TYPES WITH RELATIONS
// ==================================

// Order with relations
export type OrderWithItems = OrdersTable & {
  order_items: OrderItemsTable[]
  customer: CustomersTable | null
}

export type OrderWithFullDetails = OrdersTable & {
  order_items: Array<OrderItemsTable & {
    recipe: RecipesTable | null
  }>
  customer: CustomersTable | null
  payments: PaymentsTable[]
}

// Recipe with relations
export type RecipeWithIngredients = RecipesTable & {
  recipe_ingredients: Array<RecipeIngredientsTable & {
    ingredient: IngredientsTable | null
  }>
}

// Ingredient with relations
export type IngredientWithSuppliers = IngredientsTable & {
  supplier_ingredients: Array<SupplierIngredientsTable & {
    supplier: SuppliersTable | null
  }>
}

// Production with relations
export type ProductionWithRecipe = ProductionsTable & {
  recipe: RecipesTable | null
}

// Supplier with relations
export type SupplierWithIngredients = SuppliersTable & {
  supplier_ingredients: Array<SupplierIngredientsTable & {
    ingredient: IngredientsTable | null
  }>
}

// ==================================
// UTILITY TYPES
// ==================================

// Extract specific fields from table
export type PickFields<T extends TableName, K extends keyof Row<T>> = Pick<Row<T>, K>

// Make specific fields optional
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Make specific fields required
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Pagination result type
export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// API Response types
export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  details?: unknown
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// ==================================
// DOMAIN-SPECIFIC TYPES
// ==================================

// Stock Reservation - using generated types
export type StockReservation = StockReservationsTable

// Order Item with calculated fields
export type OrderItemWithProfit = OrderItemsTable & {
  hpp_at_order: number
  profit_amount: number
  profit_margin: number
}

// Financial Summary
export interface FinancialSummary {
  totalRevenue: number
  totalCogs: number
  totalProfit: number
  profitMargin: number
  period: {
    start: string
    end: string
  }
}

// Inventory Status (custom type for business logic)
export interface InventoryStatusCustom {
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  min_stock: number
  reorder_point: number
  status: 'LOW' | 'OK' | 'OUT_OF_STOCK' | 'REORDER_NEEDED'
}

// ==================================
// FORM TYPES
// ==================================

// Form data types (for client-side forms)
export type IngredientFormData = Omit<IngredientsInsert, 'created_at' | 'id' | 'updated_at' | 'user_id'>
export type RecipeFormData = Omit<RecipesInsert, 'created_at' | 'id' | 'updated_at' | 'user_id'>
export type OrderFormData = Omit<OrdersInsert, 'created_at' | 'id' | 'updated_at' | 'user_id'>
export type CustomerFormData = Omit<CustomersInsert, 'created_at' | 'id' | 'updated_at' | 'user_id'>
export type SupplierFormData = Omit<SuppliersInsert, 'created_at' | 'id' | 'updated_at' | 'user_id'>

// ==================================
// QUERY FILTER TYPES
// ==================================

export interface DateRangeFilter {
  start: string
  end: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

export interface SearchParams {
  query: string
  fields?: string[]
}

// ==================================
// CONSTANTS
// ==================================

// Table names as const for type safety
export const TABLE_NAMES = {
  APP_SETTINGS: 'app_settings',
  CHAT_CONTEXT_CACHE: 'chat_context_cache',
  CHAT_MESSAGES: 'chat_messages',
  CHAT_SESSIONS: 'chat_sessions',
  CONVERSATION_HISTORY: 'conversation_history',
  CONVERSATION_SESSIONS: 'conversation_sessions',
  CUSTOMERS: 'customers',
  DAILY_SALES_SUMMARY: 'daily_sales_summary',
  ERROR_LOGS: 'error_logs',
  EXPENSES: 'expenses',
  FINANCIAL_RECORDS: 'financial_records',
  HPP_ALERTS: 'hpp_alerts',
  HPP_CALCULATIONS: 'hpp_calculations',
  HPP_HISTORY: 'hpp_history',
  HPP_RECOMMENDATIONS: 'hpp_recommendations',
  INGREDIENT_PURCHASES: 'ingredient_purchases',
  INGREDIENTS: 'ingredients',
  INVENTORY_ALERTS: 'inventory_alerts',
  INVENTORY_REORDER_RULES: 'inventory_reorder_rules',
  INVENTORY_STOCK_LOGS: 'inventory_stock_logs',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  NOTIFICATIONS: 'notifications',
  OPERATIONAL_COSTS: 'operational_costs',
  ORDER_ITEMS: 'order_items',
  ORDERS: 'orders',
  PAYMENTS: 'payments',
  PERFORMANCE_LOGS: 'performance_logs',
  PRODUCTION_BATCHES: 'production_batches',
  PRODUCTION_SCHEDULES: 'production_schedules',
  PRODUCTIONS: 'productions',
  RECIPE_INGREDIENTS: 'recipe_ingredients',
  RECIPES: 'recipes',
  STOCK_RESERVATIONS: 'stock_reservations',
  STOCK_TRANSACTIONS: 'stock_transactions',
  SUPPLIER_INGREDIENTS: 'supplier_ingredients',
  SUPPLIERS: 'suppliers',
  USAGE_ANALYTICS: 'usage_analytics',
  USER_PROFILES: 'user_profiles',
  WHATSAPP_TEMPLATES: 'whatsapp_templates',
} as const

export const VIEW_NAMES = {
  INVENTORY_AVAILABILITY: 'inventory_availability',
  INVENTORY_STATUS: 'inventory_status',
  ORDER_SUMMARY: 'order_summary',
  RECIPE_AVAILABILITY: 'recipe_availability',
} as const

export type TableNameConstant = (typeof TABLE_NAMES)[keyof typeof TABLE_NAMES]
export type ViewNameConstant = (typeof VIEW_NAMES)[keyof typeof VIEW_NAMES]
