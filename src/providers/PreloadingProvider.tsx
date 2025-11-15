'use client'

import { usePathname } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { useSimplePreload } from '@/hooks/usePreloading'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('PreloadingProvider')

interface PreloadingMetrics {
  currentRoute: string
  preloadedRoutesCount: number
  preloadedComponentsCount: number
  preloadedRoutes: string[]
  preloadedComponents: string[]
  lazyLoadingMetrics?: {
    averageLoadTime?: number
  }
}

interface PreloadingContextType {
  isPreloading: boolean
  preloadedRoutes: Set<string>
  preloadedComponents: Set<string>
  preloadRoute: (route: string) => Promise<void>
  getMetrics: () => PreloadingMetrics
}

const PreloadingContext = createContext<PreloadingContextType | null>(null)

export const usePreloading = (): PreloadingContextType => {
  const context = useContext(PreloadingContext)
  if (!context) {
    throw new Error('usePreloading must be used within PreloadingProvider')
  }
  return context
}

// Debug panel component
const PreloadingDebugPanel = (): JSX.Element => {
  const { getMetrics, isPreloading } = usePreloading()
  const [showDebug, setShowDebug] = useState(false)
  const [metrics, setMetrics] = useState<PreloadingMetrics | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (showDebug) {
        setMetrics(getMetrics())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [showDebug, getMetrics])

  // Toggle debug panel with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setShowDebug(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-black text-white px-2 py-1 rounded text-xs"
          title="Tekan Ctrl+Shift+P untuk beralih"
        >
          {isPreloading ? '🔄' : '📊'} Debug
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50 ">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Preloading Debug</h3>
        <button onClick={() => setShowDebug(false)}>✕</button>
      </div>

      {metrics && (
        <div className="space-y-2">
          <div>
            <strong>Current:</strong> {(metrics).currentRoute}
          </div>
          <div>
            <strong>Preloaded Routes:</strong> {(metrics).preloadedRoutesCount}
          </div>
          <div>
            <strong>Preloaded Components:</strong> {(metrics).preloadedComponentsCount}
          </div>

          {metrics.lazyLoadingMetrics && (
            <div>
              <strong>Avg Load Time:</strong> {metrics.lazyLoadingMetrics.averageLoadTime?.toFixed(2) ?? 0}ms
            </div>
          )}

          {isPreloading && (
            <div className="text-yellow-400">
              🔄 Preloading in progress...
            </div>
          )}

          <details className="mt-2">
            <summary className="cursor-pointer">Routes</summary>
            <div className="mt-1 text-gray-300">
              {metrics.preloadedRoutes.map((route: string) => (
                <div key={route}>• {route}</div>
              ))}
            </div>
          </details>

          <details className="mt-2">
            <summary className="cursor-pointer">Components</summary>
            <div className="mt-1 text-gray-300">
              {metrics.preloadedComponents.slice(-5).map((comp: string) => (
                <div key={comp}>• {comp}</div>
              ))}
            </div>
          </details>
        </div>
      )}

      <div className="mt-2 text-muted-foreground text-xs">
        Ctrl+Shift+P to toggle
      </div>
    </div>
  )
}

interface PreloadingProviderProps {
  children: ReactNode
  enableSmartPreloading?: boolean
  enableIdlePreloading?: boolean
  enableNetworkAware?: boolean
  debug?: boolean
}

export const PreloadingProvider = ({
  children,
  enableSmartPreloading: _enableSmartPreloading = true,
  enableIdlePreloading: _enableIdlePreloading = true,
  enableNetworkAware: _enableNetworkAware = true,
  debug = false
}: PreloadingProviderProps): JSX.Element => {
  const pathname = usePathname()
  const { preloadRoute: hookPreloadRoute } = useSimplePreload()

  const [isPreloading, setIsPreloading] = useState(false)
  const [preloadedRoutes, setPreloadedRoutes] = useState(new Set<string>())
  const [_preloadedComponents, _setPreloadedComponents] = useState(new Set<string>())

  // Hooks must be called unconditionally
  // const smartPreloading = useSmartPreloading()
  // const idlePreloading = useIdleTimePreloading()
  // const networkAwarePreloading = useNetworkAwarePreloading()

  // Use hooks only if enabled (effects inside hooks should check enablement)
  // Note: We call hooks unconditionally but they can decide to do nothing based on props
  // useEffect(() => {
  //   if (enableSmartPreloading && smartPreloading) {
  //     // Smart preloading logic would be here if needed
  //     // Currently hooks are called but logic is handled internally
  //   }
  // }, [enableSmartPreloading, smartPreloading])

  // useEffect(() => {
  //   if (enableIdlePreloading && idlePreloading) {
  //     // Idle preloading logic would be here if needed
  //     // Currently hooks are called but logic is handled internally
  //   }
  // }, [enableIdlePreloading, idlePreloading])

  // useEffect(() => {
  //   if (enableNetworkAware && networkAwarePreloading) {
  //     // Network aware logic would be here if needed
  //     // Currently hooks are called but logic is handled internally
  //   }
  // }, [enableNetworkAware, networkAwarePreloading])

  // Track preloaded routes
  const preloadRoute = useCallback(async (route: string): Promise<void> => {
    if (preloadedRoutes.has(route)) {
      if (debug) { logger.info(`🔄 Route ${route} already preloaded`) }
      return
    }

    setIsPreloading(true)
    const startTime = performance.now()

    try {
      await hookPreloadRoute(route)
      setPreloadedRoutes(prev => new Set([...prev, route]))

      const endTime = performance.now()
      if (debug) {
        logger.info(`✅ Preloaded route ${route} in ${(endTime - startTime).toFixed(2)}ms`)
      }
    } catch (error) {
      if (debug) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        logger.warn(`❌ Failed to preload route ${route}: ${errorMsg}`)
      }
    } finally {
      setIsPreloading(false)
    }
  }, [debug, hookPreloadRoute, preloadedRoutes])

  // Debug logging
  useEffect(() => {
    if (debug) {
      logger.info(`🛣️ Route changed to: ${pathname}`)
      logger.info(`📊 Preloaded routes: ${preloadedRoutes.size}`)
      logger.info(`🧩 Preloaded components: ${_preloadedComponents.size}`)
    }
  }, [pathname, preloadedRoutes.size, _preloadedComponents.size, debug])

  // Performance monitoring
  const getMetrics = useCallback((): PreloadingMetrics => ({
    currentRoute: pathname,
    preloadedRoutesCount: preloadedRoutes.size,
    preloadedComponentsCount: _preloadedComponents.size,
    preloadedRoutes: Array.from(preloadedRoutes),
    preloadedComponents: Array.from(_preloadedComponents)
  }), [pathname, preloadedRoutes, _preloadedComponents])

  // Context value
  const value: PreloadingContextType = useMemo(() => ({
    isPreloading,
    preloadedRoutes,
    preloadedComponents: _preloadedComponents,
    preloadRoute,
    getMetrics
  }), [isPreloading, preloadedRoutes, _preloadedComponents, preloadRoute, getMetrics])

  return (
    <PreloadingContext.Provider value={value}>
      {children}
      {debug && <PreloadingDebugPanel />}
    </PreloadingContext.Provider>
  )
}



// Hook to preload specific page resources
export const usePagePreloading = (pageType: 'customers' | 'dashboard' | 'finance' | 'inventory' | 'orders'): void => {
  const { preloadRoute } = usePreloading()

  useEffect(() => {
    const preloadTargets: Record<string, string[]> = {
      dashboard: ['/orders', '/finance', '/inventory'],
      orders: ['/orders/new', '/customers', '/finance'],
      finance: ['/orders', '/dashboard', '/reports'],
      inventory: ['/ingredients', '/orders', '/recipes'],
      customers: ['/orders', '/orders/new', '/finance']
    }

    const targets = preloadTargets[pageType] || []

    // Preload with staggered timing
    targets.forEach((route, index: number) => {
      setTimeout(() => {
        void preloadRoute(route)
      }, index * 200) // 200ms delay between each preload
    })
  }, [pageType, preloadRoute])
}

// Performance monitoring hook
export const usePreloadingAnalytics = (): void => {
  const { getMetrics } = usePreloading()

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    let interval: NodeJS.Timeout | null = null

    const tick = (): void => {
      const metrics = getMetrics()

      if (metrics.preloadedRoutesCount > 0 || metrics.preloadedComponentsCount > 0) {
        logger.info({
          params: {
            route: metrics.currentRoute,
            preloadedRoutes: metrics.preloadedRoutesCount,
            preloadedComponents: metrics.preloadedComponentsCount,
            timestamp: new Date().toISOString()
          }
        }, '📊 Preloading Analytics:')
      }
    }

    const start = (): void => {
      if (interval || document.hidden) {
        return
      }
      tick()
      interval = setInterval(tick, 30000)
    }

    const stop = (): void => {
      if (!interval) {
        return
      }
      clearInterval(interval)
      interval = null
    }

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        stop()
      } else {
        start()
      }
    }

    start()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Send analytics every 30 seconds if there's activity
    return (): void => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [getMetrics])
}
