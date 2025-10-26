/**
 * HPP Automation Module Types
 * Centralized type definitions for HPP automation functionality
 */

export interface HPPComponent {
  id: string
  name: string
  type: 'ingredient' | 'labor' | 'overhead' | 'packaging' | 'utility'
  cost: number
  unit: string
  lastUpdated: string
}

// Recipe ingredient with pricing info
export interface RecipeIngredient {
  ingredientId: string
  name: string
  quantity: number
  unit: string
  pricePerUnit?: number
}

// Packaging item for cost calculation
export interface PackagingItem {
  name: string
  quantity: number
  unit: string
  costPerUnit: number
}

// Recipe data structure for HPP calculation
export interface RecipeData {
  id: string
  name: string
  servings: number
  prepTime: number
  cookTime: number
  estimatedDuration: number
  ingredients: RecipeIngredient[]
  packaging?: PackagingItem[]
}

// Recipe with basic info for affected recipes list
export interface RecipeBasicInfo {
  id: string
  name: string
}

// HPP recalculation result
export interface HPPRecalculationResult {
  recipeId: string
  recipeName: string
  oldHPP: number
  newHPP: number
  change: number
  changePercentage: number
  impactLevel: 'low' | 'medium' | 'high'
}

export interface RecipeHPP {
  id: string
  recipeName: string
  recipeId: string
  servings: number
  components: {
    ingredients: Array<{
      ingredientId: string
      ingredientName: string
      quantity: number
      unit: string
      pricePerUnit: number
      totalCost: number
    }>
    labor: {
      prepTime: number // minutes
      cookTime: number // minutes
      hourlyRate: number
      totalLaborCost: number
    }
    overhead: {
      electricity: number
      gas: number
      rent: number // allocated per batch
      depreciation: number
      other: number
      totalOverheadCost: number
    }
    packaging: Array<{
      itemName: string
      quantity: number
      unit: string
      costPerUnit: number
      totalCost: number
    }>
  }
  totalDirectCost: number
  totalIndirectCost: number
  totalHPP: number
  hppPerServing: number
  suggestedSellingPrice: Array<{
    tier: 'economy' | 'standard' | 'premium'
    price: number
    margin: number
  }>
  lastCalculated: string
  needsRecalculation: boolean
}

export interface OperationalCost {
  id: string
  category: 'labor' | 'overhead' | 'utility' | 'rent' | 'depreciation'
  name: string
  amount: number
  period: 'hourly' | 'daily' | 'monthly' | 'per_batch'
  isActive: boolean
  lastUpdated: string
  autoAllocate: boolean // Otomatis alokasi ke semua resep
}

export interface IngredientCostResult {
  items: Array<{
    ingredientId: string
    ingredientName: string
    quantity: number
    unit: string
    pricePerUnit: number
    totalCost: number
  }>
  total: number
}

export interface PackagingCostResult {
  items: Array<{
    itemName: string
    quantity: number
    unit: string
    costPerUnit: number
    totalCost: number
  }>
  total: number
}

export interface LaborCostResult {
  prepTime: number
  cookTime: number
  hourlyRate: number
  totalLaborCost: number
}

export interface OverheadCostResult {
  electricity: number
  gas: number
  rent: number
  depreciation: number
  other: number
  totalOverheadCost: number
}

export interface PriceHistoryEntry {
  date: string
  price: number
}

export interface PriceMonitoringResult {
  monitoredIngredients: number
  significantChanges: Array<{
    ingredientId: string
    ingredientName: string
    oldPrice: number
    newPrice: number
    changePercent: number
  }>
  lastCheck: string
}
