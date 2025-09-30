'use client'

/**
 * Enhanced Forms - Code Split Version
 * 
 * This file now exports lazy-loaded form components for better performance.
 * Individual form components are split into separate files for code splitting.
 * 
 * @deprecated Direct imports from this file. Use individual form imports instead:
 * - import { IngredientForm } from '@/components/forms/IngredientForm'
 * - import { RecipeForm } from '@/components/forms/RecipeForm'
 * - import { CustomerForm } from '@/components/forms/CustomerForm'
 * - import { FinancialRecordForm } from '@/components/forms/FinancialRecordForm'
 * 
 * Or use lazy-loaded versions from '@/components/forms'
 */

// Re-export lazy components for backward compatibility
export { 
  LazyIngredientForm as IngredientForm,
  LazyRecipeForm as RecipeForm, 
  LazyCustomerForm as CustomerForm,
  LazyFinancialRecordForm as FinancialRecordForm,
  EnhancedForms,
  LazyFormWrapper,
  preloadIngredientForm,
  preloadRecipeForm,
  preloadCustomerForm,
  preloadFinancialRecordForm
} from './index'

// Re-export shared FormField component
export { FormField } from './shared/FormField'

// Default export for backward compatibility
export default EnhancedForms
