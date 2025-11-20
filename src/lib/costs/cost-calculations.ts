import type {
  IngredientCostSnapshot,
  RecipeCostPreview,
  RecipeCostRecord,
  RecipeIngredientSnapshot
} from '@/types/recipes/cost'

export interface IngredientCostContribution {
  ingredientId: string
  ingredientName: string
  quantity: number
  unitPrice: number
  costContribution: number
  lastUpdated: string | null
}

const getIngredientUnitPrice = (ingredient: IngredientCostSnapshot | null): number => {
  if (!ingredient) {
    return 0
  }

  return ingredient.weighted_average_cost ?? ingredient.price_per_unit ?? 0
}

const normalizeQuantity = (quantity: number | null): number => {
  if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    return 0
  }
  return quantity
}

export const extractIngredientContributions = (
  recipe: RecipeCostRecord
): IngredientCostContribution[] => {
  const entries: RecipeIngredientSnapshot[] = recipe.recipe_ingredients ?? []

  return entries
    .filter((entry): entry is RecipeIngredientSnapshot & { ingredients: IngredientCostSnapshot } => Boolean(entry?.ingredients))
    .map((entry) => {
      const ingredient = entry.ingredients
      const quantity = normalizeQuantity(entry.quantity)
      const unitPrice = getIngredientUnitPrice(ingredient)

      return {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        quantity,
        unitPrice,
        costContribution: quantity * unitPrice,
        lastUpdated: ingredient.updated_at ?? null
      }
    })
}

export const calculateMaterialCost = (recipe: RecipeCostRecord): {
  materialCost: number
  ingredientsCount: number
} => {
  const contributions = extractIngredientContributions(recipe)

  const materialCost = contributions.reduce((total, entry) => total + entry.costContribution, 0)

  return {
    materialCost,
    ingredientsCount: contributions.length
  }
}

const calculateCostPerServing = (materialCost: number, servings: number | null): number => {
  if (!servings || servings <= 0) {
    return materialCost
  }

  return materialCost / servings
}

export const buildRecipeCostPreview = (recipe: RecipeCostRecord): RecipeCostPreview => {
  const { materialCost, ingredientsCount } = calculateMaterialCost(recipe)

  return {
    recipeId: recipe.id,
    materialCost,
    costPerServing: calculateCostPerServing(materialCost, recipe.servings),
    lastUpdated: recipe.updated_at,
    ingredientsCount
  }
}

export const resolveLatestCostUpdate = (
  recipe: RecipeCostRecord,
  fallback: string | null = null
): string | null => {
  const contributions = extractIngredientContributions(recipe)

  const latestIngredientUpdate = contributions.reduce<string | null>((latest, entry) => {
    if (!entry.lastUpdated) {
      return latest
    }

    if (!latest || entry.lastUpdated > latest) {
      return entry.lastUpdated
    }

    return latest
  }, null)

  return latestIngredientUpdate ?? recipe.updated_at ?? fallback
}
