import type { Database as SupabaseDatabase } from './supabase-generated'

// Core Supabase-generated helpers
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from './supabase-generated'

export type { Json } from './shared/common'

// Backwards compatibility exports for auth/domain helpers
export type {
  AuditFields,
  BusinessUnit,
  SecurityContext,
  UserProfile,
  UserProfilesTable,
  UserRole,
} from './features/auth'

type PublicSchema = SupabaseDatabase['public']
type TablesMap = PublicSchema['Tables']
type ViewsMap = PublicSchema['Views']
type EnumsMap = PublicSchema['Enums']

export type CustomersTable = TablesMap['customers']
export type DailySalesSummaryTable = ViewsMap['daily_sales_summary']
export type FinancialRecordsTable = TablesMap['financial_records']
export type IngredientPurchasesTable = TablesMap['ingredient_purchases']
export type IngredientsTable = TablesMap['ingredients']
export type InventoryAlertsTable = TablesMap['inventory_alerts']
export type OrderItemsTable = TablesMap['order_items']
export type OrdersTable = TablesMap['orders']
export type PaymentsTable = TablesMap['payments']
export type ProductionSchedulesTable = TablesMap['production_schedules']
export type ProductionsTable = TablesMap['productions']
export type RecipeIngredientsTable = TablesMap['recipe_ingredients']
export type RecipesTable = TablesMap['recipes']
export type StockTransactionsTable = TablesMap['stock_transactions']
export type SupplierIngredientsTable = TablesMap['supplier_ingredients']
export type SuppliersTable = TablesMap['suppliers']
export type UsageAnalyticsTable = TablesMap['usage_analytics']

export type OrderSummaryView = ViewsMap['order_summary']
export type RecipeAvailabilityView = ViewsMap['recipe_availability']

export type OrderStatus = EnumsMap['order_status']
export type PaymentMethod = EnumsMap['payment_method']
export type ProductionStatus = EnumsMap['production_status']
export type RecordType = EnumsMap['record_type']
export type TransactionType = EnumsMap['transaction_type']

export type SyncEvent = SyncEventsTable['Row']
export type SystemMetric = SystemMetricsTable['Row']
export type SyncEventInsert = SyncEventsTable['Insert']
export type SyncEventUpdate = SyncEventsTable['Update']

// Maintain compatibility for old naming
export type DatabasePublicSchema = PublicSchema
