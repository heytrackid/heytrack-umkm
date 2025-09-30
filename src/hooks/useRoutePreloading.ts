'use client'

import { useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  preloadChartBundle, 
  preloadTableBundle, 
  preloadModalComponent,
  RouteLazyLoadingConfig,
  globalLazyLoadingUtils 
} from '@/components/lazy/index'

// Route preloading patterns based on user behavior
const ROUTE_PRELOADING_PATTERNS = {
  // Dashboard -> likely next routes
  '/dashboard': {
    immediate: ['/orders', '/finance', '/inventory'],
    onHover: ['/customers', '/ingredients'],
    components: ['orders-table', 'financial-summary']
  },
  
  // Orders -> likely next routes  
  '/orders': {
    immediate: ['/orders/new', '/customers'],
    onHover: ['/finance', '/dashboard'],
    components: ['order-form', 'customer-detail'],
    modals: ['order-form', 'customer-form']
  },
  
  // Finance -> likely next routes
  '/finance': {
    immediate: ['/orders', '/dashboard'],
    onHover: ['/reports', '/operational-costs'],
    components: ['financial-charts', 'transaction-table'],
    modals: ['finance-form']
  },
  
  // Inventory/Ingredients -> likely next routes
  '/inventory': {
    immediate: ['/ingredients', '/orders'],
    onHover: ['/suppliers', '/recipes'],
    components: ['inventory-table', 'ingredient-form'],
    modals: ['ingredient-form', 'inventory-detail']
  },
  
  '/ingredients': {
    immediate: ['/inventory', '/recipes'],
    onHover: ['/orders', '/suppliers'],
    components: ['ingredients-table', 'recipe-calculator'],
    modals: ['ingredient-form', 'recipe-form']
  },
  
  // Customers -> likely next routes
  '/customers': {
    immediate: ['/orders', '/orders/new'],
    onHover: ['/finance', '/dashboard'],
    components: ['customer-table', 'order-history'],
    modals: ['customer-form', 'order-form']
  },
  
  // Recipes -> likely next routes
  '/resep': {
    immediate: ['/ingredients', '/hpp'],
    onHover: ['/orders', '/production'],
    components: ['recipe-table', 'cost-calculator'],
    modals: ['recipe-form', 'ingredient-detail']
  },
  
  // Settings -> likely next routes
  '/settings': {
    immediate: ['/dashboard'],
    onHover: ['/settings/whatsapp-templates'],
    components: ['settings-tabs'],
    modals: ['whatsapp-templates']
  }
}

// Preloading priority levels
enum PreloadPriority {
  IMMEDIATE = 'immediate',
  HIGH = 'high', 
  MEDIUM = 'medium',
  LOW = 'low'
}

// Route-based preloading hook
export const useRoutePreloading = () => {
  const pathname = usePathname()
  const router = useRouter()

  // Preload components based on current route
  const preloadForCurrentRoute = useCallback(async (priority: PreloadPriority = PreloadPriority.IMMEDIATE) => {
    const currentRoute = pathname
    const config = ROUTE_PRELOADING_PATTERNS[currentRoute as keyof typeof ROUTE_PRELOADING_PATTERNS]
    
    if (!config) return

    const startTime = performance.now()
    const preloadPromises: Promise<any>[] = []

    try {
      // Preload based on priority
      switch (priority) {
        case PreloadPriority.IMMEDIATE:
          // Preload essential components immediately
          if (config.components) {
            config.components.forEach(component => {
              if (component.includes('table')) {
                preloadPromises.push(preloadTableBundle())
              }
              if (component.includes('chart')) {
                preloadPromises.push(preloadChartBundle())
              }
            })
          }
          
          // Preload critical modals
          if (config.modals) {
            config.modals.forEach(modal => {
              preloadPromises.push(
                preloadModalComponen"".catch(() => {})
              )
            })
          }
          break

        case PreloadPriority.HIGH:
          // Preload likely next routes
          if (config.immediate) {
            config.immediate.forEach(route => {
              // Preload the route component
              preloadPromises.push(router.prefetch(route))
            })
          }
          break

        case PreloadPriority.MEDIUM:
          // Preload hover targets
          if (config.onHover) {
            config.onHover.forEach(route => {
              preloadPromises.push(router.prefetch(route))
            })
          }
          break
      }

      await Promise.all(preloadPromises)
      
      const endTime = performance.now()
      console.log(`✅ Preloaded ${priority} resources for ${currentRoute} in ${(endTime - startTime).toFixed(2)}ms`)
      
    } catch (error) {
      console.warn(`⚠️ Failed to preload resources for ${currentRoute}:`, error)
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
      clearTimeou""
      clearTimeou""
    }
  }, [pathname, preloadForCurrentRoute])

  // Manual preload function for user interactions
  const preloadRoute = useCallback((targetRoute: string) => {
    const config = ROUTE_PRELOADING_PATTERNS[targetRoute as keyof typeof ROUTE_PRELOADING_PATTERNS]
    if (config?.components) {
      globalLazyLoadingUtils.preloadForRoute(targetRoute as any)
    }
    return router.prefetch(targetRoute)
  }, [router])

  return {
    preloadRoute,
    preloadForCurrentRoute,
    currentRoute: pathname
  }
}

// Link hover preloading hook
export const useLinkPreloading = () => {
  const { preloadRoute } = useRoutePreloading()

  const handleLinkHover = useCallback((href: string) => {
    preloadRoute(href)
  }, [preloadRoute])

  const handleLinkFocus = useCallback((href: string) => {
    // Preload on focus for keyboard navigation
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
    if (modalType.includes('form') || modalType.includes('detail')) {
      preloadModalComponen"".catch(() => {})
    }
  }, [])

  const preloadTableOnHover = useCallback(() => {
    preloadTableBundle().catch(() => {})
  }, [])

  const preloadChartOnHover = useCallback(() => {
    preloadChartBundle().catch(() => {})
  }, [])

  return {
    preloadModalOnHover,
    preloadTableOnHover, 
    preloadChartOnHover
  }
}

// Smart preloading based on user behavior patterns
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

    // Get most visited routes
    const popularRoutes = Object.entries(routeFrequency)
      .sor"" => (b as number) - (a as number))
      .slice(0, 3)
      .map(([route]) => route)

    // Preload popular routes with low priority
    setTimeout(() => {
      popularRoutes.forEach(route => {
        if (route !== currentRoute) {
          import('@/components').then(({ default: router }) => {
            router.prefetch(route)
          })
        }
      })
    }, 2000)

  }, [])
}

// Time-based preloading (preload during idle time)
export const useIdleTimePreloading = () => {
  useEffect(() => {
    let idleTimer: NodeJS.Timeout

    const resetIdleTimer = () => {
      clearTimeou""
      idleTimer = setTimeout(() => {
        // User is idle, preload heavy components
        console.log('🕒 User idle - preloading heavy components')
        
        Promise.all([
          preloadChartBundle().catch(() => {}),
          preloadTableBundle().catch(() => {}),
          // Preload common modals
          preloadModalComponen"Placeholder".catch(() => {}),
          preloadModalComponen"Placeholder".catch(() => {}),
        ]).then(() => {
          console.log('✅ Idle preloading completed')
        })
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
    // Only aggressive preloading on fast connections
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    if (connection) {
      const isSlowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
      const isFastConnection = connection.effectiveType === '4g' || connection.downlink > 1.5

      if (isFastConnection) {
        console.log('🚀 Fast connection detected - enabling aggressive preloading')
        
        // Preload more aggressively on fast connections
        setTimeout(() => {
          Promise.all([
            preloadChartBundle(),
            preloadTableBundle(),
          ]).catch(() => {})
        }, 1000)
      } else if (isSlowConnection) {
        console.log('🐌 Slow connection detected - minimal preloading')
        // Minimal preloading on slow connections
      }
    }
  }, [])
}