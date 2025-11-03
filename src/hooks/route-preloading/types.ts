
/**
 * Route Preloading Types
 * Type definitions for route preloading configurations and strategies
 */

// Route preloading patterns based on user behavior
export interface RouteConfig {
  immediate: string[]
  onHover: string[]
  components: string[]
  modals?: string[]
}

// Preloading priority levels
export const PreloadPriority = {
  IMMEDIATE: 'immediate',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const

export type PreloadPriority = typeof PreloadPriority[keyof typeof PreloadPriority]

// Route preloading patterns
export type RoutePreloadingPatterns = Record<string, RouteConfig>
