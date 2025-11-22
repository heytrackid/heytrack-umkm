// Re-export types from Supabase generated types with cleaner names
import type { Database, Enums, Tables, TablesInsert, TablesUpdate } from './supabase-generated'

// Re-export main types
export type { Database }

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

// Core Business Tables
export type Ingredient = Tables<'ingredients'>
export type Recipe = Tables<'recipes'>
export type RecipeIngredient = Tables<'recipe_ingredients'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Customer = Tables<'customers'>

// Production Tables
export type Production = Tables<'productions'>
export type ProductionBatch = Tables<'production_batches'>
export type ProductionSchedule = Tables<'production_schedules'>

// Financial Tables
export type FinancialRecord = Tables<'financial_records'>
export type OperationalCost = Tables<'operational_costs'>
export type Payment = Tables<'payments'>

// HPP (Cost Calculation) Tables
export type HppCalculation = Tables<'hpp_calculations'>
export type HppHistory = Tables<'hpp_history'>
export type HppAlert = Tables<'hpp_alerts'>
export type HppRecommendation = Tables<'hpp_recommendations'>

// Inventory Management Tables
export type IngredientPurchase = Tables<'ingredient_purchases'>
export type StockReservation = Tables<'stock_reservations'>
export type StockTransaction = Tables<'stock_transactions'>
export type InventoryAlert = Tables<'inventory_alerts'>
export type InventoryReorderRule = Tables<'inventory_reorder_rules'>
export type InventoryStockLog = Tables<'inventory_stock_logs'>

// Supplier Tables
export type Supplier = Tables<'suppliers'>
export type SupplierIngredient = Tables<'supplier_ingredients'>

// Notification Tables
export type Notification = Tables<'notifications'>
export type NotificationPreference = Tables<'notification_preferences'>

// User Tables
export type UserProfile = Tables<'user_profiles'>
export type UserOnboarding = Tables<'user_onboarding'>

// Analytics Tables
export type UsageAnalytics = Tables<'usage_analytics'>
export type DailySalesSummary = Tables<'daily_sales_summary'>

// Chat/AI Tables
export type ChatSession = Tables<'chat_sessions'>
export type ChatMessage = Tables<'chat_messages'>
export type ChatContextCache = Tables<'chat_context_cache'>

// System Tables
export type WhatsAppTemplate = Tables<'whatsapp_templates'>
export type AppSettings = Tables<'app_settings'>
export type ErrorLog = Tables<'error_logs'>
export type PerformanceLog = Tables<'performance_logs'>

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Type to bypass Row Level Security for admin operations
export type BypassRLS<T> = T & { _bypass_rls?: true }

// ============================================================================
// INSERT TYPES
// ============================================================================

export type IngredientInsert = TablesInsert<'ingredients'>
export type RecipeInsert = TablesInsert<'recipes'>
export type RecipeIngredientInsert = TablesInsert<'recipe_ingredients'>
export type OrderInsert = TablesInsert<'orders'>
export type OrderItemInsert = TablesInsert<'order_items'>
export type CustomerInsert = TablesInsert<'customers'>
export type ProductionInsert = TablesInsert<'productions'>
export type ProductionBatchInsert = TablesInsert<'production_batches'>
export type ProductionScheduleInsert = TablesInsert<'production_schedules'>
export type FinancialRecordInsert = TablesInsert<'financial_records'>
export type OperationalCostInsert = TablesInsert<'operational_costs'>
export type PaymentInsert = TablesInsert<'payments'>
export type HppCalculationInsert = TablesInsert<'hpp_calculations'>
export type HppHistoryInsert = TablesInsert<'hpp_history'>
export type HppAlertInsert = TablesInsert<'hpp_alerts'>
export type HppRecommendationInsert = TablesInsert<'hpp_recommendations'>
export type IngredientPurchaseInsert = TablesInsert<'ingredient_purchases'>
export type StockReservationInsert = TablesInsert<'stock_reservations'>
export type StockTransactionInsert = TablesInsert<'stock_transactions'>
export type InventoryAlertInsert = TablesInsert<'inventory_alerts'>
export type InventoryReorderRuleInsert = TablesInsert<'inventory_reorder_rules'>
export type SupplierInsert = TablesInsert<'suppliers'>
export type SupplierIngredientInsert = TablesInsert<'supplier_ingredients'>
export type NotificationInsert = TablesInsert<'notifications'>
export type NotificationPreferenceInsert = TablesInsert<'notification_preferences'>
export type UserProfileInsert = TablesInsert<'user_profiles'>
export type UserOnboardingInsert = TablesInsert<'user_onboarding'>
export type UsageAnalyticsInsert = TablesInsert<'usage_analytics'>
export type DailySalesSummaryInsert = TablesInsert<'daily_sales_summary'>
export type ChatSessionInsert = TablesInsert<'chat_sessions'>
export type ChatMessageInsert = TablesInsert<'chat_messages'>
export type WhatsAppTemplateInsert = TablesInsert<'whatsapp_templates'>
export type AppSettingsInsert = TablesInsert<'app_settings'>
export type ErrorLogInsert = TablesInsert<'error_logs'>
export type PerformanceLogInsert = TablesInsert<'performance_logs'>

// ============================================================================
// UPDATE TYPES
// ============================================================================

export type IngredientUpdate = TablesUpdate<'ingredients'>
export type RecipeUpdate = TablesUpdate<'recipes'>
export type RecipeIngredientUpdate = TablesUpdate<'recipe_ingredients'>
export type OrderUpdate = TablesUpdate<'orders'>
export type OrderItemUpdate = TablesUpdate<'order_items'>
export type CustomerUpdate = TablesUpdate<'customers'>
export type ProductionUpdate = TablesUpdate<'productions'>
export type ProductionBatchUpdate = TablesUpdate<'production_batches'>
export type ProductionScheduleUpdate = TablesUpdate<'production_schedules'>
export type FinancialRecordUpdate = TablesUpdate<'financial_records'>
export type OperationalCostUpdate = TablesUpdate<'operational_costs'>
export type PaymentUpdate = TablesUpdate<'payments'>
export type HppCalculationUpdate = TablesUpdate<'hpp_calculations'>
export type HppHistoryUpdate = TablesUpdate<'hpp_history'>
export type HppAlertUpdate = TablesUpdate<'hpp_alerts'>
export type HppRecommendationUpdate = TablesUpdate<'hpp_recommendations'>
export type IngredientPurchaseUpdate = TablesUpdate<'ingredient_purchases'>
export type StockReservationUpdate = TablesUpdate<'stock_reservations'>
export type StockTransactionUpdate = TablesUpdate<'stock_transactions'>
export type InventoryAlertUpdate = TablesUpdate<'inventory_alerts'>
export type SupplierUpdate = TablesUpdate<'suppliers'>
export type SupplierIngredientUpdate = TablesUpdate<'supplier_ingredients'>
export type NotificationUpdate = TablesUpdate<'notifications'>
export type NotificationPreferenceUpdate = TablesUpdate<'notification_preferences'>
export type UserProfileUpdate = TablesUpdate<'user_profiles'>
export type UserOnboardingUpdate = TablesUpdate<'user_onboarding'>
export type UsageAnalyticsUpdate = TablesUpdate<'usage_analytics'>
export type WhatsAppTemplateUpdate = TablesUpdate<'whatsapp_templates'>
export type AppSettingsUpdate = TablesUpdate<'app_settings'>

// ============================================================================
// VIEW TYPES
// ============================================================================

export type InventoryStatus = Tables<'inventory_status'>
export type InventoryAvailability = Tables<'inventory_availability'>
export type OrderSummary = Tables<'order_summary'>
export type RecipeAvailability = Tables<'recipe_availability'>

// ============================================================================
// ENUM TYPES
// ============================================================================

export type OrderStatus = Enums<'order_status'>
export type PaymentMethod = Enums<'payment_method'>
export type ProductionStatus = Enums<'production_status'>
export type RecordType = Enums<'record_type'>
export type TransactionType = Enums<'transaction_type'>
export type UserRole = Enums<'user_role'>
export type BusinessUnit = Enums<'business_unit'>
export type SupplierType = Enums<'supplier_type'>

// ============================================================================
// HELPER TYPES
// ============================================================================

// Type for recipe with ingredients populated
export type RecipeWithIngredients = Recipe & {
  recipe_ingredients: (RecipeIngredient & {
    ingredients: Ingredient
  })[]
}

// Type for order with items and customer
export type OrderWithDetails = Order & {
  order_items: (OrderItem & {
    recipes: Recipe
  })[]
  customers: Customer | null
}

// Type for order list view (simplified)
export type OrderListItem = Pick<Order,
  'id' | 'order_no' | 'customer_name' | 'customer_phone' |
  'delivery_date' | 'order_date' | 'total_amount' | 'status' | 'payment_status' |
  'priority' | 'created_at'
>

// Type for order card view
export type OrderCardItem = Pick<Order,
  'id' | 'order_no' | 'customer_name' | 'customer_phone' |
  'delivery_date' | 'total_amount' | 'status' | 'payment_status' |
  'priority' | 'notes'
>

// Type for order detail view (with nested items)
export type OrderDetailItem = Order & {
  order_items: (OrderItem & {
    recipe?: Pick<Recipe, 'id' | 'name' | 'image_url'>
  })[]
}

// Type for reorder suggestion with additional properties
export type ReorderSuggestionWithDetails = {
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  reorder_point: number
  suggested_quantity: number
  unit: string
  last_purchase_price: number | null
  estimated_cost: number
  priority: 'high' | 'medium' | 'low'
  reason?: string
  available_stock?: number
  reserved_stock?: number
  suggested_order_quantity?: number
  lead_time_days?: number
  urgency?: string
}

// Type for restock suggestion from API
export type RestockSuggestion = {
  ingredient_id: string
  ingredient_name: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  reorder_point: number
  suggested_order_quantity: number
  lead_time_days: number | null
  urgency: 'CRITICAL' | 'HIGH' | 'LOW' | 'MEDIUM'
  reason: string
}

// Type for restock suggestions summary
export type RestockSuggestionsSummary = {
  total: number
  critical: number
  high: number
  medium: number
  low: number
  total_suggested_cost: number
}

// Type for production with recipe
export type ProductionWithRecipe = Production & {
  recipes: Recipe
}

// Type for ingredient with stock info
export type IngredientWithStock = Ingredient & {
  available_stock: number
  reserved_stock: number
}

// ============================================================================
// LEGACY COMPATIBILITY (for gradual migration)
// ============================================================================

// Re-export generic helpers for backward compatibility
// These allow using Row<'table'>, Insert<'table'>, Update<'table'> syntax
export type { Enums, TablesInsert as Insert, Tables as Row, TablesUpdate as Update } from './supabase-generated'

// Re-export Json type for metadata fields
export type { Json } from './supabase-generated'

// Helper types for table and view names
export type TableName = keyof Database['public']['Tables']
export type ViewName = keyof Database['public']['Views']

