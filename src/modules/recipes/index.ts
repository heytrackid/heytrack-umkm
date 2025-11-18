

/**
 * Recipes Domain Module
 * Centralized exports untuk semua functionality terkait recipe management
 */

// Core recipe components
export { SmartPricingAssistant } from './components/SmartPricingAssistant'

// Extracted HPP calculator components
export { EducationalFooter } from './components/EducationalFooter'
export { MainResultsCard } from './components/MainResultsCard'
export { MethodComparisonCard } from './components/MethodComparisonCard'
export { RecommendationsCard } from './components/RecommendationsCard'
export { SettingsPanel } from './components/SettingsPanel'
export { UMKMTooltip } from './components/UMKMTooltip'

// Lazy loaded recipe components
export {
    LazySmartPricingAssistant,
    preloadRecipeComponents
} from './components/LazyComponents'

// Hooks
export { useRecipesData } from './hooks/useRecipesData'

// Utils
export {
    calculateComplexityScore, calculateIngredientCost,
    calculateProfitMargin,
    formatRecipeServings, formatRecipeTime, generateRecipeSummary, getCategoryInfo, getDifficultyInfo, scaleRecipe,
    validateRecipe
} from './utils'

// Constants
export {
    DEFAULT_RECIPE, DIFFICULTY_LEVELS, LABOR_COSTS, MARGIN_PRESETS, MEASUREMENT_UNITS, OVERHEAD_RATES, RECIPE_CATEGORIES, VALIDATION_RULES
} from './constants'

// Types - export all types from utils
export type {
    CategoryInfo,
    DifficultyInfo,
    HppCalculationResult,
    RecipeIngredientWithDetails,
    RecipeSummary,
    ValidationResult
} from './utils'

