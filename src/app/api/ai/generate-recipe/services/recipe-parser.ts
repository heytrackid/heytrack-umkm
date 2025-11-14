import { apiLogger } from '@/lib/logger'
import type { GeneratedRecipe, IngredientSubset, RawRecipeResponse, RecipeIngredient, RecipeInstruction } from '../types'

export function parseRecipeResponse(response: string): GeneratedRecipe {
  try {
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '')
    }

    const rawRecipe = JSON.parse(cleanResponse) as RawRecipeResponse

    if (!rawRecipe.name || typeof rawRecipe.name !== 'string' || !rawRecipe.name.trim()) {
      throw new Error('Invalid recipe structure: missing or invalid name')
    }
    if (!rawRecipe.ingredients || !Array.isArray(rawRecipe.ingredients) || rawRecipe.ingredients.length === 0) {
      throw new Error('Recipe must have at least one ingredient')
    }
    if (!rawRecipe.instructions || !Array.isArray(rawRecipe.instructions) || rawRecipe.instructions.length === 0) {
      throw new Error('Recipe must have instructions')
    }

    rawRecipe.ingredients.forEach((ing: unknown, index: number) => {
      if (!ing || typeof ing !== 'object') {
        throw new Error(`Invalid ingredient at index ${index}: must be an object`)
      }
      const ingredient = ing as Record<string, unknown>
      if (!ingredient['name'] || typeof ingredient['name'] !== 'string' || !(ingredient['name'] as string).trim()) {
        throw new Error(`Invalid ingredient at index ${index}: missing or invalid name`)
      }
      if (typeof ingredient['quantity'] !== 'number' || ingredient['quantity'] <= 0) {
        throw new Error(`Invalid ingredient quantity at index ${index}`)
      }
      if (!ingredient['unit'] || typeof ingredient['unit'] !== 'string' || !(ingredient['unit'] as string).trim()) {
        throw new Error(`Invalid ingredient unit at index ${index}`)
      }
    })

    const instructions: RecipeInstruction[] = rawRecipe.instructions.map((instruction: unknown, index: number) => {
      if (typeof instruction === 'string') {
        return {
          step: index + 1,
          title: `Langkah ${index + 1}`,
          description: instruction.trim(),
        }
      } else if (typeof instruction === 'object' && instruction !== null) {
        const instObj = instruction as Record<string, unknown>
        if (!instObj['description'] || typeof instObj['description'] !== 'string' || !(instObj['description'] as string).trim()) {
          throw new Error(`Invalid instruction object at index ${index}: missing or invalid description`)
        }
        return {
          step: typeof instObj['step'] === 'number' ? instObj['step'] as number : index + 1,
          title: typeof instObj['title'] === 'string' ? instObj['title'] as string : `Langkah ${index + 1}`,
          description: instObj['description'] as string,
          duration_minutes: typeof instObj['duration_minutes'] === 'number' ? instObj['duration_minutes'] as number : undefined,
          temperature: typeof instObj['temperature'] === 'string' ? instObj['temperature'] as string : undefined,
        }
      } else {
        throw new Error(`Invalid instruction at index ${index}: must be a string or object`)
      }
    })

    const recipe: GeneratedRecipe = {
      name: rawRecipe.name,
      ingredients: rawRecipe.ingredients as RecipeIngredient[],
      instructions,
      ...(typeof rawRecipe.servings === 'number' && { servings: rawRecipe.servings }),
      ...(typeof rawRecipe.prep_time_minutes === 'number' && { prep_time_minutes: rawRecipe.prep_time_minutes }),
      ...(typeof rawRecipe.bake_time_minutes === 'number' && { bake_time_minutes: rawRecipe.bake_time_minutes }),
      ...(typeof rawRecipe.total_time_minutes === 'number' && { total_time_minutes: rawRecipe.total_time_minutes }),
      ...(typeof rawRecipe.difficulty === 'string' && { difficulty: rawRecipe.difficulty }),
      ...(typeof rawRecipe.category === 'string' && { category: rawRecipe.category }),
      ...(typeof rawRecipe.description === 'string' && { description: rawRecipe.description }),
      ...(Array.isArray(rawRecipe.tips) && { tips: rawRecipe.tips as string[] }),
      ...(typeof rawRecipe.storage === 'string' && { storage: rawRecipe.storage }),
      ...(typeof rawRecipe.shelf_life === 'string' && { shelf_life: rawRecipe.shelf_life }),
    }

    return recipe
  } catch (error) {
    apiLogger.error({ error }, 'Error parsing recipe response')
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error'
    throw new Error(`Failed to parse recipe: ${errorMessage}`)
  }
}

export function validateRecipeQuality(recipe: GeneratedRecipe, availableIngredients: IngredientSubset[]): void {
  const errors: string[] = []

  if (!recipe.name?.trim()) errors.push('Recipe name is missing')
  if (!recipe.description?.trim()) errors.push('Recipe description is missing')
  if (!recipe.ingredients?.length) errors.push('No ingredients specified')
  if (!recipe.instructions?.length) errors.push('No instructions provided')
  if (!recipe.tips?.length || recipe.tips.length < 3) errors.push('Minimum 3 professional tips required')

  recipe.ingredients.forEach((ing, index) => {
    if (!ing.name?.trim()) errors.push(`Ingredient ${index + 1}: name is missing`)
    if (!ing.quantity || ing.quantity <= 0) errors.push(`Ingredient ${index + 1}: invalid quantity`)
    if (!ing.unit?.trim()) errors.push(`Ingredient ${index + 1}: unit is missing`)

    const availableIng = availableIngredients.find(ai =>
      ai.name.toLowerCase().includes(ing.name.toLowerCase()) ||
      ing.name.toLowerCase().includes(ai.name.toLowerCase())
    )
    if (!availableIng) {
      errors.push(`Ingredient "${ing.name}" not found in available inventory`)
    }
  })

  recipe.instructions.forEach((inst, index) => {
    if (!inst.description?.trim()) errors.push(`Instruction ${index + 1}: description is missing`)
    if (inst.step !== index + 1) errors.push(`Instruction ${index + 1}: incorrect step number`)
  })

  const totalFlour = recipe.ingredients
    .filter(ing => ing.name.toLowerCase().includes('tepung'))
    .reduce((sum, ing) => sum + (ing.unit === 'kg' ? ing.quantity * 1000 : ing.quantity), 0)

  if (totalFlour < 100) errors.push('Flour quantity too low for commercial production')
  if (totalFlour > 2000) errors.push('Flour quantity too high - may be impractical')

  const hasSugar = recipe.ingredients.some(ing => ing.name.toLowerCase().includes('gula'))
  const hasSalt = recipe.ingredients.some(ing => ing.name.toLowerCase().includes('garam'))
  const hasFat = recipe.ingredients.some(ing =>
    ing.name.toLowerCase().includes('mentega') ||
    ing.name.toLowerCase().includes('margarin') ||
    ing.name.toLowerCase().includes('minyak')
  )

  if (!hasSugar && recipe.category && ['cake', 'cookies', 'donuts'].includes(recipe.category)) {
    errors.push('Sweet products should include sugar')
  }
  if (!hasSalt && recipe.category && ['bread', 'pastry'].includes(recipe.category)) {
    errors.push('Savory products should include salt')
  }
  if (!hasFat) {
    errors.push('Recipe should include some form of fat (butter, margarine, oil)')
  }

  if (recipe.prep_time_minutes !== undefined && recipe.prep_time_minutes < 5) {
    errors.push('Preparation time too short for realistic production')
  }
  if (recipe.bake_time_minutes !== undefined && recipe.bake_time_minutes < 0) {
    errors.push('Bake time cannot be negative')
  }
  if (recipe.prep_time_minutes !== undefined && recipe.bake_time_minutes !== undefined &&
    recipe.total_time_minutes !== recipe.prep_time_minutes + recipe.bake_time_minutes) {
    errors.push('Total time should equal prep time + bake time')
  }

  if (errors.length > 0) {
    throw new Error(`Recipe validation failed: ${errors.join('; ')}`)
  }
}
