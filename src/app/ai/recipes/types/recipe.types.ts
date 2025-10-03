// Indonesian Food Recipe Generator Types

export interface IndonesianFoodCategory {
  id: string
  name: string
  description: string
  icon: string
  subcategories: string[]
  popularItems: string[]
}

export interface RecipeRequest {
  category: string
  subcategory?: string
  specificDish?: string
  dietaryRestrictions?: string[]
  servingSize?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  cookingTime?: 'quick' | 'normal' | 'extended'
  spiceLevel?: 'mild' | 'medium' | 'spicy' | 'very-spicy'
}

export interface GeneratedRecipe {
  id: string
  title: string
  category: string
  subcategory: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  cookingTime: number // in minutes
  servingSize: number
  spiceLevel: 'mild' | 'medium' | 'spicy' | 'very-spicy'

  // Ingredients
  ingredients: RecipeIngredient[]

  // Instructions
  instructions: RecipeInstruction[]

  // Nutritional info (optional)
  nutritionalInfo?: NutritionalInfo

  // Cultural context
  culturalContext?: {
    region: string
    festival?: string
    tradition?: string
    notes?: string
  }

  // Generated metadata
  generatedAt: string
  aiModel: string
  prompt: string
}

export interface RecipeIngredient {
  id: string
  name: string
  amount: number
  unit: string
  notes?: string
  substitutes?: string[]
}

export interface RecipeInstruction {
  id: string
  step: number
  instruction: string
  duration?: number // in minutes
  temperature?: number // in celsius
  tips?: string[]
}

export interface NutritionalInfo {
  calories: number
  protein: number // grams
  carbs: number // grams
  fat: number // grams
  fiber: number // grams
  sugar: number // grams
  sodium: number // mg
}

export interface RecipeHistory {
  id: string
  recipe: GeneratedRecipe
  saved: boolean
  favorited: boolean
  createdAt: string
  lastViewed?: string
}

export interface AIGenerationOptions {
  temperature: number
  maxTokens: number
  model: string
  includeCulturalContext: boolean
  includeNutritionalInfo: boolean
  language: 'id' | 'en'
}

// Indonesian Food Categories
export const INDONESIAN_FOOD_CATEGORIES: IndonesianFoodCategory[] = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng',
    description: 'Fried rice dishes - Indonesia\'s beloved comfort food',
    icon: '🍚',
    subcategories: ['nasi-goreng-spesial', 'nasi-goreng-kampung', 'nasi-goreng-seafood', 'nasi-goreng-vegetarian'],
    popularItems: ['Nasi Goreng Spesial', 'Nasi Goreng Seafood', 'Nasi Goreng Mawut', 'Nasi Goreng Pattaya']
  },
  {
    id: 'sate',
    name: 'Sate',
    description: 'Skewered grilled meats with peanut sauce',
    icon: '🍢',
    subcategories: ['sate-ayam', 'sate-sapi', 'sate-kambing', 'sate-ikan', 'sate-vegetarian'],
    popularItems: ['Sate Ayam', 'Sate Sapi Madura', 'Sate Padang', 'Sate Lilit Bali']
  },
  {
    id: 'rendang',
    name: 'Rendang',
    description: 'Slow-cooked meat in coconut milk - UNESCO heritage dish',
    icon: '🥘',
    subcategories: ['rendang-daging', 'rendang-ayam', 'rendang-ikan', 'rendang-sayur'],
    popularItems: ['Rendang Daging', 'Rendang Ayam', 'Rendang Padang']
  },
  {
    id: 'ayam-goreng',
    name: 'Ayam Goreng',
    description: 'Fried chicken dishes with Indonesian spices',
    icon: '🍗',
    subcategories: ['ayam-goreng-kremes', 'ayam-goreng-bumbu', 'ayam-goreng-lengkuas', 'ayam-goreng-mentega'],
    popularItems: ['Ayam Goreng Kremes', 'Ayam Goreng Lengkuas', 'Ayam Goreng Bumbu Bali']
  },
  {
    id: 'mie',
    name: 'Mie & Pasta',
    description: 'Noodle dishes from various Indonesian regions',
    icon: '🍜',
    subcategories: ['mie-goreng', 'mie-rebus', 'mie-kuah', 'bakmi', 'kwetiau'],
    popularItems: ['Mie Goreng Jawa', 'Bakmi Goreng', 'Kwetiau Goreng', 'Mie Aceh']
  },
  {
    id: 'ikan-bakar',
    name: 'Ikan Bakar',
    description: 'Grilled fish with traditional marinades',
    icon: '🐟',
    subcategories: ['ikan-bakar-manis', 'ikan-bakar-pedas', 'ikan-bakar-acar', 'ikan-bakar-kecap'],
    popularItems: ['Ikan Bakar Jimbaran', 'Ikan Bakar Rica', 'Pecak Ikan']
  },
  {
    id: 'gulai',
    name: 'Gulai',
    description: 'Rich coconut curry dishes',
    icon: '🥥',
    subcategories: ['gulai-daging', 'gulai-ayam', 'gulai-ikan', 'gulai-sayur', 'gulai-telur'],
    popularItems: ['Gulai Kambing', 'Gulai Ayam', 'Gulai Nangka', 'Gulai Tunjang']
  },
  {
    id: 'martabak',
    name: 'Martabak',
    description: 'Stuffed pancakes - sweet and savory varieties',
    icon: '🥞',
    subcategories: ['martabak-manis', 'martabak-telur', 'martabak-ayam', 'martabak-keju'],
    popularItems: ['Martabak Manis', 'Martabak Telur', 'Martabak Keju']
  },
  {
    id: 'bakso',
    name: 'Bakso',
    description: 'Meatball soup and its variations',
    icon: '🥟',
    subcategories: ['bakso-kuah', 'bakso-goreng', 'bakso-malang', 'bakso-solo'],
    popularItems: ['Bakso Malang', 'Bakso Solo', 'Bakso Goreng']
  },
  {
    id: 'sayur-mayur',
    name: 'Sayur Mayur',
    description: 'Vegetable dishes and traditional salads',
    icon: '🥬',
    subcategories: ['sayur-asem', 'sayur-lodeh', 'urap', 'karedok', 'pecel'],
    popularItems: ['Sayur Asem', 'Sayur Lodeh', 'Urap Bali', 'Pecel Madiun']
  },
  {
    id: 'sambal',
    name: 'Sambal',
    description: 'Chili-based condiments and dishes',
    icon: '🌶️',
    subcategories: ['sambal-terasi', 'sambal-matah', 'sambal-ado', 'sambal-ijo'],
    popularItems: ['Sambal Terasi', 'Sambal Matah', 'Sambal Ijo']
  },
  {
    id: 'minuman',
    name: 'Minuman',
    description: 'Traditional Indonesian beverages',
    icon: '🥤',
    subcategories: ['wedang', 'jus', 'es', 'kopi', 'teh', 'soda'],
    popularItems: ['Wedang Jahe', 'Es Cendol', 'Es Dawet', 'Bajigur', 'Bandrek', 'Wedang Ronde']
  },
  {
    id: 'kue-tradisional',
    name: 'Kue Tradisional',
    description: 'Traditional Indonesian cakes and sweets',
    icon: '🍰',
    subcategories: ['kue-basah', 'kue-kering', 'kue-klepon', 'kue-putu', 'kue-lapis'],
    popularItems: ['Klepon', 'Putu Ayu', 'Lapis Legit', 'Kue Lumpur', 'Bika Ambon']
  },
  {
    id: 'soto',
    name: 'Soto',
    description: 'Traditional Indonesian soups',
    icon: '🍲',
    subcategories: ['soto-ayam', 'soto-daging', 'soto-mie', 'soto-lamongan', 'soto-betawi'],
    popularItems: ['Soto Ayam', 'Soto Lamongan', 'Soto Betawi', 'Soto Mie']
  },
  {
    id: 'opor',
    name: 'Opor',
    description: 'Mild coconut curries often served during Lebaran',
    icon: '🥥',
    subcategories: ['opor-ayam', 'opor-daging', 'opor-telur', 'opor-kentang'],
    popularItems: ['Opor Ayam', 'Opor Telur', 'Opor Daging']
  },
  {
    id: 'babi-guling',
    name: 'Babi Guling',
    description: 'Bali\'s famous suckling pig roast',
    icon: '🐖',
    subcategories: ['babi-guling-komplit', 'babi-guling-sayur', 'babi-guling-lawar'],
    popularItems: ['Babi Guling Bali']
  },
  {
    id: 'ayam-taliwang',
    name: 'Ayam Taliwang',
    description: 'Spicy grilled chicken from Lombok',
    icon: '🍗',
    subcategories: ['ayam-taliwang-asli', 'ayam-taliwang-vegetarian', 'ayam-taliwang-plecing'],
    popularItems: ['Ayam Taliwang', 'Plecing Kangkung']
  },
  {
    id: 'pempek',
    name: 'Pempek',
    description: 'Fish cakes from Palembang',
    icon: '🐟',
    subcategories: ['pempek-kapal', 'pempek-udang', 'pempek-tenggiri', 'pempek-cuko'],
    popularItems: ['Pempek Kapal Selam', 'Tekwan', 'Pempek Cuko']
  },
  {
    id: 'lontong-sayur',
    name: 'Lontong Sayur',
    description: 'Compressed rice with vegetable curry',
    icon: '🍚',
    subcategories: ['lontong-sayur-medan', 'lontong-sayur-betawi', 'lontong-sayur-solo'],
    popularItems: ['Lontong Sayur Medan', 'Ketupat Sayur', 'Lontong Opor']
  },
  {
    id: 'nasi-uduk',
    name: 'Nasi Uduk',
    description: 'Fragrant coconut rice dish from Jakarta',
    icon: '🍚',
    subcategories: ['nasi-uduk-betawi', 'nasi-uduk-sambal', 'nasi-uduk-telur'],
    popularItems: ['Nasi Uduk Betawi', 'Nasi Uduk Sambal Goreng']
  },
  {
    id: 'ketoprak',
    name: 'Ketoprak',
    description: 'Jakarta\'s vegetable salad with peanut sauce',
    icon: '🥗',
    subcategories: ['ketoprak-jakarta', 'ketoprak-vegetarian', 'ketoprak-tempe'],
    popularItems: ['Ketoprak Jakarta', 'Ketoprak Tempe']
  }
]

// Helper functions
export const getCategoryById = (id: string): IndonesianFoodCategory | undefined => {
  return INDONESIAN_FOOD_CATEGORIES.find(cat => cat.id === id)
}

export const getAllSubcategories = (): string[] => {
  return INDONESIAN_FOOD_CATEGORIES.flatMap(cat => cat.subcategories)
}

export const searchCategories = (query: string): IndonesianFoodCategory[] => {
  const lowercaseQuery = query.toLowerCase()
  return INDONESIAN_FOOD_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(lowercaseQuery) ||
    cat.description.toLowerCase().includes(lowercaseQuery) ||
    cat.subcategories.some(sub => sub.toLowerCase().includes(lowercaseQuery)) ||
    cat.popularItems.some(item => item.toLowerCase().includes(lowercaseQuery))
  )
}
