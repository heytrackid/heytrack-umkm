/**
 * Validation Domains Module Exports
 * Centralized exports for domain-specific validation schemas and helpers
 */

// Types and interfaces
export * from './customer'
export * from './order'
export * from './ingredient'
export * from './recipe'
export * from './supplier'
export * from './finance'
export * from './common'

// Validation helpers
export { CustomerValidationHelpers } from './customer-helpers'
export { OrderValidationHelpers } from './order-helpers'
export { IngredientValidationHelpers } from './ingredient-helpers'
export { RecipeValidationHelpers } from './recipe-helpers'

// Enhanced schemas with business rules
export type {
  EnhancedCustomerInsert,
  EnhancedCustomerUpdate
} from './customer-helpers'

export type {
  EnhancedOrderInsert,
  EnhancedOrderUpdate
} from './order-helpers'

export type {
  EnhancedIngredientInsert,
  EnhancedIngredientUpdate
} from './ingredient-helpers'

export type {
  EnhancedRecipeInsert,
  EnhancedRecipeUpdate
} from './recipe-helpers'
