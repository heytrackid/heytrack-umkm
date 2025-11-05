
/**
 * Common loading keys untuk consistency across the application
 */
export const LOADING_KEYS = {
  // Dashboard
  DASHBOARD_STATS: 'dashboard_stats',
  RECENT_ORDERS: 'recent_orders',
  STOCK_ALERTS: 'stock_alerts',

  // Data Operations
  FETCH_ORDERS: 'fetch_orders',
  FETCH_CUSTOMERS: 'fetch_customers',
  FETCH_RECIPES: 'fetch_recipes',
  FETCH_INVENTORY: 'fetch_inventory',

  // Form Operations
  SAVE_RECIPE: 'save_recipe',
  SAVE_ORDER: 'save_order',
  SAVE_CUSTOMER: 'save_customer',

  // Delete Operations
  DELETE_RECIPE: 'delete_recipe',
  DELETE_ORDER: 'delete_order',
  DELETE_CUSTOMER: 'delete_customer',



  // HPP Calculations
  CALCULATE_HPP: 'calculate_hpp',

  // Search Operations
  SEARCH: 'search',
} as const

export type LoadingKey = typeof LOADING_KEYS[keyof typeof LOADING_KEYS]
