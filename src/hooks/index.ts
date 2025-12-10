/**
 * Central export for all React Query hooks
 * All hooks use React Query for data fetching, caching, and state management
 */

// Core entities
export * from './useCustomers'
export * from './useIngredients'
export * from './useRecipes'
export * from './useSuppliers'

// Production & Inventory
export * from './useIngredientPurchases'
export * from './useInventoryAlerts'
export * from './useProductionBatches'
export * from './useRecipeAvailability'
export * from './useReorderManagement'

// Financial
export * from './useCostAlerts'
export * from './useExpenses'
export * from './useFinancialRecords'
export * from './useFinancialTrends'
export * from './useOperationalCosts'

// HPP & Pricing
export * from './useHppData'
export * from './useOrderPricing'
export * from './useRecipeCostPreview'

// Orders & Recommendations
export * from './useOrderValidation'
export * from './useProductionTime'
export * from './useRecipeRecommendations'

// Communications
export * from './useWhatsAppTemplates'

// Reports & Analytics
export * from './useProfitAnalysis'
export * from './useReports'

// Settings
export * from './useSettings'

// AI & Chatbot
export * from './api/useAIRecipeEnhanced'
export * from './useAIChat'
export * from './useChatHistory'
export * from './useContextAwareChat'
export * from './useDashboardSchedule'
export * from './useRecipeWorker'

// Export utilities
export * from './useGlobalExport'

// Shared utilities
export * from './use-toast'
export * from './usePreloading'
export * from './useUpdateChecker'

// Re-export from other locations for backward compatibility
export * from './api/useDashboard'
export * from './api/useNotifications'
export * from './api/useOrders'
export * from './useAuth'

