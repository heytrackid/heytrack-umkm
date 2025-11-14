
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
  CompositeTypes, Database, Enums, Tables,
  TablesInsert,
  TablesUpdate
} from './supabase-generated'

// Re-export helper types from database.ts
export type { Insert, Row, TableName, Update, ViewName } from './database'

// Note: database.ts is a backward compatibility layer that re-exports from this file
// Do not export from it here to avoid circular dependencies

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

// Import Row type for convenience aliases
import type { Row } from '@/types/database'

export type Ingredient = Row<'ingredients'>
export type Recipe = Row<'recipes'>
export type RecipeIngredient = Row<'recipe_ingredients'>
export type Order = Row<'orders'>
export type OrderItem = Row<'order_items'>
export type Customer = Row<'customers'>
export type Supplier = Row<'suppliers'>
export type FinancialRecord = Row<'financial_records'>
export type OperationalCost = Row<'operational_costs'>

// Complex types
export type RecipeWithIngredients = Recipe & {
  recipe_ingredients?: Array<
    RecipeIngredient & {
      ingredient?: Ingredient
    }
  >
}
