'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { apiLogger } from '@/lib/logger'
import {
  useSmartPreloading,
  useIdleTimePreloading,
  useNetworkAwarePreloading
} from '@/hooks/route-preloading'
import { useRoutePreloading } from '@/hooks/useRoutePreloading'

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

export const usePreloading = () => {
  const context = useContext(PreloadingContext)
  if (!context) {
    throw new Error('usePreloading must be used within PreloadingProvider')
  }
  return context
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
  enableSmartPreloading = true,
  enableIdlePreloading = true,
  enableNetworkAware = true,
  debug = false
}: PreloadingProviderProps) => {
  const pathname = usePathname()
  const { preloadRoute: hookPreloadRoute } = useRoutePreloading()

  const [isPreloading, setIsPreloading] = useState(false)
  const [preloadedRoutes, setPreloadedRoutes] = useState(new Set<string>())
  const [_preloadedComponents, _setPreloadedComponents] = useState(new Set<string>())

  // Enable smart preloading based on user patterns
  if (enableSmartPreloading) {
    useSmartPreloading()
  }

  // Enable idle time preloading
  if (enableIdlePreloading) {
    useIdleTimePreloading()
  }

  // Enable network-aware preloading
  if (enableNetworkAware) {
    useNetworkAwarePreloading()
  }

  // Track preloaded routes
  const preloadRoute = async (route: string) => {
    if (preloadedRoutes.has(route)) {
      if (debug) { apiLogger.info(`🔄 Route ${route} already preloaded`) }
      return
    }

    void setIsPreloading(true)
    const startTime = performance.now()

    try {
      await hookPreloadRoute(route)
      setPreloadedRoutes(prev => new Set([...prev, route]))

      const endTime = performance.now()
      if (debug) {
        apiLogger.info(`✅ Preloaded route ${route} in ${(endTime - startTime).toFixed(2)}ms`)
      }
    } catch (err: unknown) {
      if (debug) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        apiLogger.warn(`❌ Failed to preload route ${route}: ${errorMsg}`)
      }
    } finally {
      void setIsPreloading(false)
    }
  }

  // Debug logging
  useEffect(() => {
    if (debug) {
      apiLogger.info(`🛣️ Route changed to: ${pathname}`)
      apiLogger.info(`📊 Preloaded routes: ${preloadedRoutes.size}`)
      apiLogger.info(`🧩 Preloaded components: ${preloadedComponents.size}`)
    }
  }, [pathname, preloadedRoutes.size, preloadedComponents.size, debug])

  // Performance monitoring
  const getMetrics = (): PreloadingMetrics => ({
    currentRoute: pathname,
    preloadedRoutesCount: preloadedRoutes.size,
    preloadedComponentsCount: preloadedComponents.size,
    preloadedRoutes: Array.from(preloadedRoutes),
    preloadedComponents: Array.from(preloadedComponents)
  })

  // Context value
  const value: PreloadingContextType = {
    isPreloading,
    preloadedRoutes,
    preloadedComponents,
    preloadRoute,
    getMetrics
  }

  return (
    <PreloadingContext.Provider value={value}>
      {children}
      {debug && <PreloadingDebugPanel />}
    </PreloadingContext.Provider>
  )
}

// Debug panel component
const PreloadingDebugPanel = () => {
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
        void setShowDebug(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-black text-white px-2 py-1 rounded text-xs"
          title="Press Ctrl+Shift+P to toggle"
        >
          {isPreloading ? '🔄' : '📊'} Debug
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50 shadow-lg">
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
              <strong>Avg Load Time:</strong> {metrics.lazyLoadingMetrics.averageLoadTime?.toFixed(2) || 0}ms
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

      <div className="mt-2 text-gray-400 text-xs">
        Ctrl+Shift+P to toggle
      </div>
    </div>
  )
}

// Hook to preload specific page resources
export const usePagePreloading = (pageType: 'dashboard' | 'orders' | 'finance' | 'inventory' | 'customers') => {
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
export const usePreloadingAnalytics = () => {
  const { getMetrics } = usePreloading()

  useEffect(() => {
    // Send analytics every 30 seconds if there's activity
    const interval = setInterval(() => {
      const metrics = getMetrics()

      if (metrics.preloadedRoutesCount > 0 || metrics.preloadedComponentsCount > 0) {
        // Here you could send metrics to your analytics service
        apiLogger.info({
          params: {
            route: metrics.currentRoute,
            preloadedRoutes: metrics.preloadedRoutesCount,
            preloadedComponents: metrics.preloadedComponentsCount,
            timestamp: new Date().toISOString()
          }
        }, '📊 Preloading Analytics:')
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [getMetrics])
}
