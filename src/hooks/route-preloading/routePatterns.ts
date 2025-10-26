import type { RoutePreloadingPatterns } from './types'

/**
 * Route preloading patterns based on user behavior
 * Defines which routes and components should be preloaded for each page
 */
export const ROUTE_PRELOADING_PATTERNS: RoutePreloadingPatterns = {
  // Dashboard -> likely next routes
  '/dashboard': {
    immediate: ['/orders', '/finance', '/inventory'],
    onHover: ['/customers', '/ingredients'],
    components: ['orders-table', 'financial-summary']
  },

  // Orders -> likely next routes
  '/orders': {
    immediate: ['/orders/new', '/customers'],
    onHover: ['/finance', '/dashboard'],
    components: ['order-form', 'customer-detail'],
    modals: ['order-form', 'customer-form']
  },

  // Finance -> likely next routes
  '/finance': {
    immediate: ['/orders', '/dashboard'],
    onHover: ['/reports', '/operational-costs'],
    components: ['financial-charts', 'transaction-table'],
    modals: ['finance-form']
  },

  // Inventory/Ingredients -> likely next routes
  '/inventory': {
    immediate: ['/ingredients', '/orders'],
    onHover: ['/suppliers', '/recipes'],
    components: ['inventory-table', 'ingredient-form'],
    modals: ['ingredient-form', 'inventory-detail']
  },

  '/ingredients': {
    immediate: ['/inventory', '/recipes'],
    onHover: ['/orders', '/suppliers'],
    components: ['ingredients-table', 'recipe-calculator'],
    modals: ['ingredient-form', 'recipe-form']
  },

  // Customers -> likely next routes
  '/customers': {
    immediate: ['/orders', '/orders/new'],
    onHover: ['/finance', '/dashboard'],
    components: ['customer-table', 'order-history'],
    modals: ['customer-form', 'order-form']
  },

  // Recipes -> likely next routes
  '/resep': {
    immediate: ['/ingredients', '/hpp'],
    onHover: ['/orders', '/production'],
    components: ['recipe-table', 'cost-calculator'],
    modals: ['recipe-form', 'ingredient-detail']
  },

  // Settings -> likely next routes
  '/settings': {
    immediate: ['/dashboard'],
    onHover: ['/settings/whatsapp-templates'],
    components: ['settings-tabs'],
    modals: ['whatsapp-templates']
  }
}
