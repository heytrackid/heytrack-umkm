import type { GeneratedRecipe, IngredientSubset, RecipeIngredient, RecipeInstruction } from '../types'

// ============================================================================
// Constants
// ============================================================================

const INGREDIENT_KEYWORDS = {
  FLOUR: ['tepung'],
  SUGAR: ['gula'],
  BUTTER: ['mentega', 'margarin'],
  YEAST: ['ragi'],
  SALT: ['garam'],
  EGG: ['telur'],
} as const

// ============================================================================
// Ingredient Finder Utility
// ============================================================================

class IngredientFinder {
  constructor(private ingredients: IngredientSubset[]) {}

  findByKeywords(keywords: readonly string[]): IngredientSubset | undefined {
    return this.ingredients.find(ing => 
      keywords.some(keyword => ing.name.toLowerCase().includes(keyword.toLowerCase()))
    )
  }

  hasIngredient(keywords: readonly string[]): boolean {
    return this.findByKeywords(keywords) !== undefined
  }
}

// ============================================================================
// Validation
// ============================================================================

function validateInputs(productName: string, servings: number): void {
  if (!productName || productName.trim().length === 0) {
    throw new Error('Product name cannot be empty')
  }
  if (servings <= 0 || servings > 100) {
    throw new Error('Servings must be between 1 and 100')
  }
}

// ============================================================================
// Main Fallback Recipe Generator
// ============================================================================

export function generateFallbackRecipe(
  productName: string,
  productType: string,
  servings: number,
  availableIngredients: IngredientSubset[]
): GeneratedRecipe | null {
  try {
    validateInputs(productName, servings)
  } catch {
    return null
  }

  const finder = new IngredientFinder(availableIngredients)

  // Check minimum requirements
  if (!finder.hasIngredient(INGREDIENT_KEYWORDS.FLOUR)) {
    return null
  }

  // Strategy pattern for recipe generation
  switch (productType) {
    case 'bread':
      return generateBasicBreadRecipe(productName, servings, finder)
    case 'cake':
      if (finder.hasIngredient(INGREDIENT_KEYWORDS.SUGAR) && finder.hasIngredient(INGREDIENT_KEYWORDS.EGG)) {
        return generateBasicCakeRecipe(productName, servings, finder)
      }
      break
    case 'cookies':
      if (finder.hasIngredient(INGREDIENT_KEYWORDS.BUTTER) && finder.hasIngredient(INGREDIENT_KEYWORDS.SUGAR)) {
        return generateBasicCookieRecipe(productName, servings, finder)
      }
      break
    default:
      return generateBasicBreadRecipe(productName, servings, finder)
  }

  return null
}

// ============================================================================
// Recipe Generators
// ============================================================================

function generateBasicBreadRecipe(
  productName: string,
  servings: number,
  finder: IngredientFinder
): GeneratedRecipe {
  const flour = finder.findByKeywords(INGREDIENT_KEYWORDS.FLOUR)
  const sugar = finder.findByKeywords(INGREDIENT_KEYWORDS.SUGAR)
  const yeast = finder.findByKeywords(INGREDIENT_KEYWORDS.YEAST)
  const salt = finder.findByKeywords(INGREDIENT_KEYWORDS.SALT)
  const butter = finder.findByKeywords(INGREDIENT_KEYWORDS.BUTTER)

  const recipeIngredients: RecipeIngredient[] = [
    {
      name: flour?.name || 'Tepung Terigu',
      quantity: 250 * servings,
      unit: 'gram',
      notes: 'Tepung protein tinggi untuk hasil terbaik'
    },
    ...(sugar ? [{
      name: sugar.name,
      quantity: 30 * servings,
      unit: 'gram',
      notes: 'Untuk memberikan rasa manis'
    }] : []),
    ...(yeast ? [{
      name: yeast.name,
      quantity: 5 * servings,
      unit: 'gram',
      notes: 'Ragi instan'
    }] : []),
    ...(salt ? [{
      name: salt.name,
      quantity: 3 * servings,
      unit: 'gram',
      notes: 'Garam halus'
    }] : []),
    ...(butter ? [{
      name: butter.name,
      quantity: 20 * servings,
      unit: 'gram',
      notes: 'Mentega atau margarin'
    }] : [])
  ]

  const instructions: RecipeInstruction[] = [
    {
      step: 1,
      title: 'Persiapan Bahan',
      description: 'Campurkan tepung, gula, garam, dan ragi dalam mangkuk besar.',
      duration_minutes: 5
    },
    {
      step: 2,
      title: 'Uleni Adonan',
      description: 'Tambahkan air sedikit demi sedikit sambil uleni hingga kalis. Diamkan 10 menit.',
      duration_minutes: 15
    },
    {
      step: 3,
      title: 'Panggang',
      description: 'Panggang dalam oven preheated 180°C selama 20-25 menit hingga kecoklatan.',
      duration_minutes: 25,
      temperature: '180°C'
    }
  ]

  return {
    name: productName,
    category: 'bread',
    servings,
    prep_time_minutes: 15,
    bake_time_minutes: 25,
    total_time_minutes: 40,
    difficulty: 'easy',
    description: `Roti ${productName} sederhana yang cocok untuk pemula. Dibuat dengan bahan-bahan dasar yang mudah didapat.`,
    ingredients: recipeIngredients,
    instructions,
    tips: [
      'Gunakan tepung protein tinggi untuk hasil roti yang lebih baik',
      'Jangan terlalu banyak air agar adonan tidak lengket',
      'Oven harus sudah panas sebelum memasukkan roti',
      'Simpan dalam wadah kedap udara untuk menjaga kesegaran'
    ],
    storage: 'Simpan dalam wadah kedap udara pada suhu ruangan',
    shelf_life: '3-4 hari dalam kondisi normal'
  }
}

function generateBasicCakeRecipe(
  productName: string,
  servings: number,
  finder: IngredientFinder
): GeneratedRecipe {
  const flour = finder.findByKeywords(INGREDIENT_KEYWORDS.FLOUR)
  const sugar = finder.findByKeywords(INGREDIENT_KEYWORDS.SUGAR)
  const egg = finder.findByKeywords(INGREDIENT_KEYWORDS.EGG)
  const butter = finder.findByKeywords(INGREDIENT_KEYWORDS.BUTTER)

  const recipeIngredients: RecipeIngredient[] = [
    {
      name: flour?.name || 'Tepung Terigu',
      quantity: 200 * servings,
      unit: 'gram'
    },
    {
      name: sugar?.name || 'Gula',
      quantity: 150 * servings,
      unit: 'gram'
    },
    {
      name: egg?.name || 'Telur',
      quantity: 2 * servings,
      unit: 'piece'
    },
    ...(butter ? [{
      name: butter.name,
      quantity: 100 * servings,
      unit: 'gram'
    }] : [])
  ]

  const instructions: RecipeInstruction[] = [
    {
      step: 1,
      title: 'Mixer Bahan',
      description: 'Kocok mentega dan gula hingga lembut, lalu tambahkan telur satu per satu.',
      duration_minutes: 10
    },
    {
      step: 2,
      title: 'Campur Tepung',
      description: 'Masukkan tepung terigu secara bertahap sambil diaduk rata.',
      duration_minutes: 5
    },
    {
      step: 3,
      title: 'Panggang',
      description: 'Tuang ke loyang dan panggang pada suhu 170°C selama 30-35 menit.',
      duration_minutes: 35,
      temperature: '170°C'
    }
  ]

  return {
    name: productName,
    category: 'cake',
    servings,
    prep_time_minutes: 20,
    bake_time_minutes: 35,
    total_time_minutes: 55,
    difficulty: 'medium',
    description: `Kue ${productName} klasik yang lembut dan enak. Cocok untuk berbagai acara.`,
    ingredients: recipeIngredients,
    instructions,
    tips: [
      'Pastikan mentega dalam suhu ruangan untuk hasil yang lebih baik',
      'Jangan overmix adonan agar kue tidak bantat',
      'Gunakan loyang yang sudah diolesi mentega dan ditaburi tepung',
      'Kue siap dipotong setelah dingin sempurna'
    ],
    storage: 'Simpan dalam wadah kedap udara di tempat sejuk',
    shelf_life: '3-4 hari dalam suhu ruangan, 1 minggu dalam kulkas'
  }
}

function generateBasicCookieRecipe(
  productName: string,
  servings: number,
  finder: IngredientFinder
): GeneratedRecipe {
  const flour = finder.findByKeywords(INGREDIENT_KEYWORDS.FLOUR)
  const sugar = finder.findByKeywords(INGREDIENT_KEYWORDS.SUGAR)
  const butter = finder.findByKeywords(INGREDIENT_KEYWORDS.BUTTER)

  const recipeIngredients: RecipeIngredient[] = [
    {
      name: flour?.name || 'Tepung Terigu',
      quantity: 150 * servings,
      unit: 'gram'
    },
    {
      name: sugar?.name || 'Gula',
      quantity: 80 * servings,
      unit: 'gram'
    },
    {
      name: butter?.name || 'Mentega',
      quantity: 100 * servings,
      unit: 'gram'
    }
  ]

  const instructions: RecipeInstruction[] = [
    {
      step: 1,
      title: 'Mixer Bahan',
      description: 'Kocok mentega dan gula hingga lembut dan mengembang.',
      duration_minutes: 8
    },
    {
      step: 2,
      title: 'Tambah Tepung',
      description: 'Masukkan tepung terigu, aduk hingga tercampur rata dan adonan bisa dibentuk.',
      duration_minutes: 5
    },
    {
      step: 3,
      title: 'Bentuk & Panggang',
      description: 'Bentuk adonan sesuai selera, panggang pada suhu 160°C selama 12-15 menit.',
      duration_minutes: 15,
      temperature: '160°C'
    }
  ]

  return {
    name: productName,
    category: 'cookies',
    servings,
    prep_time_minutes: 15,
    bake_time_minutes: 12,
    total_time_minutes: 27,
    difficulty: 'easy',
    description: `Cookies ${productName} yang renyah di luar dan lembut di dalam. Mudah dibuat dan cocok untuk jualan.`,
    ingredients: recipeIngredients,
    instructions,
    tips: [
      'Jangan overmix adonan agar cookies tetap renyah',
      'Beri jarak antar cookies di loyang karena akan mengembang',
      'Cookies akan mengeras setelah dingin, jangan panggang terlalu lama',
      'Simpan dalam toples kedap udara untuk menjaga kerenyahan'
    ],
    storage: 'Simpan dalam toples kedap udara pada suhu ruangan',
    shelf_life: '1-2 minggu dalam kondisi kedap udara'
  }
}
