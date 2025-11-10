

/**
 * Recipes Domain Module
 * Centralized exports untuk semua functionality terkait recipe management
 */

// Core recipe components
export { SmartPricingAssistant as SmartPricingAssistant } from './components/SmartPricingAssistant'

// Extracted HPP calculator components
export { UMKMTooltip } from './components/UMKMTooltip'
export { SettingsPanel } from './components/SettingsPanel'
export { MainResultsCard } from './components/MainResultsCard'
export { MethodComparisonCard } from './components/MethodComparisonCard'
export { RecommendationsCard } from './components/RecommendationsCard'
export { EducationalFooter } from './components/EducationalFooter'

// Lazy loaded recipe components
export { 
  LazySmartPricingAssistant,
  preloadRecipeComponents,
  RecipeDashboardWithProgressiveLoading,
  useRecipeProgressiveLoading,
  SmartRecipeLoader
} from './components/LazyComponents'

// Hooks
export { useRecipesData } from './hooks/useRecipesData'

// Utils
export { 
  calculateIngredientCost,
  calculateProfitMargin,
  formatRecipeServings,
  scaleRecipe,
  validateRecipe,
  getDifficultyInfo,
  getCategoryInfo,
  formatRecipeTime,
  calculateComplexityScore,
  generateRecipeSummary
} from './utils'

// Constants
export { 
  RECIPE_CATEGORIES, 
  DIFFICULTY_LEVELS, 
  MEASUREMENT_UNITS,
  MARGIN_PRESETS,
  OVERHEAD_RATES,
  LABOR_COSTS,
  VALIDATION_RULES,
  DEFAULT_RECIPE
} from './constants'

// Types - export interfaces from utils for now
export type { Recipe, RecipeIngredient } from './utils'
