import type { RoutePreloadingPatterns } from './types'


/**
 * Route preloading patterns based on user behavior
 * Defines which routes and components should be preloaded for each page
 */
export const ROUTE_PRELOADING_PATTERNS: RoutePreloadingPatterns = {
  // Dashboard -> likely next routes
  '/dashboard': {
    immediate: ['/orders', '/cash-flow', '/ingredients'],
    onHover: ['/customers', '/recipes'],
    components: ['orders-table', 'financial-summary']
  },

  // Orders -> likely next routes
  '/orders': {
    immediate: ['/orders/new', '/customers'],
    onHover: ['/cash-flow', '/dashboard'],
    components: ['order-form', 'customer-detail'],
    modals: ['order-form', 'customer-form']
  },

  // Cash Flow -> likely next routes
  '/cash-flow': {
    immediate: ['/orders', '/dashboard'],
    onHover: ['/reports', '/operational-costs'],
    components: ['financial-charts', 'transaction-table'],
    modals: ['transaction-form']
  },

  // Ingredients -> likely next routes
  '/ingredients': {
    immediate: ['/recipes', '/orders'],
    onHover: ['/suppliers', '/hpp'],
    components: ['ingredients-table', 'recipe-calculator'],
    modals: ['ingredient-form', 'recipe-form']
  },

  // Customers -> likely next routes
  '/customers': {
    immediate: ['/orders', '/orders/new'],
    onHover: ['/cash-flow', '/dashboard'],
    components: ['customer-table', 'order-history'],
    modals: ['customer-form', 'order-form']
  },

  // Recipes -> likely next routes
  '/recipes': {
    immediate: ['/ingredients', '/hpp'],
    onHover: ['/orders', '/production'],
    components: ['recipe-table', 'cost-calculator'],
    modals: ['recipe-form', 'ingredient-detail']
  },

  // Settings -> likely next routes
  '/settings': {
    immediate: ['/dashboard'],
    onHover: [],
    components: ['settings-tabs'],
    modals: []
  }
}
