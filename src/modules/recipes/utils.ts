import { formatCurrency } from '@/shared'
import type { RecipesTable, RecipeIngredientsTable, IngredientsTable } from '@/types/database'

// Use generated types from Supabase
export type Recipe = RecipesTable
export type RecipeIngredient = RecipeIngredientsTable
export type Ingredient = IngredientsTable

// Extended type for recipe with ingredient details
export interface RecipeIngredientWithDetails extends RecipeIngredient {
  ingredient?: {
    id: string
    name: string
    price_per_unit: number
    unit: string
  }
}

/**
 * Calculate recipe HPP (Harga Pokok Produksi)
 */
export function calculateRecipeHPP(
  ingredients: RecipeIngredientWithDetails[],
  overheadRate = 0.15,
  laborCost = 0,
  packagingCost = 0
) {
  const ingredientCost = ingredients.reduce((total, recipeIngredient) => {
    if (!recipeIngredient.ingredient) {return total}
    
    const cost = calculateIngredientCost(
      recipeIngredient.quantity,
      recipeIngredient.unit,
      recipeIngredient.ingredient.price_per_unit,
      recipeIngredient.ingredient.unit
    )
    return total + cost
  }, 0)

  const overhead = ingredientCost * overheadRate
  const totalCost = ingredientCost + laborCost + overhead + packagingCost

  return {
    ingredientCost,
    laborCost,
    overheadCost: overhead,
    packagingCost,
    totalCost
  }
}

/**
 * Calculate cost for a specific ingredient
 */
export function calculateIngredientCost(
  quantity: number,
  unit: string,
  unitCost: number,
  ingredientUnitType: string
): number {
  const conversionFactor = getUnitConversionFactor(unit, ingredientUnitType)
  return quantity * conversionFactor * unitCost
}

/**
 * Calculate profit margin
 */
export function calculateProfitMargin(sellingPrice: number, totalCost: number): number {
  if (sellingPrice <= 0) {return 0}
  return ((sellingPrice - totalCost) / sellingPrice) * 100
}

/**
 * Format recipe servings with proper pluralization
 */
export function formatRecipeServings(servings: number): string {
  if (servings === 1) {return '1 porsi'}
  return `${servings} porsi`
}

/**
 * Scale recipe quantities up or down
 */
export function scaleRecipe(
  ingredients: RecipeIngredientWithDetails[],
  currentServings: number,
  targetServings: number
): RecipeIngredientWithDetails[] {
  const scaleFactor = targetServings / currentServings
  
  return ingredients.map(ingredient => ({
    ...ingredient,
    quantity: ingredient.quantity * scaleFactor
  }))
}

/**
 * Validate recipe data
 */
export function validateRecipe(recipe: Partial<Recipe>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!recipe.name || recipe.name.trim().length === 0) {
    errors.push('Nama resep harus diisi')
  }

  if (recipe.servings !== undefined && recipe.servings !== null && recipe.servings <= 0) {
    errors.push('Jumlah porsi harus lebih dari 0')
  }

  if (recipe.prep_time !== undefined && recipe.prep_time !== null && recipe.prep_time < 0) {
    errors.push('Waktu persiapan tidak boleh negatif')
  }

  if (recipe.cook_time !== undefined && recipe.cook_time !== null && recipe.cook_time < 0) {
    errors.push('Waktu memasak tidak boleh negatif')
  }

  if (recipe.category?.trim().length === 0) {
    errors.push('Kategori harus dipilih')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get unit conversion factor between different measurement units
 */
function getUnitConversionFactor(fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) {return 1}
  
  // Common Indonesian F&B unit conversions
  const conversions: Record<string, Record<string, number>> = {
    // Weight conversions
    'g': { 'kg': 0.001, 'gram': 1, 'ons': 0.1 },
    'kg': { 'g': 1000, 'gram': 1000, 'ons': 10 },
    'ons': { 'g': 100, 'gram': 100, 'kg': 0.1 },
    
    // Volume conversions
    'ml': { 'l': 0.001, 'liter': 0.001, 'cc': 1 },
    'l': { 'ml': 1000, 'liter': 1, 'cc': 1000 },
    'liter': { 'ml': 1000, 'l': 1, 'cc': 1000 },
    'cc': { 'ml': 1, 'l': 0.001, 'liter': 0.001 },
    
    // Count conversions
    'pcs': { 'pieces': 1, 'buah': 1, 'biji': 1 },
    'buah': { 'pcs': 1, 'pieces': 1, 'biji': 1 },
    'biji': { 'pcs': 1, 'pieces': 1, 'buah': 1 },
    
    // Cooking measurement conversions
    'tbsp': { 'ml': 15, 'tsp': 3, 'sendok makan': 1 },
    'tsp': { 'ml': 5, 'tbsp': 0.33, 'sendok teh': 1 },
    'sendok makan': { 'tbsp': 1, 'ml': 15, 'tsp': 3 },
    'sendok teh': { 'tsp': 1, 'ml': 5, 'tbsp': 0.33 },
    'cup': { 'ml': 240, 'l': 0.24, 'gelas': 1 },
    'gelas': { 'cup': 1, 'ml': 240, 'l': 0.24 }
  }

  return conversions[fromUnit]?.[toUnit] || 1
}

/**
 * Get difficulty level display info
 */
export function getDifficultyInfo(difficulty: string | null) {
  if (!difficulty) {
    return {
      label: 'Unknown',
      color: 'bg-gray-100 text-gray-800',
      icon: '⚫',
      description: 'Tingkat kesulitan tidak diketahui'
    }
  }
  
  switch (difficulty) {
    case 'easy':
      return {
        label: 'Mudah',
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        icon: '🟢',
        description: 'Cocok untuk pemula'
      }
    case 'medium':
      return {
        label: 'Sedang',
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        icon: '🟡',
        description: 'Memerlukan sedikit pengalaman'
      }
    case 'hard':
      return {
        label: 'Sulit',
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        icon: '🔴',
        description: 'Untuk baker berpengalaman'
      }
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-800',
        icon: '⚫',
        description: 'Tingkat kesulitan tidak diketahui'
      }
  }
}

/**
 * Get category display info with Indonesian localization
 */
export function getCategoryInfo(category: string) {
  const categories: Record<string, { label: string; icon: string; description: string }> = {
    bread: {
      label: 'Roti',
      icon: '🍞',
      description: 'Roti tawar, roti manis, dan variasi roti'
    },
    pastry: {
      label: 'Pastry',
      icon: '🥐',
      description: 'Croissant, puff pastry, danish'
    },
    cake: {
      label: 'Kue',
      icon: '🍰',
      description: 'Layer cake, cupcake, cheesecake'
    },
    cookie: {
      label: 'Cookie',
      icon: '🍪',
      description: 'Biskuit, cookies, dan kue kering'
    },
    donut: {
      label: 'Donat',
      icon: '🍩',
      description: 'Donat goreng dan donat panggang'
    },
    traditional: {
      label: 'Tradisional',
      icon: '🥮',
      description: 'Kue tradisional Indonesia'
    }
  }

  return categories[category] || {
    label: category.charAt(0).toUpperCase() + category.slice(1),
    icon: '👩‍🍳',
    description: 'Kategori lainnya'
  }
}

/**
 * Format recipe time display
 */
export function formatRecipeTime(prepTime: number, cookTime: number): string {
  const total = prepTime + cookTime
  const hours = Math.floor(total / 60)
  const minutes = total % 60

  if (hours > 0) {
    return minutes > 0 ? `${hours}j ${minutes}m` : `${hours}j`
  }
  return `${minutes}m`
}

/**
 * Calculate recipe complexity score
 */
export function calculateComplexityScore(
  ingredientCount: number,
  totalTime: number,
  difficulty: string
): number {
  let score = 0
  
  // Ingredient complexity (0-30 points)
  score += Math.min(ingredientCount * 2, 30)
  
  // Time complexity (0-40 points)  
  score += Math.min(totalTime / 5, 40)
  
  // Difficulty multiplier (0-30 points)
  const difficultyMultiplier = {
    easy: 10,
    medium: 20,
    hard: 30
  }
  score += difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] || 15

  return Math.min(Math.round(score), 100)
}

/**
 * Generate recipe summary statistics
 */
export function generateRecipeSummary(recipe: Recipe, ingredients: RecipeIngredientWithDetails[]) {
  const prepTime = recipe.prep_time ?? 0
  const cookTime = recipe.cook_time ?? 0
  const totalTime = prepTime + cookTime
  const servings = recipe.servings ?? 1
  const difficulty = recipe.difficulty ?? 'medium'
  const category = recipe.category ?? 'other'
  
  const complexityScore = calculateComplexityScore(
    ingredients.length,
    totalTime,
    difficulty
  )
  const difficultyInfo = getDifficultyInfo(difficulty)
  const categoryInfo = getCategoryInfo(category)

  return {
    timeFormatted: formatRecipeTime(prepTime, cookTime),
    servingsFormatted: formatRecipeServings(servings),
    complexityScore,
    difficulty: difficultyInfo,
    category: categoryInfo,
    ingredientCount: ingredients.length,
    totalTime
  }
}
