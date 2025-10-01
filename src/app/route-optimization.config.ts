/**
 * Route Optimization Configuration
 * Defines which routes should use dynamic loading
 */

export const HEAVY_ROUTES = [
  // Large form pages
  '/orders/new',
  '/inventory/new',
  
  // Complex data pages
  '/cash-flow',
  '/hpp',
  '/hpp-enhanced',
  '/reports',
  
  // Settings pages
  '/settings',
  '/settings/whatsapp-templates',
  
  // Feature-rich pages
  '/categories',
  '/customers',
  '/finance'
] as const

export const CLIENT_ONLY_ROUTES = [
  // Pages with heavy client-side features
  '/dashboard-optimized',
  '/inventory-enhanced',
  '/review'
] as const

export const SSR_DISABLED_ROUTES = [
  // Pages that don't benefit from SSR
  ...CLIENT_ONLY_ROUTES
] as const

export type HeavyRoute = typeof HEAVY_ROUTES[number]
export type ClientOnlyRoute = typeof CLIENT_ONLY_ROUTES[number]
