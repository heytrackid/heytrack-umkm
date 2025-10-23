// Re-export all types from the modular structure for backward compatibility
// This file maintains the old import path while using the new split structure

export type {
    AppSettingsTable, AuditFields, BusinessUnit,
    // Constants
    Constants,
    // Table types
    CustomersTable, DailySalesSummaryTable, Database, Enums, ExpensesTable, FinancialRecordsTable, HPPAlertsTable, HPPSnapshotsTable, IngredientPurchasesTable, IngredientsTable,
    InventoryAlertsTable, InventoryReorderRulesTable, InventoryStatusView, InventoryStockLog, InventoryStockLogsTable, NotificationsTable, OperationalCostsTable, OrderItemsTable, OrderStatus, OrderSummaryView, OrdersTable, PaymentMethod, PaymentsTable, ProductionSchedulesTable, ProductionStatus, ProductionsTable, RecentSyncEventsView, RecipeAvailabilityView, RecipeIngredientsTable, RecipesTable, RecordType, SecurityContext, StockTransactionsTable,
    SupplierIngredientsTable, SuppliersTable, SyncEvent, SyncEventsTable, SystemMetric, SystemMetricsTable, Tables,
    TablesInsert,
    TablesUpdate, TransactionType, UsageAnalyticsTable,
    // Additional types
    UserProfile, UserProfilesTable,
    // Enum types
    UserRole, WhatsAppTemplatesTable
} from './index'

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

export type {
    Json
} from './common'

export {
    DatabaseEnums
} from './enums'

