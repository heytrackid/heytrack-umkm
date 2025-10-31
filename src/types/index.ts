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

// ============================================================================
// DATABASE TYPES (Primary Source)
// ============================================================================
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes
} from './supabase-generated'

// Note: database.ts is a backward compatibility layer that re-exports from this file
// Do not export from it here to avoid circular dependencies

// ============================================================================
// DOMAIN TYPES (Business Logic)
// ============================================================================
// Domain types removed - use Tables helper from supabase-generated
// Example: type Recipe = Tables<'recipes'>

// ============================================================================
// FEATURE TYPES (Application Features)
// ============================================================================
// Note: UserProfile is also exported from domain/auth, using that as primary
export * from './features/auth'
// Note: RateLimitError is also in shared/errors, using that as primary
export type {
  ChatSession,
  ChatMessage,
  MessageMetadata,
  ChatContextCache,
  ContextType,
  BusinessContext,
  RecipeSummary,
  IngredientSummary,
  OrderSummary,
  HppSummary,
  FinancialSummary,
  ChatError
} from './features/chat'
// Note: InventoryAlert is also in domain/inventory, using that as primary
export type {
  SmartPricingAnalysis,
  PricingTierOption,
  InventoryAnalysis,
  InventoryStatus,
  InventoryMetrics,
  PricingAnalysis,
  CostBreakdownAnalysis,
  PricingTiers,
  PricingTier,
  PricingRecommendation,
  PricingImpact,
  MarketComparison,
  CompetitorPrice,
  SalesAnalytics,
  TimePeriod,
  SalesTrend,
  ProductPerformance,
  CustomerSegment,
  DashboardAnalytics,
  BusinessSummary,
  FinancialAnalytics,
  ExpenseCategory,
  RevenueCategory,
  SystemAlert
} from './features/analytics'

export * from './features/notifications'

// ============================================================================
// UI TYPES (Interface)
// ============================================================================
export * from './ui/components'
// Note: OrderItemUpdate is also in domain/orders, using that as primary
export type {
  FormFieldUpdate,
  FormFieldUpdater,
  ArrayItemUpdate,
  FormValidationResult,
  FormValidationError,
  FormState,
  FormAction
} from './ui/forms'
export * from './ui/charts'
export * from './ui/responsive'

// ============================================================================
// SHARED TYPES (Utilities)
// ============================================================================
export * from './shared/common'
export * from './shared/api'
export * from './shared/errors'
export * from './shared/guards'
export * from './shared/utils'

// ============================================================================
// CONVENIENCE ALIASES
// ============================================================================
import type { Tables } from './supabase-generated'

export type Ingredient = Tables<'ingredients'>
export type Recipe = Tables<'recipes'>
export type RecipeIngredient = Tables<'recipe_ingredients'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Customer = Tables<'customers'>
export type Supplier = Tables<'suppliers'>
export type Expense = Tables<'expenses'>
export type OperationalCost = Tables<'operational_costs'>

// Complex types
export type RecipeWithIngredients = Recipe & {
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: Ingredient
  }>
}
