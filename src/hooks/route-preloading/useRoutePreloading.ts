'use client'
import * as React from 'react'

import { apiLogger } from '@/lib/logger'
import {
  globalLazyLoadingUtils,
  preloadChartBundle,
  preloadModalComponent
} from '@/components/lazy/index'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

import { ROUTE_PRELOADING_PATTERNS } from './routePatterns'
import { PreloadPriority } from './types'

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
    const config = ROUTE_PRELOADING_PATTERNS[currentRoute as keyof typeof ROUTE_PRELOADING_PATTERNS]

    if (!config) {return}

    const startTime = performance.now()
    const preloadPromises: Promise<unknown>[] = []

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
              preloadModalComponent(modal as any).catch(() => {})
            })
          }
          break

        case PreloadPriority.HIGH:
          // Preload likely next routes
          if (config.immediate) {
            config.immediate.forEach(route => {
              // Preload the route component (prefetch is sync, wrapping in Promise)
              router.prefetch(route)
            })
          }
          break

        case PreloadPriority.MEDIUM:
          // Preload hover targets
          if (config.onHover) {
            config.onHover.forEach(route => {
              // Preload the route component (prefetch is sync)
              router.prefetch(route)
            })
          }
          break
      }

      await Promise.all(preloadPromises)

      const endTime = performance.now()
      if (preloadPromises.length > 0) {
        apiLogger.info(`✅ Preloaded ${priority} resources for ${currentRoute} in ${(endTime - startTime).toFixed(2)}ms`)
      }

    } catch (error: unknown) {
      console.warn(`⚠️ Failed to preload resources for ${currentRoute}`, error)
    }
  }, [pathname, router])

  // Preload on route change
  useEffect(() => {
    // Immediate preloading
    preloadForCurrentRoute(PreloadPriority.IMMEDIATE)

    // High priority preloading after a short delay
    const highPriorityTimer = setTimeout(() => {
      preloadForCurrentRoute(PreloadPriority.HIGH)
    }, 100)

    // Medium priority preloading after longer delay
    const mediumPriorityTimer = setTimeout(() => {
      preloadForCurrentRoute(PreloadPriority.MEDIUM)
    }, 500)

    return () => {
      clearTimeout(highPriorityTimer)
      clearTimeout(mediumPriorityTimer)
    }
  }, [pathname, preloadForCurrentRoute])

  // Manual preload function for user interactions
  const preloadRoute = useCallback((targetRoute: string) => {
    const config = ROUTE_PRELOADING_PATTERNS[targetRoute]
    if (config?.components) {
      globalLazyLoadingUtils.preloadForRoute(targetRoute as any).catch(() => {})
    }
    router.prefetch(targetRoute)
  }, [router])

  return {
    preloadRoute,
    preloadForCurrentRoute,
    currentRoute: pathname
  }
}
