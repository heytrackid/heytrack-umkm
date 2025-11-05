

/**
 * Modules Index
 * Main entry point untuk semua domain modules
 */

// Domain Modules (only export modules that exist)
export * as OrdersModule from './orders'
export * as RecipesModule from './recipes'
export * as ProductionModule from './production'
export * as ReportsModule from './reports'

// Re-export shared helpers via shared index
export * from '@/shared'

// Type Re-exports (for convenience)
export type {
  // Orders Types  
  Order,
  OrderItem,
  Customer
} from './orders/types'

export type {
  // Recipes Types
  Recipe,
  RecipeIngredient
} from './recipes/types'

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
    description: 'Manajemen resep dan pricing'
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
export const getModuleConfig = (moduleName: keyof typeof MODULES_CONFIG) => MODULES_CONFIG[moduleName]

export const getAllModules = () => Object.entries(MODULES_CONFIG).map(([key, config]) => ({
    key,
    ...config
  }))