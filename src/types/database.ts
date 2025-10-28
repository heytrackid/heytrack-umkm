// Re-export all types from the modular structure for backward compatibility
// This file maintains the old import path while using the new split structure

// Re-export types from domain files for backward compatibility
// Only include types that actually exist in the modular structure
export type {
    AuditFields, 
    BusinessUnit,
    CustomersTable, 
    DailySalesSummaryTable, 
    Database, 
    Enums, 
    FinancialRecordsTable, 
    IngredientPurchasesTable, 
    IngredientsTable,
    InventoryAlertsTable,
    OrderItemsTable, 
    OrderStatus, 
    OrderSummaryView, 
    OrdersTable, 
    PaymentMethod, 
    PaymentsTable, 
    ProductionSchedulesTable, 
    ProductionStatus, 
    ProductionsTable, 
    RecentSyncEventsView, 
    RecipeAvailabilityView, 
    RecipeIngredientsTable, 
    RecipesTable, 
    RecordType, 
    SecurityContext, 
    StockTransactionsTable,
    SupplierIngredientsTable, 
    SuppliersTable, 
    SyncEvent, 
    SyncEventsTable, 
    SystemMetric, 
    SystemMetricsTable, 
    Tables,
    TablesInsert,
    TablesUpdate, 
    TransactionType, 
    UsageAnalyticsTable,
    UserProfile, 
    UserProfilesTable,
    UserRole
} from './index'

export type {
    Json
} from './shared/common'

// Note: DatabaseEnums may not exist - check if needed
// export {
//     DatabaseEnums
// } from './enums'

