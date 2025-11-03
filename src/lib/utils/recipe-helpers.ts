import { uiLogger } from '@/lib/logger'


/**
 * Recipe Helper Utilities
 * Smart suggestions and calculations for recipe generation
 */


export interface IngredientSuggestion {
  name: string
  typical_quantity: number
  unit: string
  priority: 'essential' | 'recommended' | 'optional'
}

/**
 * Get smart ingredient suggestions based on product type and category
 */
export const getSmartIngredientSuggestions = (
  productType: string,
  _category?: string
): IngredientSuggestion[] => {
  const suggestions: Record<string, IngredientSuggestion[]> = {
    // Bakery
    cake: [
      { name: 'tepung terigu', typical_quantity: 250, unit: 'g', priority: 'essential' },
      { name: 'telur', typical_quantity: 3, unit: 'butir', priority: 'essential' },
      { name: 'gula', typical_quantity: 200, unit: 'g', priority: 'essential' },
      { name: 'mentega', typical_quantity: 150, unit: 'g', priority: 'essential' },
      { name: 'baking powder', typical_quantity: 10, unit: 'g', priority: 'essential' },
      { name: 'susu', typical_quantity: 100, unit: 'ml', priority: 'recommended' },
      { name: 'vanilla', typical_quantity: 5, unit: 'ml', priority: 'optional' }
    ],
    cookies: [
      { name: 'tepung terigu', typical_quantity: 300, unit: 'g', priority: 'essential' },
      { name: 'mentega', typical_quantity: 200, unit: 'g', priority: 'essential' },
      { name: 'gula', typical_quantity: 150, unit: 'g', priority: 'essential' },
      { name: 'telur', typical_quantity: 1, unit: 'butir', priority: 'essential' },
      { name: 'vanilla', typical_quantity: 5, unit: 'ml', priority: 'recommended' }
    ],
    bread: [
      { name: 'tepung terigu', typical_quantity: 500, unit: 'g', priority: 'essential' },
      { name: 'ragi', typical_quantity: 10, unit: 'g', priority: 'essential' },
      { name: 'gula', typical_quantity: 50, unit: 'g', priority: 'essential' },
      { name: 'garam', typical_quantity: 10, unit: 'g', priority: 'essential' },
      { name: 'mentega', typical_quantity: 50, unit: 'g', priority: 'essential' },
      { name: 'susu', typical_quantity: 250, unit: 'ml', priority: 'recommended' }
    ],
    pastry: [
      { name: 'tepung terigu', typical_quantity: 300, unit: 'g', priority: 'essential' },
      { name: 'mentega', typical_quantity: 200, unit: 'g', priority: 'essential' },
      { name: 'telur', typical_quantity: 2, unit: 'butir', priority: 'essential' },
      { name: 'gula', typical_quantity: 100, unit: 'g', priority: 'essential' }
    ],

    // Snacks & Fried
    fried: [
      { name: 'tepung terigu', typical_quantity: 200, unit: 'g', priority: 'essential' },
      { name: 'telur', typical_quantity: 2, unit: 'butir', priority: 'essential' },
      { name: 'bawang putih', typical_quantity: 3, unit: 'siung', priority: 'recommended' },
      { name: 'garam', typical_quantity: 5, unit: 'g', priority: 'essential' },
      { name: 'tepung panir', typical_quantity: 100, unit: 'g', priority: 'optional' }
    ],

    // Beverages
    drink: [
      { name: 'gula', typical_quantity: 100, unit: 'g', priority: 'essential' },
      { name: 'es batu', typical_quantity: 200, unit: 'g', priority: 'essential' },
      { name: 'susu', typical_quantity: 100, unit: 'ml', priority: 'recommended' }
    ],

    // Main Dishes
    rice: [
      { name: 'nasi', typical_quantity: 500, unit: 'g', priority: 'essential' },
      { name: 'telur', typical_quantity: 2, unit: 'butir', priority: 'essential' },
      { name: 'bawang merah', typical_quantity: 5, unit: 'siung', priority: 'essential' },
      { name: 'bawang putih', typical_quantity: 3, unit: 'siung', priority: 'essential' },
      { name: 'kecap manis', typical_quantity: 30, unit: 'ml', priority: 'essential' }
    ],
    noodles: [
      { name: 'mie', typical_quantity: 500, unit: 'g', priority: 'essential' },
      { name: 'ayam', typical_quantity: 200, unit: 'g', priority: 'essential' },
      { name: 'bawang putih', typical_quantity: 3, unit: 'siung', priority: 'essential' },
      { name: 'kecap', typical_quantity: 30, unit: 'ml', priority: 'essential' },
      { name: 'sawi', typical_quantity: 100, unit: 'g', priority: 'recommended' }
    ]
  }

  return suggestions[productType] || []
}

/**
 * Calculate estimated HPP based on selected ingredients
 */
export const calculateEstimatedHPP = (
  selectedIngredients: Array<{
    id: string
    name: string
    price_per_unit: number
    unit: string
  }>,
  servings = 1
): number => {
  if (selectedIngredients.length === 0) {return 0}

  // Get typical quantities for calculation
  const totalMaterialCost = selectedIngredients.reduce((sum, ingredient) => {
    // Estimate typical usage (this is rough, AI will refine)
    const typicalQuantity = 100 // grams or ml
    const cost = ingredient.price_per_unit * (typicalQuantity / 1000) // Convert to kg
    return sum + cost
  }, 0)

  // Add operational costs (30% of material cost)
  const operationalCost = totalMaterialCost * 0.3

  // Total HPP
  const totalHPP = totalMaterialCost + operationalCost

  // Per serving
  return Math.round(totalHPP / servings)
}

/**
 * Match user's ingredients with template suggestions
 */
export const matchIngredientsWithTemplate = (
  availableIngredients: Array<{ id: string; name: string }>,
  templateIngredients: string[]
): string[] => {
  const matched: string[] = []

  templateIngredients.forEach(templateIng => {
    const found = availableIngredients.find(ing =>
      ing.name.toLowerCase().includes(templateIng.toLowerCase()) ||
      templateIng.toLowerCase().includes(ing.name.toLowerCase())
    )

    if (found) {
      matched.push(found.id)
    }
  })

  return matched
}

/**
 * Get recipe difficulty color
 */
export const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  const colors = {
    easy: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    hard: 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }
  return colors[difficulty]
}

/**
 * Format time display
 */
export const formatTime = (minutes: number): string => {
  if (minutes < 60) {return `${minutes} menit`}
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`
}

/**
 * Get category icon
 */
export const getCategoryIcon = (_category: string): string => {
  const icons: Record<string, string> = {
    'Bakery': '🥐',
    'Snacks': '🍿',
    'Beverages': '🥤',
    'Main Dish': '🍽️',
    'Traditional': '🏮',
    'Frozen': '🧊'
  }
  return icons[_category] || '🍴'
}

/**
 * Save draft to localStorage
 */
export const saveDraft = (draft: {
  productName: string
  productType: string
  servings: number
  selectedIngredients: string[]
  targetPrice?: string
}) => {
  try {
    const draftData = {
      ...draft,
      timestamp: Date.now()
    }
    localStorage.setItem('recipe-generator-draft', JSON.stringify(draftData))
  } catch (error: unknown) {
    // Silent fail - draft saving is non-critical
    if (process.env.NODE_ENV === 'development') {
      uiLogger.error({ error }, 'Failed to save draft')
    }
  }
}

/**
 * Load draft from localStorage
 */
export const loadDraft = (): {
  productName: string
  productType: string
  servings: number
  selectedIngredients: string[]
  targetPrice?: string
  timestamp: number
} | null => {
  try {
    const saved = localStorage.getItem('recipe-generator-draft')
    if (!saved) {return null}

    const draft = JSON.parse(saved)

    // Check if draft is recent (< 24 hours)
    const isRecent = Date.now() - draft.timestamp < 24 * 60 * 60 * 1000

    return isRecent ? draft : null
  } catch (error: unknown) {
    // Silent fail - draft loading is non-critical
    if (process.env.NODE_ENV === 'development') {
      uiLogger.error({ error }, 'Failed to load draft')
    }
    return null
  }
}

/**
 * Clear draft from localStorage
 */
export const clearDraft = () => {
  try {
    localStorage.removeItem('recipe-generator-draft')
  } catch (error: unknown) {
    // Silent fail - draft clearing is non-critical
    if (process.env.NODE_ENV === 'development') {
      uiLogger.error({ error }, 'Failed to clear draft')
    }
  }
}
