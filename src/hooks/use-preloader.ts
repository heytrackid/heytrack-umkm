import { useCallback } from 'react'

import { RoutePreloader } from '@/lib/bundle-splitting'
import { createClientLogger } from '@/lib/client-logger'

/**
 * Hook for preloading routes on user interaction
 */
export function useRoutePreloader() {
  const preloadRoute = useCallback((route: string) => {
    RoutePreloader.preloadRoute(route)
  }, [])

  const preloadOnHover = useCallback((route: string, delay = 100) =>
    RoutePreloader.preloadOnHover(route, delay), [])

  return { preloadRoute, preloadOnHover }
}

/**
 * Hook for preloading components on visibility
 */
export function useComponentPreloader() {
  const logger = createClientLogger('ComponentPreloader')

  const preloadComponent = useCallback((_componentId: string, importFunc: () => Promise<unknown>) =>
    importFunc().catch(() => {
      logger.warn({ componentId: _componentId }, 'Failed to preload component')
    }), [logger])

  return { preloadComponent }
}