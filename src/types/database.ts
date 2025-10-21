// Re-export all types from the modular structure for backward compatibility
// This file maintains the old import path while using the new split structure

export type {
    AppSettingsTable, AuditFields, BusinessUnit,
    // Constants
    Constants,
    // Table types
    CustomersTable, DailySalesSummaryTable, Database, Enums, ExpensesTable, FinancialRecordsTable, IngredientPurchasesTable, IngredientsTable,
    InventoryAlertsTable, InventoryReorderRulesTable, InventoryStatusView, InventoryStockLog, InventoryStockLogsTable, NotificationsTable, OperationalCostsTable, OrderItemsTable, OrderStatus, OrderSummaryView, OrdersTable, PaymentMethod, PaymentsTable, ProductionSchedulesTable, ProductionStatus, ProductionsTable, RecentSyncEventsView, RecipeAvailabilityView, RecipeIngredientsTable, RecipesTable, RecordType, SecurityContext, StockTransactionsTable,
    SupplierIngredientsTable, SuppliersTable, SyncEvent, SyncEventsTable, SystemMetric, SystemMetricsTable, Tables,
    TablesInsert,
    TablesUpdate, TransactionType, UsageAnalyticsTable,
    // Additional types
    UserProfile, UserProfilesTable,
    // Enum types
    UserRole, WhatsAppTemplatesTable
} from './index'

export type {
    Json
} from './common'

export {
    DatabaseEnums
} from './enums'

