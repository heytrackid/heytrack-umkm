import type { Database as DatabaseType } from './supabase-generated'

import type {
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
