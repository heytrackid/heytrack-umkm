/**
 * Modules Index
 * Main entry point untuk semua domain modules
 */

// Domain Modules
export * as InventoryModule from './inventory'
export * as OrdersModule from './orders'
export * as RecipesModule from './recipes'
export * as FinanceModule from './finance'
export * as ProductionModule from './production'
export * as ReportsModule from './reports'

// Shared Modules
export * as SharedComponents from '../shared/components'
export * as SharedHooks from '../shared/hooks'
export * as SharedUtils from '../shared/utils'
export * as SharedApi from '../shared/api'

// Type Re-exports (for convenience)
export type {
  // Inventory Types
  Ingredient,
  StockTransaction,
  InventoryStats
} from './inventory/types'

export type {
  // Orders Types  
  Order,
  OrderItem,
  Customer
} from './orders/types'

export type {
  // Recipes Types
  Recipe,
  RecipeIngredient,
  HPPCalculation
} from './recipes/types'

export type {
  // Finance Types
  Expense,
  FinancialRecord,
  BudgetItem
} from './finance/types'

// Module Configuration
export const MODULES_CONFIG = {
  inventory: {
    name: 'Inventory',
    path: '/inventory',
    icon: 'Package',
    description: 'Manajemen stok dan bahan baku'
  },
  orders: {
    name: 'Orders', 
    path: '/orders',
    icon: 'ShoppingCart',
    description: 'Manajemen pesanan dan customer'
  },
  recipes: {
    name: 'Recipes',
    path: '/recipes', 
    icon: 'ChefHat',
    description: 'Manajemen resep dan HPP'
  },
  finance: {
    name: 'Finance',
    path: '/finance',
    icon: 'DollarSign', 
    description: 'Manajemen keuangan dan expenses'
  },
  production: {
    name: 'Production',
    path: '/production',
    icon: 'Factory',
    description: 'Perencanaan dan tracking produksi'
  },
  reports: {
    name: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    description: 'Analytics dan reporting'
  }
} as const

// Module utilities
export const getModuleConfig = (moduleName: keyof typeof MODULES_CONFIG) => {
  return MODULES_CONFIG[moduleName]
}

export const getAllModules = () => {
  return Object.entries(MODULES_CONFIG).map(([key, config]) => ({
    key,
    ...config
  }))
}