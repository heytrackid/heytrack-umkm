import type {
  Database as DatabaseType,
  Tables as SupabaseTables, 
  TablesInsert as SupabaseTablesInsert, 
  TablesUpdate as SupabaseTablesUpdate,
  Enums as SupabaseEnums
} from './supabase-generated'

// Core Supabase-generated helpers
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from './supabase-generated'

// Re-export Json type from supabase-generated
export type { Json } from './supabase-generated'

// Import Database type for generic helpers

// Generic type helpers for table operations
export type TableName = keyof DatabaseType['public']['Tables']
export type Row<T extends TableName> = DatabaseType['public']['Tables'][T]['Row']
export type Insert<T extends TableName> = DatabaseType['public']['Tables'][T]['Insert']
export type Update<T extends TableName> = DatabaseType['public']['Tables'][T]['Update']

// Helper type for nested relations
export type WithNestedRelation<T, K extends string, R> = T & { [P in K]: R }

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
export type ExpensesTable = SupabaseTables<'expenses'>
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
export type UsageAnalyticsTable = SupabaseTables<'usage_analytics'>
export type UserProfilesTable = SupabaseTables<'user_profiles'>
export type WhatsappTemplatesTable = SupabaseTables<'whatsapp_templates'>

// View types - using Tables helper (works for both tables and views)
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
export type ExpensesInsert = SupabaseTablesInsert<'expenses'>
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
export type ExpensesUpdate = SupabaseTablesUpdate<'expenses'>
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
export type PaymentStatus = string

// ============================================
// EXTENDED TYPES WITH RELATIONS
// ============================================

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

// ============================================
// UTILITY TYPES
// ============================================

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

// ============================================
// DOMAIN-SPECIFIC TYPES
// ============================================

// Stock Reservation Status
export type StockReservationStatus = 'ACTIVE' | 'CONSUMED' | 'RELEASED' | 'EXPIRED'

// Stock Reservation with relations
export interface StockReservation {
  id: string
  ingredient_id: string
  order_id: string
  reserved_quantity: number
  status: StockReservationStatus
  reserved_at: string | null
  consumed_at: string | null
  released_at: string | null
  notes: string | null
  user_id: string
  created_at: string | null
  updated_at: string | null
}

export type StockReservationInsert = Omit<StockReservation, 'id' | 'created_at' | 'updated_at'>
export type StockReservationUpdate = Partial<StockReservationInsert>

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

// Inventory Status
export interface InventoryStatus {
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  min_stock: number
  reorder_point: number
  status: 'OK' | 'LOW' | 'OUT_OF_STOCK' | 'REORDER_NEEDED'
}

// Production Batch Status
export type BatchStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

// ============================================
// FORM TYPES
// ============================================

// Form data types (for client-side forms)
export type IngredientFormData = Omit<IngredientsInsert, 'id' | 'created_at' | 'updated_at' | 'user_id'>
export type RecipeFormData = Omit<RecipesInsert, 'id' | 'created_at' | 'updated_at' | 'user_id'>
export type OrderFormData = Omit<OrdersInsert, 'id' | 'created_at' | 'updated_at' | 'user_id'>
export type CustomerFormData = Omit<CustomersInsert, 'id' | 'created_at' | 'updated_at' | 'user_id'>
export type SupplierFormData = Omit<SuppliersInsert, 'id' | 'created_at' | 'updated_at' | 'user_id'>

// ============================================
// QUERY FILTER TYPES
// ============================================

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

// ============================================
// CONSTANTS
// ============================================

// Table names as const for type safety
export const TABLE_NAMES = {
  INGREDIENTS: 'ingredients',
  RECIPES: 'recipes',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  PRODUCTIONS: 'productions',
  FINANCIAL_RECORDS: 'financial_records',
  EXPENSES: 'expenses',
  STOCK_TRANSACTIONS: 'stock_transactions',
  NOTIFICATIONS: 'notifications',
} as const

export type TableNameConstant = typeof TABLE_NAMES[keyof typeof TABLE_NAMES]
