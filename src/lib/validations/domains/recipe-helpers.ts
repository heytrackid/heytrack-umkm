import { z } from 'zod'

import { RecipeInsertSchema, type RecipeInsert, type RecipeUpdate } from './recipe'


/**
 * Recipe Validation Helpers
 * Domain-specific validation helpers for recipe-related business rules
 */


// Re-export for convenience
export { RecipeUpdateSchema } from './recipe'

// Enhanced recipe validation with business rules
export const EnhancedRecipeInsertSchema = RecipeInsertSchema
  .extend({
    // Enhanced validation for recipe components
    servings: z.number().positive().max(1000), // Max 1000 servings
    preparation_time: z.number().min(0).max(1440).optional(), // Max 24 hours in minutes
    cooking_time: z.number().min(0).max(1440).optional(), // Max 24 hours in minutes

    // Cost validation
    cost_per_serving: z.number().min(0).max(10000000).optional(), // Max 10M per serving
    selling_price: z.number().min(0).max(10000000).optional(), // Max 10M selling price
    profit_margin: z.number().min(-100).max(1000).optional(), // Allow negative margins but cap high margins

    // Ingredient validation with enhanced rules
    ingredients: z.array(z.object({
      ingredient_id: z.string().uuid(),
      quantity: z.number().positive().max(100000), // Max 100k units
      unit: z.string().min(1).max(50),
      notes: z.string().max(500).optional(),
    })).min(1, 'Recipe must have at least one ingredient').max(50, 'Recipe cannot have more than 50 ingredients'),

    // Instructions validation
    instructions: z.array(z.object({
      step_number: z.number().positive().max(100), // Max 100 steps
      instruction: z.string().min(1, 'Instruction cannot be empty').max(2000),
      duration: z.number().min(0).max(1440).optional(), // Max 24 hours
      notes: z.string().max(500).optional(),
    })).max(50, 'Recipe cannot have more than 50 instruction steps').optional()
  })
  .refine((data) => {
    // Business rule: Selling price should be higher than cost
    if (data.selling_price && data.cost_per_serving) {
      const minProfitMargin = data.cost_per_serving * 1.1 // At least 10% markup
      if (data.selling_price < minProfitMargin) {
        return false
      }
    }
    return true
  }, {
    message: 'Selling price should be at least 10% higher than cost per serving',
    path: ['selling_price']
  })
  .refine((data) => {
    // Business rule: Instructions should be numbered sequentially
    if (data.instructions && data.instructions.length > 1) {
      const stepNumbers = data.instructions.map(i => i.step_number).sort((a, b) => a - b)
      for (let i = 0; i < stepNumbers.length; i++) {
        if (stepNumbers[i] !== i + 1) {
          return false
        }
      }
    }
    return true
  }, {
    message: 'Instruction steps must be numbered sequentially starting from 1',
    path: ['instructions']
  })

export const EnhancedRecipeUpdateSchema = EnhancedRecipeInsertSchema.partial()

// Validation helpers
export class RecipeValidationHelpers {
  /**
   * Validate recipe data with enhanced business rules
   */
  static validateInsert(data: unknown): { success: boolean; data?: RecipeInsert; errors?: string[] } {
    try {
      const validatedData = EnhancedRecipeInsertSchema.parse(data)
      return { success: true, data: validatedData as RecipeInsert }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(error => `${error.path.join('.')}: ${error.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Validate recipe update data
   */
  static validateUpdate(data: unknown): { success: boolean; data?: RecipeUpdate; errors?: string[] } {
    try {
      const validatedData = EnhancedRecipeUpdateSchema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(error => `${error.path.join('.')}: ${error.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Calculate recipe nutrition and cost analysis
   */
  static calculateRecipeAnalysis(recipe: {
    ingredients: Array<{ quantity: number; unit: string }>
    servings: number
    cost_per_serving?: number
    selling_price?: number
  }): {
    total_ingredients: number
    cost_per_serving: number
    estimated_profit: number
    profit_margin: number
  } {
    const total_ingredients = recipe.ingredients.length
    const cost_per_serving = recipe.cost_per_serving ?? 0
    const selling_price = recipe.selling_price ?? 0

    const estimated_profit = selling_price - cost_per_serving
    const profit_margin = cost_per_serving > 0 ? (estimated_profit / cost_per_serving) * 100 : 0

    return {
      total_ingredients,
      cost_per_serving,
      estimated_profit,
      profit_margin
    }
  }

  /**
   * Check recipe complexity
   */
  static getRecipeComplexity(recipe: {
    ingredients: Array<Record<string, unknown>>
    instructions?: Array<Record<string, unknown>>
    preparation_time?: number
    cooking_time?: number
  }): 'complex' | 'moderate' | 'simple' {
    const ingredientCount = recipe.ingredients.length
    const instructionCount = recipe.instructions?.length ?? 0
    const totalTime = (recipe.preparation_time ?? 0) + (recipe.cooking_time ?? 0)

    if (ingredientCount <= 5 && instructionCount <= 5 && totalTime <= 30) {
      return 'simple'
    }

    if (ingredientCount <= 10 && instructionCount <= 10 && totalTime <= 60) {
      return 'moderate'
    }

    return 'complex'
  }

  /**
   * Validate ingredient compatibility
   */
  static validateIngredientCompatibility(ingredients: Array<{
    ingredient_id: string
    quantity: number
    unit: string
  }>): {
    compatible: boolean
    warnings: string[]
  } {
    const warnings: string[] = []

    // Check for common incompatible ingredient combinations
    const ingredientIds = ingredients.map(i => i.ingredient_id)

    // This would contain business rules for ingredient compatibility
    // For now, just check for duplicate ingredients
    const duplicates = ingredientIds.filter((id, index) => ingredientIds.indexOf(id) !== index)
    if (duplicates.length > 0) {
      warnings.push(`Duplicate ingredients found: ${duplicates.join(', ')}`)
    }

    // Check for excessive quantities
    ingredients.forEach((ingredient, index) => {
      if (ingredient.quantity > 10000) { // Arbitrary high threshold
        warnings.push(`Ingredient ${index + 1} has unusually high quantity: ${ingredient.quantity}`)
      }
    })

    return {
      compatible: warnings.length === 0,
      warnings
    }
  }

  /**
   * Validate bulk recipe import
   */
  static validateBulkImport(recipes: unknown[]): {
    valid: Array<Record<string, unknown>>
    invalid: Array<{ index: number; data: unknown; errors: string[] }>
  } {
    const valid: Array<Record<string, unknown>> = []
    const invalid: Array<{ index: number; data: unknown; errors: string[] }> = []

    recipes.forEach((recipe, index) => {
      const result = this.validateInsert(recipe)
      if (result.success && result['data']) {
        valid.push(result['data'] as Record<string, unknown>)
      } else {
        invalid.push({
          index,
          data: recipe,
          errors: result.errors ?? []
        })
      }
    })

    return { valid, invalid }
  }
}

// Type exports
export type EnhancedRecipeInsert = z.infer<typeof EnhancedRecipeInsertSchema>
export type EnhancedRecipeUpdate = z.infer<typeof EnhancedRecipeUpdateSchema>
