// Re-export all types from the modular structure for backward compatibility
// This file maintains the old import path while using the new split structure

export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
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
  // Enum types
  UserRole,
  BusinessUnit,
  OrderStatus,
  PaymentMethod,
  ProductionStatus,
  RecordType,
  TransactionType,
  // Additional types
  UserProfile,
  SecurityContext,
  AuditFields,
  SyncEvent,
  SystemMetric,
  InventoryStockLog,
  // Constants
  Constants
} from './index'

export type {
  Json
} from './common'

export {
  DatabaseEnums
} from './enums'
