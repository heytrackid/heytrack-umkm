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

export const RECIPE_TEMPLATES: RecipeTemplate[] = [
  // Bakery & Pastry
  {
    id: 'brownies-coklat',
    name: 'Brownies Coklat',
    category: 'Bakery',
    type: 'cake',
    servings: 12,
    ingredients: ['tepung terigu', 'coklat bubuk', 'telur', 'gula', 'mentega', 'baking powder'],
    icon: '🍫',
    description: 'Brownies coklat lembut dan fudgy',
    estimatedHPP: 15000,
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 30
  },
  {
    id: 'cookies-vanilla',
    name: 'Cookies Vanilla',
    category: 'Bakery',
    type: 'cookies',
    servings: 24,
    ingredients: ['tepung terigu', 'mentega', 'gula', 'telur', 'vanilla extract'],
    icon: '🍪',
    description: 'Cookies renyah dengan aroma vanilla',
    estimatedHPP: 12000,
    difficulty: 'easy',
    prepTime: 20,
    cookTime: 15
  },
  {
    id: 'roti-tawar',
    name: 'Roti Tawar',
    category: 'Bakery',
    type: 'bread',
    servings: 1,
    ingredients: ['tepung terigu', 'ragi', 'gula', 'garam', 'mentega', 'susu'],
    icon: '🍞',
    description: 'Roti tawar lembut untuk sarapan',
    estimatedHPP: 8000,
    difficulty: 'medium',
    prepTime: 30,
    cookTime: 40
  },
  {
    id: 'donat-kentang',
    name: 'Donat Kentang',
    category: 'Bakery',
    type: 'pastry',
    servings: 20,
    ingredients: ['tepung terigu', 'kentang', 'ragi', 'gula', 'telur', 'mentega'],
    icon: '🍩',
    description: 'Donat empuk dengan kentang',
    estimatedHPP: 10000,
    difficulty: 'medium',
    prepTime: 45,
    cookTime: 20
  },

  // Snacks & Gorengan
  {
    id: 'risoles-mayo',
    name: 'Risoles Mayo',
    category: 'Snacks',
    type: 'fried',
    servings: 20,
    ingredients: ['tepung terigu', 'telur', 'susu', 'ayam', 'wortel', 'mayones', 'tepung panir'],
    icon: '🥟',
    description: 'Risoles isi ayam mayo crispy',
    estimatedHPP: 18000,
    difficulty: 'medium',
    prepTime: 60,
    cookTime: 30
  },
  {
    id: 'lumpia-sayur',
    name: 'Lumpia Sayur',
    category: 'Snacks',
    type: 'fried',
    servings: 25,
    ingredients: ['kulit lumpia', 'wortel', 'kol', 'tauge', 'bawang putih', 'kecap'],
    icon: '🌯',
    description: 'Lumpia sayur segar dan renyah',
    estimatedHPP: 12000,
    difficulty: 'easy',
    prepTime: 30,
    cookTime: 20
  },
  {
    id: 'pisang-goreng',
    name: 'Pisang Goreng Crispy',
    category: 'Snacks',
    type: 'fried',
    servings: 15,
    ingredients: ['pisang', 'tepung terigu', 'gula', 'vanili', 'tepung panir'],
    icon: '🍌',
    description: 'Pisang goreng dengan coating crispy',
    estimatedHPP: 8000,
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 15
  },

  // Beverages
  {
    id: 'thai-tea',
    name: 'Thai Tea',
    category: 'Beverages',
    type: 'drink',
    servings: 10,
    ingredients: ['thai tea', 'susu kental manis', 'gula', 'es batu'],
    icon: '🧋',
    description: 'Thai tea manis segar',
    estimatedHPP: 5000,
    difficulty: 'easy',
    prepTime: 10,
    cookTime: 5
  },
  {
    id: 'kopi-susu',
    name: 'Kopi Susu Gula Aren',
    category: 'Beverages',
    type: 'drink',
    servings: 10,
    ingredients: ['kopi bubuk', 'susu', 'gula aren', 'es batu'],
    icon: '☕',
    description: 'Kopi susu dengan gula aren',
    estimatedHPP: 6000,
    difficulty: 'easy',
    prepTime: 10,
    cookTime: 5
  },
  {
    id: 'jus-alpukat',
    name: 'Jus Alpukat',
    category: 'Beverages',
    type: 'drink',
    servings: 5,
    ingredients: ['alpukat', 'susu kental manis', 'gula', 'es batu', 'coklat'],
    icon: '🥑',
    description: 'Jus alpukat creamy',
    estimatedHPP: 8000,
    difficulty: 'easy',
    prepTime: 10,
    cookTime: 0
  },

  // Main Dishes
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng Spesial',
    category: 'Main Dish',
    type: 'rice',
    servings: 5,
    ingredients: ['nasi', 'telur', 'ayam', 'bawang merah', 'bawang putih', 'kecap manis', 'cabai'],
    icon: '🍛',
    description: 'Nasi goreng dengan topping lengkap',
    estimatedHPP: 12000,
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 15
  },
  {
    id: 'mie-ayam',
    name: 'Mie Ayam Bakso',
    category: 'Main Dish',
    type: 'noodles',
    servings: 5,
    ingredients: ['mie', 'ayam', 'bakso', 'sawi', 'bawang goreng', 'kecap', 'kaldu ayam'],
    icon: '🍜',
    description: 'Mie ayam dengan bakso',
    estimatedHPP: 10000,
    difficulty: 'medium',
    prepTime: 20,
    cookTime: 20
  },
  {
    id: 'ayam-geprek',
    name: 'Ayam Geprek',
    category: 'Main Dish',
    type: 'fried',
    servings: 5,
    ingredients: ['ayam', 'tepung', 'cabai', 'bawang putih', 'tomat', 'garam'],
    icon: '🍗',
    description: 'Ayam goreng geprek pedas',
    estimatedHPP: 15000,
    difficulty: 'easy',
    prepTime: 20,
    cookTime: 25
  },

  // Traditional Snacks
  {
    id: 'kue-cubit',
    name: 'Kue Cubit',
    category: 'Traditional',
    type: 'cake',
    servings: 30,
    ingredients: ['tepung terigu', 'telur', 'gula', 'susu', 'baking powder', 'topping'],
    icon: '🧁',
    description: 'Kue cubit mini dengan topping',
    estimatedHPP: 10000,
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 20
  },
  {
    id: 'martabak-manis',
    name: 'Martabak Manis',
    category: 'Traditional',
    type: 'pancake',
    servings: 4,
    ingredients: ['tepung terigu', 'telur', 'gula', 'ragi', 'susu', 'mentega', 'topping'],
    icon: '🥞',
    description: 'Martabak manis tebal',
    estimatedHPP: 20000,
    difficulty: 'medium',
    prepTime: 30,
    cookTime: 20
  },
  {
    id: 'klepon',
    name: 'Klepon',
    category: 'Traditional',
    type: 'snack',
    servings: 30,
    ingredients: ['tepung ketan', 'gula merah', 'kelapa parut', 'daun pandan', 'garam'],
    icon: '🍡',
    description: 'Klepon isi gula merah',
    estimatedHPP: 8000,
    difficulty: 'medium',
    prepTime: 30,
    cookTime: 15
  },

  // Frozen Food
  {
    id: 'dimsum-ayam',
    name: 'Dimsum Ayam',
    category: 'Frozen',
    type: 'dimsum',
    servings: 20,
    ingredients: ['kulit dimsum', 'ayam giling', 'wortel', 'bawang putih', 'kecap', 'tepung tapioka'],
    icon: '🥟',
    description: 'Dimsum ayam homemade',
    estimatedHPP: 15000,
    difficulty: 'medium',
    prepTime: 45,
    cookTime: 15
  },
  {
    id: 'nugget-ayam',
    name: 'Nugget Ayam',
    category: 'Frozen',
    type: 'fried',
    servings: 30,
    ingredients: ['ayam giling', 'tepung terigu', 'telur', 'bawang putih', 'tepung panir', 'bumbu'],
    icon: '🍗',
    description: 'Nugget ayam crispy',
    estimatedHPP: 18000,
    difficulty: 'medium',
    prepTime: 40,
    cookTime: 20
  }
]

// Group templates by category
export const TEMPLATES_BY_CATEGORY = RECIPE_TEMPLATES.reduce((acc, template) => {
  if (!acc[template.category]) {
    acc[template.category] = []
  }
  acc[template.category].push(template)
  return acc
}, {} as Record<string, RecipeTemplate[]>)

// Get template by ID
export const getTemplateById = (id: string): RecipeTemplate | undefined => {
  return RECIPE_TEMPLATES.find(t => t.id === id)
}

// Get templates by category
export const getTemplatesByCategory = (category: string): RecipeTemplate[] => {
  return TEMPLATES_BY_CATEGORY[category] || []
}

// Get all categories
export const RECIPE_CATEGORIES = Object.keys(TEMPLATES_BY_CATEGORY)
