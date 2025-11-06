import { useCallback } from 'react'
import { RoutePreloader } from '@/lib/bundle-splitting'

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
  const preloadComponent = useCallback((_componentId: string, importFunc: () => Promise<unknown>) =>
    importFunc().catch(() => {
      // Silently handle preload failures
    }), [])

  return { preloadComponent }
}