/**
 * Type Guards Usage Examples
 * 
 * This file demonstrates how to use the type guards and validation functions
 * from guards.ts in real-world scenarios.
 */

import type { Recipe, Ingredient, OrderItem } from './index'
import {
  isRecipe,
  isIngredient,
  isOrderItem,
  isRecipeWithIngredients,
  validateRecipe,
  validateIngredient,
  validateOrderItem,
  assertRecipe,
  assertIngredient,
  isUUID,
  isPositiveNumber,
  isNonNegativeNumber
} from './guards'

/**
 * Example 1: Using type guards in conditional logic
 */
export function processRecipeData(data: unknown): Recipe | null {
  if (isRecipe(data)) {
    // TypeScript now knows data is Recipe
    return data
  }
  return null
}

/**
 * Example 2: Using validation functions for detailed error reporting
 */
export function validateRecipeInput(data: unknown): { success: boolean; recipe?: Recipe; errors?: string[] } {
  const validation = validateRecipe(data)
  
  if (validation.valid && isRecipe(data)) {
    return { success: true, recipe: data }
  }
  
  return { success: false, errors: validation.errors }
}

/**
 * Example 3: Using type assertions for guaranteed type safety
 */
export function processGuaranteedRecipe(data: unknown): Recipe {
  // This will throw if data is not a valid Recipe
  assertRecipe(data)
  
  // TypeScript knows data is Recipe after assertion
  return data
}

/**
 * Example 4: Using complex type guards for nested structures
 */
export function calculateRecipeCost(data: unknown): number {
  if (!isRecipeWithIngredients(data)) {
    throw new Error('Invalid recipe with ingredients data')
  }
  
  // TypeScript knows data has recipe_ingredients array
  const ingredients = data.recipe_ingredients || []
  
  return ingredients.reduce((total, ri) => {
    const {ingredient} = ri
    if (ingredient && isIngredient(ingredient)) {
      return total + (ri.quantity * ingredient.price_per_unit)
    }
    return total
  }, 0)
}

/**
 * Example 5: Using utility type guards for input validation
 */
export function validateOrderItemInput(input: {
  id?: string
  quantity?: unknown
  unit_price?: unknown
}): string[] {
  const errors: string[] = []
  
  if (input.id && !isUUID(input.id)) {
    errors.push('Invalid UUID format for id')
  }
  
  if (input.quantity !== undefined && !isPositiveNumber(input.quantity)) {
    errors.push('Quantity must be a positive number')
  }
  
  if (input.unit_price !== undefined && !isNonNegativeNumber(input.unit_price)) {
    errors.push('Unit price must be a non-negative number')
  }
  
  return errors
}

/**
 * Example 6: Using type guards with array operations
 */
export function filterValidIngredients(items: unknown[]): Ingredient[] {
  return items.filter(isIngredient)
}

/**
 * Example 7: Using validation in API handlers
 */
export async function handleCreateOrderItem(requestData: unknown): Promise<{ success: boolean; data?: OrderItem; errors?: string[] }> {
  // Validate the input
  const validation = validateOrderItem(requestData)
  
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    }
  }
  
  // Type guard ensures type safety
  if (!isOrderItem(requestData)) {
    return {
      success: false,
      errors: ['Invalid order item structure']
    }
  }
  
  // Now we can safely use requestData as OrderItem
  // ... save to database ...
  
  return {
    success: true,
    data: requestData
  }
}

/**
 * Example 8: Using type guards in error handling
 */
export function safeProcessRecipe(data: unknown): Recipe {
  try {
    assertRecipe(data)
    return data
  } catch (err) {
    // Provide detailed validation errors
    const validation = validateRecipe(data)
    throw new Error(`Recipe validation failed: ${validation.errors.join(', ')}`)
  }
}
