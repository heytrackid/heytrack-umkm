import { lazy, type ComponentType } from 'react'
import { uiLogger } from '@/lib/logger'

/**
 * Bundle Splitting Utilities
 * Advanced code splitting and preloading strategies
 */

// Lazy load with error boundary
export function lazyLoad<T extends ComponentType<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  importFunc: () => Promise<{ default: T }>
) {
  return lazy(() =>
     importFunc().catch((error) => {
       uiLogger.error('Failed to load component:', error)
       throw error
     })
  )
}



// Route-based preloading
export class RoutePreloader {
  private static preloadedRoutes = new Set<string>()

  static preloadRoute(route: string) {
    if (this.preloadedRoutes.has(route)) {
      return
    }

    switch (route) {
      case '/dashboard':
        import('@/app/dashboard/page').catch(() => {
          // Silently handle preload failures
        })
        break
      case '/orders':
        import('@/app/orders/page').catch(() => {
          // Silently handle preload failures
        })
        break
      case '/reports':
        import('@/app/reports/page').catch(() => {
          // Silently handle preload failures
        })
        break
      case '/settings':
        import('@/app/settings/page').catch(() => {
          // Silently handle preload failures
        })
        break
      default:
        break
    }

    this.preloadedRoutes.add(route)
  }

  static preloadOnHover(route: string, delay = 100) {
    let timeoutId: NodeJS.Timeout

    const preload = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => this.preloadRoute(route), delay)
    }

    const cancel = () => {
      clearTimeout(timeoutId)
    }

    return { preload, cancel }
  }
}

// Component preloading based on user interaction
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>()

  static preloadComponent(componentId: string, importFunc: () => Promise<unknown>) {
    if (this.preloadedComponents.has(componentId)) {
      return
    }

    importFunc().catch(() => {
      // Silently handle preload failures
    })
    this.preloadedComponents.add(componentId)
  }

  static preloadOnVisible(
    componentId: string,
    importFunc: () => Promise<unknown>,
    options: IntersectionObserverInit = {}
  ) {
    if (typeof window === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.preloadComponent(componentId, importFunc)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1, ...options }
    )

    return observer
  }
}

// Bundle size monitoring
export class BundleMonitor {
  static logBundleInfo() {
    if (typeof window === 'undefined') {
      return
    }

    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource')
      const scripts = resources.filter(r => r.name.endsWith('.js'))

      uiLogger.info('📦 Bundle Analysis started')
      scripts.forEach(script => {
        uiLogger.info(`${script.name}: ${(script as PerformanceResourceTiming).transferSize / 1024}KB`)
      })
      uiLogger.info('📦 Bundle Analysis completed')
    }
  }

  static getBundleStats() {
    if (typeof window === 'undefined') {
      return null
    }

    const resources = performance.getEntriesByType('resource')
    const scripts = resources.filter(r => r.name.includes('.js') && !r.name.includes('webpack'))

    return scripts.map(script => ({
      name: script.name.split('/').pop(),
      size: (script as PerformanceResourceTiming).transferSize || 0,
      loadTime: script.responseEnd - script.requestStart,
    }))
  }
}

// Export common lazy-loaded components
export const LazyCharts = {
  BarChart: lazyLoad(() => import('@/components/ui/charts/bar-chart').then(mod => ({ default: mod.MobileBarChart }))),
  LineChart: lazyLoad(() => import('@/components/ui/charts/line-chart').then(mod => ({ default: mod.MobileLineChart }))),
  PieChart: lazyLoad(() => import('@/components/ui/charts/pie-chart').then(mod => ({ default: mod.MobilePieChart }))),
  AreaChart: lazyLoad(() => import('@/components/ui/charts/area-chart').then(mod => ({ default: mod.MobileAreaChart }))),
}

export const LazyPages = {
  Dashboard: lazyLoad(() => import('@/app/dashboard/page')),
  Orders: lazyLoad(() => import('@/app/orders/page')),
  Reports: lazyLoad(() => import('@/app/reports/page')),
  Settings: lazyLoad(() => import('@/app/settings/page')),
}