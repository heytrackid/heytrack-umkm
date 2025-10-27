/**
 * Ingredient Validation Helpers
 * Domain-specific validation helpers for ingredient-related business rules
 */

import { z } from 'zod'
import { IngredientInsertSchema, IngredientUpdateSchema, type IngredientInsert, type IngredientUpdate } from './ingredient'

// Enhanced ingredient validation with business rules
export const EnhancedIngredientInsertSchema = IngredientInsertSchema
  .extend({
    // Enhanced price validation
    price_per_unit: z.number().positive('Price must be positive').max(10000000, 'Price too high'),

    // Stock validation with business rules
    current_stock: z.number().min(0).max(100000, 'Stock quantity too high'),
    min_stock: z.number().min(0).max(50000, 'Minimum stock too high'),
    max_stock: z.number().min(0).max(100000, 'Maximum stock too high').optional(),

    // Unit validation - only allow valid measurement units
    unit: z.enum(['kg', 'gram', 'liter', 'ml', 'pcs', 'pack', 'box', 'bottle', 'can', 'sachet'],
      { message: 'Invalid unit. Use: kg, gram, liter, ml, pcs, pack, box, bottle, can, sachet' }),

    // Category validation
    category: z.string().max(100).optional().refine((category) => {
      if (!category) {return true}
      const validCategories = ['dairy', 'meat', 'vegetables', 'fruits', 'grains', 'spices', 'oils', 'beverages', 'bakery', 'other']
      return validCategories.includes(category.toLowerCase())
    }, {
      message: 'Invalid category. Use: dairy, meat, vegetables, fruits, grains, spices, oils, beverages, bakery, other'
    }),

    // Lead time validation
    reorder_lead_time: z.number().int().min(1).max(365).optional(), // Max 1 year

    // Usage rate validation
    usage_rate_daily: z.number().min(0).max(10000).optional(), // Reasonable daily usage limit
  })
  .refine((data) => {
    // Business rule: min_stock should be less than max_stock
    if (data.max_stock && data.min_stock >= data.max_stock) {
      return false
    }
    return true
  }, {
    message: 'Minimum stock must be less than maximum stock',
    path: ['min_stock']
  })
  .refine((data) => {
    // Business rule: current_stock should not exceed max_stock significantly
    if (data.max_stock && data.current_stock > data.max_stock * 2) {
      return false
    }
    return true
  }, {
    message: 'Current stock should not exceed 2x maximum stock',
    path: ['current_stock']
  })

export const EnhancedIngredientUpdateSchema = EnhancedIngredientInsertSchema.partial()

// Validation helpers
export class IngredientValidationHelpers {
  /**
   * Validate ingredient data with enhanced business rules
   */
  static validateInsert(data: unknown): { success: boolean; data?: IngredientInsert; errors?: string[] } {
    try {
      const validatedData = EnhancedIngredientInsertSchema.parse(data)
      return { success: true, data: validatedData }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Validate ingredient update data
   */
  static validateUpdate(data: unknown): { success: boolean; data?: IngredientUpdate; errors?: string[] } {
    try {
      const validatedData = EnhancedIngredientUpdateSchema.parse(data)
      return { success: true, data: validatedData }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Calculate reorder recommendation
   */
  static calculateReorderRecommendation(ingredient: {
    current_stock: number
    min_stock: number
    max_stock?: number
    usage_rate_daily?: number
    reorder_lead_time?: number
  }): {
    shouldReorder: boolean
    recommendedQuantity: number
    priority: 'low' | 'medium' | 'high' | 'critical'
    reason: string
  } {
    const { current_stock, min_stock, max_stock, usage_rate_daily, reorder_lead_time = 7 } = ingredient

    // Calculate days until stock runs out
    const daysUntilEmpty = usage_rate_daily && usage_rate_daily > 0
      ? Math.floor(current_stock / usage_rate_daily)
      : 30 // Default assumption

    // Calculate reorder point considering lead time
    const effectiveReorderPoint = min_stock + (usage_rate_daily || 0) * reorder_lead_time

    const shouldReorder = current_stock <= effectiveReorderPoint
    let recommendedQuantity = (max_stock || min_stock * 2) - current_stock
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let reason = 'Stock at reorder level'

    if (current_stock <= min_stock) {
      priority = 'high'
      reason = 'Stock below minimum level'
    }

    if (daysUntilEmpty <= reorder_lead_time) {
      priority = 'critical'
      reason = `Stock will run out in ${daysUntilEmpty} days (lead time: ${reorder_lead_time} days)`
      recommendedQuantity = Math.max(recommendedQuantity, (usage_rate_daily || 1) * reorder_lead_time * 2)
    }

    if (current_stock <= 0) {
      priority = 'critical'
      reason = 'Out of stock'
      recommendedQuantity = Math.max(min_stock * 2, (usage_rate_daily || 1) * reorder_lead_time * 3)
    }

    return {
      shouldReorder,
      recommendedQuantity: Math.max(0, Math.round(recommendedQuantity)),
      priority,
      reason
    }
  }

  /**
   * Validate bulk ingredient import
   */
  static validateBulkImport(ingredients: unknown[]): {
    valid: any[]
    invalid: Array<{ index: number; data: any; errors: string[] }>
  } {
    const valid: any[] = []
    const invalid: Array<{ index: number; data: any; errors: string[] }> = []

    ingredients.forEach((ingredient, index) => {
      const result = this.validateInsert(ingredient)
      if (result.success) {
        valid.push(result.data)
      } else {
        invalid.push({
          index,
          data: ingredient,
          errors: result.errors || []
        })
      }
    })

    return { valid, invalid }
  }

  /**
   * Check for duplicate ingredients by name
   */
  static findDuplicates(ingredients: Array<{ name: string; unit: string }>): Array<{
    name: string
    unit: string
    indices: number[]
  }> {
    const duplicates: Record<string, number[]> = {}

    ingredients.forEach((ingredient, index) => {
      const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`
      if (!duplicates[key]) {
        duplicates[key] = []
      }
      duplicates[key].push(index)
    })

    return Object.entries(duplicates)
      .filter(([_, indices]) => indices.length > 1)
      .map(([key, indices]) => {
        const [name, unit] = key.split('-')
        return { name, unit, indices }
      })
  }
}

// Type exports
export type EnhancedIngredientInsert = z.infer<typeof EnhancedIngredientInsertSchema>
export type EnhancedIngredientUpdate = z.infer<typeof EnhancedIngredientUpdateSchema>
