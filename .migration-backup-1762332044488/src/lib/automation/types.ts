// Re-export types from the main automation types file
export type {
  // Database types
  Recipe,
  Ingredient,
  RecipeIngredient,
  
  // Configuration
  AutomationConfig,
  
  // Pricing types
  PricingOption,
  CompetitivePricing,
  PricingBreakdown,
  ProfitabilityAnalysis,
  SmartPricingResult,
  
  // Inventory types
  InventoryStatus,
  ReorderUrgency,
  ReorderRecommendation,
  InventoryAnalysis,
  
  // Production types
  IngredientRequirement,
  AvailabilityCheck,
  ProductionTimeInfo,
  ProductionPlanItem,
  ProductionPlanSummary,
  ProductionPlan,
  
  // Financial types
  SaleData,
  ExpenseData,
  FinancialMetrics,
  FinancialTrend,
  FinancialAlert,
  FinancialAnalysis,
  
  // Notification types
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  SmartNotification,
  
  // Workflow types
  WorkflowEvent,
  WorkflowEventData,
  WorkflowResult,
  WorkflowContext
} from '@/types/features/automation'