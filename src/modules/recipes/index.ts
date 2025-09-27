/**
 * Recipes Domain Module
 * Centralized exports untuk semua functionality terkait recipe management & HPP calculation
 */

// Core recipe components
export { default as RecipesPage } from './components/RecipesPage'
export { default as AdvancedHPPCalculator } from './components/AdvancedHPPCalculator'
export { default as SmartPricingAssistant } from './components/SmartPricingAssistant'

// Lazy loaded recipe components
export { 
  LazyAdvancedHPPCalculator,
  LazySmartPricingAssistant,
  preloadRecipeComponents,
  RecipeDashboardWithProgressiveLoading,
  useRecipeProgressiveLoading,
  SmartRecipeLoader
} from './components/LazyComponents'
export { default as RecipeDetailView } from './components/RecipeDetailView'
export { default as RecipeCard } from './components/RecipeCard'
export { default as HPPCalculator } from './components/HPPCalculator'
export { default as RecipeIngredientsList } from './components/RecipeIngredientsList'
export { default as RecipeSteps } from './components/RecipeSteps'

// Hooks
export { useRecipesData } from './hooks/useRecipesData'
export { useRecipeIngredients } from './hooks/useRecipeIngredients'
export { useHPPCalculation } from './hooks/useHPPCalculation'
export { useRecipeAnalytics } from './hooks/useRecipeAnalytics'

// Services
export { RecipesService } from './services/RecipesService'
export { HPPCalculationService } from './services/HPPCalculationService'
export { RecipeOptimizationService } from './services/RecipeOptimizationService'

// Types
export type {
  Recipe,
  RecipeIngredient,
  RecipeWithIngredients,
  HPPCalculation,
  RecipeStats,
  RecipeFilters,
  DifficultyLevel
} from './types'

// Utils
export { 
  calculateRecipeHPP,
  calculateIngredientCost,
  calculateProfitMargin,
  formatRecipeServings,
  scaleRecipe,
  validateRecipe
} from './utils'

// Constants
export { RECIPE_CATEGORIES, DIFFICULTY_LEVELS, MEASUREMENT_UNITS } from './constants'