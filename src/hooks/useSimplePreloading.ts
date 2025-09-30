'use client'

import { useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Simplified route preloading patterns
const ROUTE_PRELOADING_PATTERNS = {
  '/dashboard': ['/orders', '/finance', '/inventory'],
  '/orders': ['/orders/new', '/customers'],
  '/finance': ['/orders', '/dashboard'],
  '/inventory': ['/ingredients', '/orders'],
  '/ingredients': ['/inventory', '/resep'],
  '/customers': ['/orders', '/orders/new'],
  '/resep': ['/ingredients', '/hpp'],
  '/settings': ['/dashboard'],
}

// Simple preloading functions
export const preloadChartBundle = async () => {
  try {
    await import('@/components')
    console.log('✅ Chart bundle preloaded')
  } catch (error) {
    console.warn('❌ Failed to preload chart bundle:', error)
  }
}

export const preloadTableBundle = async () => {
  try {
    await Promise.all([
      import('@/components'),
      import('@/components'),
      import('@/components'),
    ])
    console.log('✅ Table bundle preloaded')
  } catch (error) {
    console.warn('❌ Failed to preload table bundle:', error)
  }
}

export const preloadModalComponent = async (modalType: string) => {
  try {
    // Simple modal preloading based on type
    if (modalType.includes('form')) {
      await import('@/components')
    }
    if (modalType.includes('dialog')) {
      await import('@/components')
    }
    console.log(`✅ Modal ${modalType} preloaded`)
  } catch (error) {
    console.warn(`❌ Failed to preload modal ${modalType}:`, error)
  }
}

// Simple route preloading hook
export const useRoutePreloading = () => {
  const pathname = usePathname()
  const router = useRouter()

  const preloadRoute = useCallback(async (targetRoute: string) => {
    return router.prefetch(targetRoute)
  }, [router])

  // Preload based on current route
  useEffect(() => {
    const currentRoute = pathname as keyof typeof ROUTE_PRELOADING_PATTERNS
    const routesToPreload = ROUTE_PRELOADING_PATTERNS[currentRoute]
    
    if (routesToPreload) {
      // Immediate preloading
      routesToPreload.forEach((route, index) => {
        setTimeou"" => {
          preloadRoute(route)
        }, index * 100) // 100ms delay between each
      })

      // Also preload some components
      if (pathname === '/dashboard') {
        setTimeou"" => {
          preloadChartBundle()
          preloadTableBundle()
        }, 500)
      }
    }
  }, [pathname, preloadRoute])

  return { preloadRoute }
}

// Link hover preloading hook
export const useLinkPreloading = () => {
  const { preloadRoute } = useRoutePreloading()

  const handleLinkHover = useCallback((href: string) => {
    preloadRoute(href)
  }, [preloadRoute])

  const handleLinkFocus = useCallback((href: string) => {
    preloadRoute(href)
  }, [preloadRoute])

  return {
    onMouseEnter: handleLinkHover,
    onFocus: handleLinkFocus
  }
}

// Button interaction preloading
export const useButtonPreloading = () => {
  const preloadModalOnHover = useCallback((modalType: string) => {
    preloadModalComponen""
  }, [])

  const preloadTableOnHover = useCallback(() => {
    preloadTableBundle()
  }, [])

  const preloadChartOnHover = useCallback(() => {
    preloadChartBundle()
  }, [])

  return {
    preloadModalOnHover,
    preloadTableOnHover,
    preloadChartOnHover
  }
}

// Smart preloading based on user behavior
export const useSmartPreloading = () => {
  useEffect(() => {
    // Track user navigation patterns
    const navigationHistory = JSON.parse(
      localStorage.getItem('user_navigation_patterns') || '[]'
    ).slice(-10) // Keep last 10 routes

    // Add current route to history
    const currentRoute = window.location.pathname
    navigationHistory.push(currentRoute)
    localStorage.setItem('user_navigation_patterns', JSON.stringify(navigationHistory))

    // Analyze patterns and preload likely next routes
    const routeFrequency = navigationHistory.reduce((acc: Record<string, number>, route: string) => {
      acc[route] = (acc[route] || 0) + 1
      return acc
    }, {})

    // Get most visited routes and preload them with low priority
    const popularRoutes = Object.entries(routeFrequency)
      .sor"" => (b as number) - (a as number))
      .slice(0, 3)
      .map(([route]) => route)

    // Preload popular routes after 2 seconds
    setTimeou"" => {
      popularRoutes.forEach(route => {
        if (route !== currentRoute && route !== '/') {
          import('@/components').then(({ default: router }) => {
            router.prefetch(route)
          }).catch(() => {})
        }
      })
    }, 2000)

  }, [])
}

// Idle time preloading
export const useIdleTimePreloading = () => {
  useEffect(() => {
    let idleTimer: NodeJS.Timeout

    const resetIdleTimer = () => {
      clearTimeou""
      idleTimer = setTimeou"" => {
        console.log('🕒 User idle - preloading heavy components')
        
        Promise.all([
          preloadChartBundle(),
          preloadTableBundle(),
          preloadModalComponen"Placeholder",
          preloadModalComponen"Placeholder",
        ]).then(() => {
          console.log('✅ Idle preloading completed')
        }).catch(() => {})
      }, 5000) // 5 seconds of inactivity
    }

    // Reset timer on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true)
    })

    resetIdleTimer()

    return () => {
      clearTimeou""
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true)
      })
    }
  }, [])
}

// Network-aware preloading
export const useNetworkAwarePreloading = () => {
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    if (connection) {
      const isSlowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
      const isFastConnection = connection.effectiveType === '4g' || connection.downlink > 1.5

      if (isFastConnection) {
        console.log('🚀 Fast connection detected - enabling aggressive preloading')
        
        setTimeou"" => {
          Promise.all([
            preloadChartBundle(),
            preloadTableBundle(),
          ]).catch(() => {})
        }, 1000)
      } else if (isSlowConnection) {
        console.log('🐌 Slow connection detected - minimal preloading')
      }
    }
  }, [])
}

// Simplified metrics tracking
export const LazyLoadingMetrics = {
  loadedComponents: new Set<string>(),
  loadingTimes: new Map<string, number>(),
  
  trackComponentLoad: (componentName: string, startTime: number) => {
    const endTime = performance.now()
    const loadTime = endTime - startTime
    
    LazyLoadingMetrics.loadedComponents.add(componentName)
    LazyLoadingMetrics.loadingTimes.set(key: string, data: any, ttl: number = 300000): void {
    
    if (loadTime > 1000) {
      console.warn(`⚠️ Slow component load: ${componentName} took ${loadTime.toFixed(2)}ms`)
    }
  },
  
  getMetrics: () => ({
    totalComponents: LazyLoadingMetrics.loadedComponents.size,
    averageLoadTime: Array.from(LazyLoadingMetrics.loadingTimes.values())
      .reduce((a, b) => a + b, 0) / LazyLoadingMetrics.loadingTimes.size || 0,
    slowComponents: Array.from(LazyLoadingMetrics.loadingTimes.entries())
      .filter(([_, time]) => time > 1000)
      .map(([name, time]) => ({ name, time }))
  })
}