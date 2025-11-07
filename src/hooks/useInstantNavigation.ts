'use client'

import { useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'

import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')

/**
 * Hook untuk navigasi instant tanpa loading skeleton
 * Prefetch data sebelum navigasi
 */

interface RouteConfig {
  path: string
  queryKeys: string[][]
  prefetchFn: () => Promise<unknown>
}

export function useInstantNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  // Konfigurasi route dengan data yang perlu di-prefetch
  const routeConfigs: RouteConfig[] = useMemo(() => [
    {
      path: '/dashboard',
      queryKeys: [['dashboard', 'all-data']],
      prefetchFn: async () => {
        const response = await fetch('/api/dashboard/stats', {
          credentials: 'include', // Include cookies for authentication
        })
        return response.json()
      }
    },
    {
      path: '/orders',
      queryKeys: [['orders', 'list']],
      prefetchFn: async () => {
        const response = await fetch('/api/orders?page=1&limit=10', {
          credentials: 'include', // Include cookies for authentication
        })
        return response.json()
      }
    },
    {
      path: '/recipes',
      queryKeys: [['recipes', 'list']],
      prefetchFn: async () => {
        const response = await fetch('/api/recipes', {
          credentials: 'include', // Include cookies for authentication
        })
        return response.json()
      }
    },
    {
      path: '/ingredients',
      queryKeys: [['ingredients', 'list']],
      prefetchFn: async () => {
        const response = await fetch('/api/ingredients', {
          credentials: 'include', // Include cookies for authentication
        })
        return response.json()
      }
    },
    {
      path: '/customers',
      queryKeys: [['customers']],
      prefetchFn: async () => {
        const response = await fetch('/api/customers', {
          credentials: 'include', // Include cookies for authentication
        })
        return response.json()
      }
    },
    {
      path: '/hpp',
      queryKeys: [['hpp', 'overview']],
      prefetchFn: async () => {
        const response = await fetch('/api/hpp/overview', {
          credentials: 'include', // Include cookies for authentication
        })
        return response.json()
      }
    },
    {
      path: '/profit',
      queryKeys: [['profit', 'report']],
      prefetchFn: async () => {
        const response = await fetch('/api/reports/profit', {
          credentials: 'include', // Include cookies for authentication
        })
        return response.json()
      }
    }
  ], [])

  // Prefetch route data
  const prefetchRoute = useCallback(async (path: string) => {
    const _config = routeConfigs.find(r => r.path === path)
    if (!_config) {return}

    // Check if data already in cache
    const hasCache = _config.queryKeys.some(key => 
      queryClient.getQueryData(key) !== undefined
    )

    // Skip if data fresh in cache
    if (hasCache) {return}

    // Prefetch data
    try {
      for (const queryKey of _config.queryKeys) {
        await queryClient.prefetchQuery({
          queryKey,
          queryFn: _config.prefetchFn,
          staleTime: 5 * 60 * 1000, // 5 minutes
        })
      }
    } catch (error) {
      // Silent fail - data will be fetched on navigation
      logger.warn({ path, error }, 'Prefetch failed for route')
    }
  }, [queryClient, routeConfigs])

  // Navigate with instant data
  const navigateInstant = useCallback((path: string) => {
    // Prefetch before navigation
    void prefetchRoute(path)
    // Navigate immediately (data might already be in cache)
    router.push(path)
  }, [router, prefetchRoute])

  // Prefetch on hover (untuk menu items)
  const prefetchOnHover = useCallback((path: string) => {
    void prefetchRoute(path)
  }, [prefetchRoute])

  // Auto-prefetch adjacent routes
  useEffect(() => {
    const currentIndex = routeConfigs.findIndex(r => pathname.startsWith(r.path))
    if (currentIndex === -1) {return}

    // Prefetch previous and next routes
    const adjacentRoutes = [
      routeConfigs[currentIndex - 1],
      routeConfigs[currentIndex + 1]
    ].filter((route): route is RouteConfig => Boolean(route))

    adjacentRoutes.forEach(route => {
      void prefetchRoute(route.path)
    })
  }, [pathname, prefetchRoute, routeConfigs])

  return {
    navigateInstant,
    prefetchOnHover,
    prefetchRoute
  }
}
