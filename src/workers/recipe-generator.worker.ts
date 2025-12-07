/**
 * Recipe Generator Web Worker
 * Handles heavy recipe processing tasks off the main thread
 * - Ingredient matching
 * - Cost calculations
 * - Recipe parsing and validation
 */

export interface RecipeWorkerInput {
  type: 'match-ingredients' | 'calculate-costs' | 'parse-recipe' | 'generate-variations'
  payload: unknown
}

export interface IngredientMatchInput {
  recipeIngredients: Array<{ name: string; quantity: number; unit: string }>
  availableIngredients: Array<{
    id: string
    name: string
    price_per_unit: number
    unit: string
    current_stock: number
  }>
}

export interface CostCalculationInput {
  ingredients: Array<{
    name: string
    quantity: number
    unit: string
    matched_id?: string
    price_per_unit?: number
  }>
  servings: number
  operationalCostPercent: number
}

export interface VariationInput {
  baseRecipe: {
    name: string
    ingredients: Array<{ name: string; quantity: number; unit: string }>
    instructions: Array<{ step: number; title: string; description: string }>
  }
  variationType: 'spicier' | 'sweeter' | 'healthier' | 'budget' | 'premium'
  availableIngredients: Array<{ name: string; price_per_unit: number }>
}

export interface MatchedIngredient {
  name: string
  quantity: number
  unit: string
  matched_id: string | null
  matched_name: string | null
  price_per_unit: number
  total_cost: number
  match_confidence: number
  in_stock: boolean
  stock_quantity: number
}

export interface CostCalculationResult {
  total_material_cost: number
  operational_cost: number
  total_hpp: number
  hpp_per_unit: number
  ingredient_breakdown: Array<{
    name: string
    quantity: number
    unit: string
    price_per_unit: number
    total_cost: number
    percentage: number
  }>
  suggested_prices: {
    minimum: number // 30% margin
    recommended: number // 50% margin
    premium: number // 70% margin
  }
}

self.onmessage = (e: MessageEvent<RecipeWorkerInput>) => {
  const { type, payload } = e.data

  try {
    let result: unknown

    switch (type) {
      case 'match-ingredients':
        result = matchIngredients(payload as IngredientMatchInput)
        break
      case 'calculate-costs':
        result = calculateCosts(payload as CostCalculationInput)
        break
      case 'generate-variations':
        result = generateVariations(payload as VariationInput)
        break
      default:
        throw new Error(`Unknown worker task type: ${type}`)
    }

    self.postMessage({ success: true, type, data: result })
  } catch (error) {
    self.postMessage({
      success: false,
      type,
      error: error instanceof Error ? error.message : 'Worker task failed'
    })
  }
}

/**
 * Match recipe ingredients with available inventory using fuzzy matching
 */
function matchIngredients(input: IngredientMatchInput): MatchedIngredient[] {
  const { recipeIngredients, availableIngredients } = input

  return recipeIngredients.map(recipeIng => {
    const normalizedName = normalizeIngredientName(recipeIng.name)
    
    // Find best match from available ingredients
    let bestMatch: typeof availableIngredients[0] | null = null
    let bestScore = 0

    for (const available of availableIngredients) {
      const availableName = normalizeIngredientName(available.name)
      const score = calculateSimilarity(normalizedName, availableName)
      
      if (score > bestScore && score >= 0.6) {
        bestScore = score
        bestMatch = available
      }
    }

    const pricePerUnit = bestMatch?.price_per_unit ?? 0
    const totalCost = pricePerUnit * recipeIng.quantity

    return {
      name: recipeIng.name,
      quantity: recipeIng.quantity,
      unit: recipeIng.unit,
      matched_id: bestMatch?.id ?? null,
      matched_name: bestMatch?.name ?? null,
      price_per_unit: pricePerUnit,
      total_cost: totalCost,
      match_confidence: bestScore,
      in_stock: bestMatch ? bestMatch.current_stock >= recipeIng.quantity : false,
      stock_quantity: bestMatch?.current_stock ?? 0
    }
  })
}

/**
 * Calculate recipe costs with breakdown
 */
function calculateCosts(input: CostCalculationInput): CostCalculationResult {
  const { ingredients, servings, operationalCostPercent } = input

  let totalMaterialCost = 0
  const breakdown: CostCalculationResult['ingredient_breakdown'] = []

  for (const ing of ingredients) {
    const cost = (ing.price_per_unit ?? 0) * ing.quantity
    totalMaterialCost += cost
    
    breakdown.push({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      price_per_unit: ing.price_per_unit ?? 0,
      total_cost: cost,
      percentage: 0 // Will be calculated after total is known
    })
  }

  // Calculate percentages
  for (const item of breakdown) {
    item.percentage = totalMaterialCost > 0 
      ? Math.round((item.total_cost / totalMaterialCost) * 100) 
      : 0
  }

  const operationalCost = totalMaterialCost * (operationalCostPercent / 100)
  const totalHpp = totalMaterialCost + operationalCost
  const hppPerUnit = servings > 0 ? totalHpp / servings : totalHpp

  return {
    total_material_cost: Math.round(totalMaterialCost),
    operational_cost: Math.round(operationalCost),
    total_hpp: Math.round(totalHpp),
    hpp_per_unit: Math.round(hppPerUnit),
    ingredient_breakdown: breakdown,
    suggested_prices: {
      minimum: Math.round(hppPerUnit / 0.7), // 30% margin
      recommended: Math.round(hppPerUnit / 0.5), // 50% margin
      premium: Math.round(hppPerUnit / 0.3) // 70% margin
    }
  }
}

/**
 * Generate recipe variations based on type
 */
function generateVariations(input: VariationInput): {
  name: string
  description: string
  ingredient_changes: Array<{ original: string; modified: string; reason: string }>
  instruction_changes: string[]
} {
  const { baseRecipe, variationType } = input

  const variations: Record<string, {
    nameSuffix: string
    description: string
    ingredientModifiers: Array<{ pattern: RegExp; replacement: string; multiplier?: number; reason: string }>
    instructionAdditions: string[]
  }> = {
    spicier: {
      nameSuffix: ' Pedas',
      description: 'Versi lebih pedas dengan tambahan cabai dan rempah',
      ingredientModifiers: [
        { pattern: /cabai/i, replacement: 'cabai rawit', multiplier: 1.5, reason: 'Tingkatkan level pedas' },
        { pattern: /lada/i, replacement: 'lada hitam', multiplier: 2, reason: 'Tambah rasa pedas' }
      ],
      instructionAdditions: [
        'Tambahkan cabai rawit iris tipis untuk extra pedas',
        'Sajikan dengan sambal sebagai pelengkap'
      ]
    },
    sweeter: {
      nameSuffix: ' Manis',
      description: 'Versi lebih manis cocok untuk yang suka rasa manis',
      ingredientModifiers: [
        { pattern: /gula/i, replacement: 'gula', multiplier: 1.3, reason: 'Tingkatkan rasa manis' },
        { pattern: /coklat/i, replacement: 'coklat', multiplier: 1.2, reason: 'Tambah rasa coklat' }
      ],
      instructionAdditions: [
        'Tambahkan topping gula halus sebelum disajikan',
        'Bisa ditambah madu atau sirup maple'
      ]
    },
    healthier: {
      nameSuffix: ' Sehat',
      description: 'Versi lebih sehat dengan pengurangan gula dan lemak',
      ingredientModifiers: [
        { pattern: /gula/i, replacement: 'gula stevia', multiplier: 0.5, reason: 'Kurangi kalori' },
        { pattern: /mentega/i, replacement: 'minyak kelapa', multiplier: 0.7, reason: 'Lemak lebih sehat' },
        { pattern: /tepung terigu/i, replacement: 'tepung gandum utuh', multiplier: 1, reason: 'Lebih banyak serat' }
      ],
      instructionAdditions: [
        'Gunakan teknik panggang daripada goreng jika memungkinkan',
        'Tambahkan sayuran atau buah untuk nutrisi ekstra'
      ]
    },
    budget: {
      nameSuffix: ' Ekonomis',
      description: 'Versi hemat dengan bahan yang lebih terjangkau',
      ingredientModifiers: [
        { pattern: /mentega/i, replacement: 'margarin', multiplier: 1, reason: 'Lebih ekonomis' },
        { pattern: /susu segar/i, replacement: 'susu bubuk', multiplier: 0.8, reason: 'Lebih hemat' },
        { pattern: /keju/i, replacement: 'keju cheddar lokal', multiplier: 0.8, reason: 'Alternatif lebih murah' }
      ],
      instructionAdditions: [
        'Bisa menggunakan bahan substitusi yang lebih murah',
        'Buat dalam jumlah besar untuk efisiensi biaya'
      ]
    },
    premium: {
      nameSuffix: ' Premium',
      description: 'Versi premium dengan bahan berkualitas tinggi',
      ingredientModifiers: [
        { pattern: /mentega/i, replacement: 'butter Anchor', multiplier: 1.2, reason: 'Kualitas premium' },
        { pattern: /coklat/i, replacement: 'coklat Belgia', multiplier: 1.3, reason: 'Rasa lebih kaya' },
        { pattern: /vanili/i, replacement: 'ekstrak vanili murni', multiplier: 1, reason: 'Aroma lebih harum' }
      ],
      instructionAdditions: [
        'Gunakan bahan-bahan berkualitas premium untuk hasil terbaik',
        'Perhatikan detail presentasi untuk tampilan mewah'
      ]
    }
  }

  const variation = variations[variationType]
  if (!variation) {
    return {
      name: baseRecipe.name,
      description: 'Variasi tidak tersedia',
      ingredient_changes: [],
      instruction_changes: []
    }
  }

  const ingredientChanges: Array<{ original: string; modified: string; reason: string }> = []

  // Apply ingredient modifications
  for (const ing of baseRecipe.ingredients) {
    for (const mod of variation.ingredientModifiers) {
      if (mod.pattern.test(ing.name)) {
        ingredientChanges.push({
          original: `${ing.name} ${ing.quantity}${ing.unit}`,
          modified: `${mod.replacement} ${Math.round(ing.quantity * (mod.multiplier ?? 1))}${ing.unit}`,
          reason: mod.reason
        })
        break
      }
    }
  }

  return {
    name: baseRecipe.name + variation.nameSuffix,
    description: variation.description,
    ingredient_changes: ingredientChanges,
    instruction_changes: variation.instructionAdditions
  }
}

// Helper functions
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function calculateSimilarity(str1: string, str2: string): number {
  // Check for exact match first
  if (str1 === str2) return 1

  // Check if one contains the other
  if (str1.includes(str2) || str2.includes(str1)) {
    return 0.9
  }

  // Levenshtein distance based similarity
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0) as number[])

  for (let i = 0; i <= len1; i++) {
    matrix[i]![0] = i
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0]![j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      const row = matrix[i]
      const prevRow = matrix[i - 1]
      if (row && prevRow) {
        row[j] = Math.min(
          (prevRow[j] ?? 0) + 1,
          (row[j - 1] ?? 0) + 1,
          (prevRow[j - 1] ?? 0) + cost
        )
      }
    }
  }

  const maxLen = Math.max(len1, len2)
  const lastRow = matrix[len1]
  const distance = lastRow?.[len2] ?? 0
  return maxLen > 0 ? 1 - distance / maxLen : 1
}
