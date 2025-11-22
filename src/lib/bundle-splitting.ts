import { type ComponentType } from 'react'

import { uiLogger } from '@/lib/logger'

// Static imports for pages (converted from dynamic imports)
import DashboardPage from '@/app/dashboard/page'
import OrdersPage from '@/app/orders/page'
import ReportsPage from '@/app/reports/page'
import SettingsPage from '@/app/settings/page'

/**
 * Bundle Splitting Utilities
 * Advanced code splitting and preloading strategies
 */

// Static load function (converted from lazy loading)
export function staticLoad<T extends ComponentType<Record<string, unknown>>>(component: T): T {
  return component
}



// Route-based preloading
export class RoutePreloader {
  private static readonly preloadedRoutes = new Set<string>()

  static preloadRoute(route: string): void {
    if (this.preloadedRoutes.has(route)) {
      return
    }

    // Static preloading - components are already imported
    uiLogger.info({ route }, 'Route marked as preloaded (static import)')
    this.preloadedRoutes.add(route)
  }

  static preloadOnHover(route: string, delay = 100): { preload: () => void; cancel: () => void } {
    let timeoutId: NodeJS.Timeout

    const preload = (): void => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => this.preloadRoute(route), delay)
    }

    const cancel = (): void => {
      clearTimeout(timeoutId)
    }

    return { preload, cancel }
  }
}

// Component preloading based on user interaction
export class ComponentPreloader {
  private static readonly preloadedComponents = new Set<string>()

  static preloadComponent(componentId: string, importFunc: () => Promise<unknown>): void {
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
  ): IntersectionObserver | undefined {
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
  static logBundleInfo(): void {
    if (typeof window === 'undefined') {
      return
    }

    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource')
      const scripts = resources.filter(r => r.name.endsWith('.js'))

      uiLogger.info('📦 Bundle Analysis started')
      scripts.forEach(script => {
        uiLogger.info(`${script.name}: ${(script).transferSize / 1024}KB`)
      })
      uiLogger.info('📦 Bundle Analysis completed')
    }
  }

  static getBundleStats(): Array<{ name: string | undefined; size: number; loadTime: number }> | null {
    if (typeof window === 'undefined') {
      return null
    }

    const resources = performance.getEntriesByType('resource')
    const scripts = resources.filter(r => r.name.includes('.js') && !r.name.includes('webpack'))

    return scripts.map(script => ({
      name: script.name.split('/').pop(),
      size: (script).transferSize || 0,
      loadTime: script.responseEnd - script.requestStart,
    }))
  }
}

// Charts removed - no longer using chart visualizations

export const LazyPages = {
  Dashboard: staticLoad(DashboardPage),
  Orders: staticLoad(OrdersPage),
  Reports: staticLoad(ReportsPage),
  Settings: staticLoad(SettingsPage),
}