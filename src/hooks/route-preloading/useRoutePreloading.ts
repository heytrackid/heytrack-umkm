'use client'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')
import { usePathname, useRouter } from 'next/navigation' 
import { useCallback, useEffect } from 'react'
import { ROUTE_PRELOADING_PATTERNS } from './routePatterns'
import { PreloadPriority } from './types'
import { 
  globalLazyLoadingUtils,
  preloadChartBundle,
  preloadModalComponent
} from '@/components/lazy/index'


/**
 * Route-based preloading hook
 * Preloads components and routes based on current route patterns
 */
export const useRoutePreloading = () => {
  const pathname = usePathname()
  const router = useRouter()

  // Preload components based on current route
  const preloadForCurrentRoute = useCallback(async (priority: PreloadPriority = PreloadPriority.IMMEDIATE) => {
    const currentRoute = pathname
    const config = ROUTE_PRELOADING_PATTERNS[currentRoute]

    if (!config) {return}

    const startTime = performance.now()
    const preloadPromises: Array<Promise<unknown>> = []

    try {
      // Preload based on priority
      switch (priority) {
        case PreloadPriority.IMMEDIATE:
          // Preload essential components immediately
          if (config.components) {
            config.components.forEach(component => {
              if (component.includes('chart')) {
                preloadChartBundle().catch(() => {})
              }
            })
          }

          // Preload critical modals
          if (config.modals) {
            config.modals.forEach(modal => {
              preloadModalComponent(modal as Parameters<typeof preloadModalComponent>[0]).catch(() => {})
            })
          }
          break

        case PreloadPriority.HIGH:
          // Preload likely next routes
          if (config.immediate) {
            config.immediate.forEach(route => {
              // Preload the route component (prefetch is sync, wrapping in Promise)
              void router.prefetch(route)
            })
          }
          break

        case PreloadPriority.MEDIUM:
          // Preload hover targets
          if (config.onHover) {
            config.onHover.forEach(route => {
              // Preload the route component (prefetch is sync)
              void router.prefetch(route)
            })
          }
          break
      }

      await Promise.all(preloadPromises)

      const endTime = performance.now()
      if (preloadPromises.length > 0) {
        logger.info({ priority, currentRoute, duration: (endTime - startTime).toFixed(2) }, 'Preloaded resources')
      }

    } catch (_err: unknown) {
      // Failed to preload resources
    }
  }, [pathname, router])

  // Preload on route change
  useEffect(() => {
    // Immediate preloading
    void preloadForCurrentRoute(PreloadPriority.IMMEDIATE)

    // High priority preloading after a short delay
    const highPriorityTimer = setTimeout(() => {
      void preloadForCurrentRoute(PreloadPriority.HIGH)
    }, 100)

    // Medium priority preloading after longer delay
    const mediumPriorityTimer = setTimeout(() => {
      void preloadForCurrentRoute(PreloadPriority.MEDIUM)
    }, 500)

    return () => {
      clearTimeout(highPriorityTimer)
      clearTimeout(mediumPriorityTimer)
    }
  }, [pathname, preloadForCurrentRoute])

  // Manual preload function for user interactions
  const preloadRoute = useCallback((targetRoute: string) => {
    const validRoutes = ['inventory', 'customers', 'recipes', 'orders', 'finance', 'dashboard', 'settings'] as const
    type ValidRoute = typeof validRoutes[number]
    
    const config = ROUTE_PRELOADING_PATTERNS[targetRoute]
    if (config?.components && validRoutes.includes(targetRoute as ValidRoute)) {
      globalLazyLoadingUtils.preloadForRoute(targetRoute as ValidRoute).catch(() => {})
    }
    void router.prefetch(targetRoute)
  }, [router])

  return {
    preloadRoute,
    preloadForCurrentRoute,
    currentRoute: pathname
  }
}
