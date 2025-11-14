
/**
 * Main Types Export
 * 
 * Organized barrel export for all application types.
 * 
 * Structure:
 * - supabase-generated.ts: Auto-generated database types (70KB)
 * - domain/: Business logic types (recipes, orders, inventory, etc)
 * - features/: Application features (auth, chat, analytics, etc)
 * - ui/: Interface components (forms, charts, responsive)
 * - shared/: Utilities (common, api, errors, guards, utils)
 */

// ==========================================================
// DATABASE TYPES (Primary Source)
// ==========================================================
export type {
  Database,
  Enums,
  Insert, Json, Row, TableName, Update, ViewName
} from './database'

// ==========================================================
// DOMAIN TYPES (Business Logic)
// ==========================================================
// Domain types removed - use Tables helper from supabase-generated
// Example: type Recipe = Row<'recipes'>

// ==========================================================
// FEATURE TYPES (Application Features)
// ==========================================================
// Note: UserProfile is also exported from domain/auth, using that as primary
// export type * from './features/auth' // TODO: File missing - using Stack Auth instead
// Note: RateLimitError is also in shared/errors, using that as primary
export type {
  BusinessContext, ChatContextCache, ChatError, ChatMessage, ChatSession, ContextType, FinancialSummary, HppSummary, IngredientSummary, MessageMetadata, OrderSummary, RecipeSummary
} from './features/chat'
// Note: InventoryAlert is also in domain/inventory, using that as primary
export type {
  BusinessSummary, CompetitorPrice, CostBreakdownAnalysis, CustomerSegment,
  DashboardAnalytics, ExpenseCategory, FinancialAnalytics, InventoryAnalysis, InventoryMetrics, InventoryStatus, MarketComparison, PricingAnalysis, PricingImpact, PricingRecommendation, PricingTier, PricingTierOption, PricingTiers, ProductPerformance, RevenueCategory, SalesAnalytics, SalesTrend, SmartPricingAnalysis, SystemAlert, TimePeriod
} from './features/analytics'

export type * from './features/notifications'

// ==========================================================
// UI TYPES (Interface)
// ==========================================================
export type * from './ui/components'
// Note: OrderItemUpdate is also in domain/orders, using that as primary
export type * from './ui/charts'
export type {
  ArrayItemUpdate, FormAction, FormFieldUpdate,
  FormFieldUpdater, FormState, FormValidationError, FormValidationResult
} from './ui/forms'
export type * from './ui/responsive'

// ==========================================================
// SHARED TYPES (Utilities)
// ==========================================================
export type * from './shared/api'
export type * from './shared/common'
export * from './shared/errors'
export * from './shared/guards'
export type * from './shared/utils'

// ==========================================================
// CONVENIENCE ALIASES
// ==========================================================

// Re-export specific types from database.ts
export type {
  Customer, FinancialRecord, Ingredient, IngredientWithStock, OperationalCost, Order,
  OrderItem, OrderWithDetails,
  ProductionWithRecipe, Recipe,
  RecipeIngredient, RecipeWithIngredients, Supplier
} from './database'

