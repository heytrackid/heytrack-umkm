

/**
 * Recipe Templates for Various FnB Categories
 * Comprehensive templates for Indonesian UMKM culinary businesses
 */

export interface RecipeTemplate {
  id: string
  name: string
  category: string
  type: string
  servings: number
  ingredients: string[]
  icon: string
  description: string
  estimatedHPP: number // Rough estimate in IDR
  difficulty: 'easy' | 'medium' | 'hard'
  prepTime: number // minutes
  cookTime: number // minutes
}

export const RECIPE_TEMPLATES: RecipeTemplate[] = []

// Group templates by category
export const TEMPLATES_BY_CATEGORY = RECIPE_TEMPLATES.reduce((acc, template) => {
  if (!acc[template.category]) {
    acc[template.category] = []
  }
  acc[template.category].push(template)
  return acc
}, {} as Record<string, RecipeTemplate[]>)

// Get template by ID
export const getTemplateById = (id: string): RecipeTemplate | undefined => RECIPE_TEMPLATES.find(t => t.id === id)

// Get templates by category
export const getTemplatesByCategory = (category: string): RecipeTemplate[] => TEMPLATES_BY_CATEGORY[category] || []

// Get all categories
export const RECIPE_CATEGORIES = Object.keys(TEMPLATES_BY_CATEGORY)
