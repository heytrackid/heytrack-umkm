export const RECIPE_CATEGORIES = [
  { value: 'bread', label: 'Roti', icon: '🍞' },
  { value: 'pastry', label: 'Pastry', icon: '🥐' },
  { value: 'cake', label: 'Kue', icon: '🍰' },
  { value: 'cookie', label: 'Cookie', icon: '🍪' },
  { value: 'donut', label: 'Donat', icon: '🍩' },
  { value: 'traditional', label: 'Tradisional', icon: '🥮' },
  { value: 'snack', label: 'Snack', icon: '🥨' },
  { value: 'beverage', label: 'Minuman', icon: '🧋' }
] as const

export const DIFFICULTY_LEVELS = [
  { 
    value: 'easy', 
    label: 'Mudah', 
    icon: '🟢',
    description: 'Cocok untuk pemula, teknik dasar',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  },
  { 
    value: 'medium', 
    label: 'Sedang', 
    icon: '🟡',
    description: 'Memerlukan sedikit pengalaman',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  },
  { 
    value: 'hard', 
    label: 'Sulit', 
    icon: '🔴',
    description: 'Untuk baker berpengalaman, teknik advanced',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }
] as const

export const MEASUREMENT_UNITS = [
  // Weight units
  { value: 'g', label: 'gram (g)', category: 'weight' },
  { value: 'kg', label: 'kilogram (kg)', category: 'weight' },
  { value: 'ons', label: 'ons', category: 'weight' },
  
  // Volume units
  { value: 'ml', label: 'mililiter (ml)', category: 'volume' },
  { value: 'l', label: 'liter (l)', category: 'volume' },
  { value: 'cc', label: 'cubic centimeter (cc)', category: 'volume' },
  
  // Count units
  { value: 'pcs', label: 'pieces (pcs)', category: 'count' },
  { value: 'buah', label: 'buah', category: 'count' },
  { value: 'biji', label: 'biji', category: 'count' },
  { value: 'lembar', label: 'lembar', category: 'count' },
  
  // Cooking measurements
  { value: 'tbsp', label: 'tablespoon (tbsp)', category: 'cooking' },
  { value: 'tsp', label: 'teaspoon (tsp)', category: 'cooking' },
  { value: 'sendok makan', label: 'sendok makan', category: 'cooking' },
  { value: 'sendok teh', label: 'sendok teh', category: 'cooking' },
  { value: 'cup', label: 'cup', category: 'cooking' },
  { value: 'gelas', label: 'gelas', category: 'cooking' },
  
  // Special units
  { value: 'sachet', label: 'sachet', category: 'special' },
  { value: 'pack', label: 'pack', category: 'special' },
  { value: 'botol', label: 'botol', category: 'special' },
  { value: 'kaleng', label: 'kaleng', category: 'special' }
] as const

// Indonesian F&B industry standard margins
export const MARGIN_PRESETS = {
  ECONOMY: { min: 35, max: 45, recommended: 40 },
  STANDARD: { min: 50, max: 70, recommended: 60 },
  PREMIUM: { min: 75, max: 100, recommended: 85 }
} as const

// Common overhead rates for Indonesian bakeries
export const OVERHEAD_RATES = {
  SMALL_BUSINESS: 0.15, // 15% for home-based or small bakeries
  MEDIUM_BUSINESS: 0.20, // 20% for established bakeries with storefront
  LARGE_BUSINESS: 0.25, // 25% for chain bakeries with multiple locations
  PREMIUM_BUSINESS: 0.30 // 30% for high-end artisan bakeries
} as const

// Labor cost estimates (per hour in IDR)
export const LABOR_COSTS = {
  JUNIOR_BAKER: 15000, // Rp 15k/hour - entry level
  SENIOR_BAKER: 25000, // Rp 25k/hour - experienced
  HEAD_BAKER: 35000, // Rp 35k/hour - lead baker/supervisor
  PASTRY_CHEF: 45000 // Rp 45k/hour - specialized pastry chef
} as const

// Recipe validation rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500
  },
  SERVINGS: {
    MIN: 1,
    MAX: 1000
  },
  TIME: {
    MIN: 0,
    MAX: 1440 // 24 hours in minutes
  },
  INGREDIENTS: {
    MIN_COUNT: 1,
    MAX_COUNT: 50
  },
  QUANTITY: {
    MIN: 0.01,
    MAX: 10000
  }
} as const

// Default recipe settings
export const DEFAULT_RECIPE = {
  servings: 8,
  prep_time: 30, // minutes
  cook_time: 30, // minutes
  difficulty: 'medium' as const,
  category: 'bread' as const,
  is_active: true,
  margin: 60, // 60% default margin
  overhead_rate: 0.15 // 15% default overhead
} as const

// HPP calculation constants
export const HPP_CONSTANTS = {
  MIN_PACKAGING_COST: 1000, // Minimum Rp 1k packaging cost
  PACKAGING_RATE: 0.05, // 5% of ingredient cost for packaging
  DEFAULT_MARGIN: 0.60, // 60% default target margin
  MIN_VIABLE_MARGIN: 0.25, // 25% minimum viable margin
  BREAK_EVEN_FIXED_COST: 10000 // Rp 10k fixed cost for break-even calculation
} as const

// Time formatting constants
export const TIME_FORMATS = {
  DISPLAY_HOURS_THRESHOLD: 60, // Show hours when >= 60 minutes
  ROUND_TO_NEAREST: 5 // Round time displays to nearest 5 minutes
} as const

// Price rounding rules (Indonesian Rupiah)
export const PRICE_ROUNDING = {
  ROUND_TO: 500, // Round to nearest Rp 500
  MIN_PRICE: 1000, // Minimum Rp 1k
  MAX_PRICE: 10000000 // Maximum Rp 10M
} as const