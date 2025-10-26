/**
 * Route Preloading Types
 * Type definitions for route preloading configurations and strategies
 */

// Route preloading patterns based on user behavior
export type RouteConfig = {
  immediate: string[]
  onHover: string[]
  components: string[]
  modals?: string[]
}

// Preloading priority levels
export enum PreloadPriority {
  IMMEDIATE = 'immediate',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Route preloading patterns
export type RoutePreloadingPatterns = Record<string, RouteConfig>
