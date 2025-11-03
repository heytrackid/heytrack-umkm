'use client'

import { useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

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
  const routeConfigs: RouteConfig[] = [
    {
      path: '/dashboard',
      queryKeys: [['dashboard', 'all-data']],
      prefetchFn: async () => {
        const response = await fetch('/api/dashboard/stats')
        return response.json()
      }
    },
    {
      path: '/orders',
      queryKeys: [['orders', 'list']],
      prefetchFn: async () => {
        const response = await fetch('/api/orders?page=1&limit=10')
        return response.json()
      }
    },
    {
      path: '/recipes',
      queryKeys: [['recipes', 'list']],
      prefetchFn: async () => {
        const response = await fetch('/api/recipes')
        return response.json()
      }
    },
    {
      path: '/ingredients',
      queryKeys: [['ingredients', 'list']],
      prefetchFn: async () => {
        const response = await fetch('/api/ingredients')
        return response.json()
      }
    },
    {
      path: '/customers',
      queryKeys: [['customers']],
      prefetchFn: async () => {
        const response = await fetch('/api/customers')
        return response.json()
      }
    },
    {
      path: '/hpp',
      queryKeys: [['hpp', 'overview']],
      prefetchFn: async () => {
        const response = await fetch('/api/hpp/overview')
        return response.json()
      }
    },
    {
      path: '/profit',
      queryKeys: [['profit', 'report']],
      prefetchFn: async () => {
        const response = await fetch('/api/reports/profit')
        return response.json()
      }
    }
  ]

  // Prefetch route data
  const prefetchRoute = useCallback(async (path: string) => {
    const config = routeConfigs.find(r => r.path === path)
    if (!config) {return}

    // Check if data already in cache
    const hasCache = config.queryKeys.some(key => 
      queryClient.getQueryData(key) !== undefined
    )

    // Skip if data fresh in cache
    if (hasCache) {return}

    // Prefetch data
    try {
      for (const queryKey of config.queryKeys) {
        await queryClient.prefetchQuery({
          queryKey,
          queryFn: config.prefetchFn,
          staleTime: 5 * 60 * 1000, // 5 minutes
        })
      }
    } catch (error) {
      // Silent fail - data will be fetched on navigation
      console.warn('Prefetch failed for', path, error)
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
    ].filter(Boolean)

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
