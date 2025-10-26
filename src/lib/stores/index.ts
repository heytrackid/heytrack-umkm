// Composite Data Store - Backward Compatibility Layer
// Combines all domain-specific stores for existing code

import { useIngredientsStore } from './ingredients-store'
import { useRecipesStore } from './recipes-store'
import { useOrdersStore } from './orders-store'
import { useCustomersStore } from './customers-store'
import { useExpensesStore } from './expenses-store'
import { useReportsStore } from './reports-store'

/**
 * Composite Data Store Hook
 * Provides access to all domain stores through a single interface
 * Maintains backward compatibility with existing code that expects a monolithic store
 */
export const useCompositeDataStore = () => {
  // Domain-specific stores
  const ingredients = useIngredientsStore()
  const recipes = useRecipesStore()
  const orders = useOrdersStore()
  const customers = useCustomersStore()
  const expenses = useExpensesStore()
  const reports = useReportsStore()

  return {
    // Ingredients
    ingredients: ingredients.ingredients,
    updateIngredient: ingredients.updateIngredient,
    addIngredient: ingredients.addIngredient,
    removeIngredient: ingredients.removeIngredient,

    // Recipes
    recipes: recipes.recipes,
    updateRecipe: recipes.updateRecipe,
    addRecipe: recipes.addRecipe,
    removeRecipe: recipes.removeRecipe,
    getAvailableRecipes: recipes.getAvailableRecipes,
    checkRecipeAvailability: recipes.checkRecipeAvailability,

    // Orders
    orders: orders.orders,
    updateOrder: orders.updateOrder,
    addOrder: orders.addOrder,
    removeOrder: orders.removeOrder,
    getPendingOrders: orders.getPendingOrders,
    getOrdersByStatus: orders.getOrdersByStatus,
    calculateTotalRevenue: orders.calculateTotalRevenue,

    // Customers
    customers: customers.customers,
    updateCustomer: customers.updateCustomer,
    addCustomer: customers.addCustomer,
    removeCustomer: customers.removeCustomer,
    findCustomerByPhone: customers.findCustomerByPhone,
    getTopCustomers: customers.getTopCustomers,

    // Expenses
    expenses: expenses.expenses,
    updateExpense: expenses.updateExpense,
    addExpense: expenses.addExpense,
    removeExpense: expenses.removeExpense,
    getExpensesByCategory: expenses.getExpensesByCategory,
    getTotalExpenses: expenses.getTotalExpenses,
    getExpenseCategories: expenses.getExpenseCategories,

    // Reports
    currentReport: reports.currentReport,
    reportHistory: reports.reportHistory,
    generateReport: reports.generateReport,
    updateReport: reports.updateReport,
    getReportByPeriod: reports.getReportByPeriod,
    getLatestReport: reports.getLatestReport,
    calculateProfitMargin: reports.calculateProfitMargin,

    // Sync state (aggregated)
    lastSyncTime: Math.max(
      ingredients.lastSyncTime.getTime(),
      recipes.lastSyncTime.getTime(),
      orders.lastSyncTime.getTime(),
      customers.lastSyncTime.getTime(),
      expenses.lastSyncTime.getTime(),
      reports.lastSyncTime.getTime()
    ),

    isOnline: ingredients.isOnline && recipes.isOnline && orders.isOnline &&
              customers.isOnline && expenses.isOnline && reports.isOnline,

    // Cross-store sync
    syncAllStores: async () => {
      await Promise.all([
        ingredients.syncCrossPlatform(),
        recipes.syncCrossPlatform(),
        orders.syncCrossPlatform(),
        customers.syncCrossPlatform(),
        expenses.syncCrossPlatform(),
        reports.syncCrossPlatform()
      ])
    }
  }
}

// Sync Manager for cross-store communication
export class SyncManager {
  private static instance: SyncManager

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager()
    }
    return SyncManager.instance
  }

  async syncAllData(): Promise<void> {
    const compositeStore = useCompositeDataStore()
    await compositeStore.syncAllStores()
  }

  getStoreStatus() {
    const compositeStore = useCompositeDataStore()
    return {
      lastSyncTime: new Date(compositeStore.lastSyncTime),
      isOnline: compositeStore.isOnline
    }
  }
}

export const syncManager = SyncManager.getInstance()
