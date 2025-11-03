'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Simple Preloading Hooks
 * Lightweight preloading utilities for links and buttons
 */


/**
 * Hook for preloading links on hover
 */
export function useLinkPreloading() {
  const router = useRouter()

  const handleMouseEnter = useCallback((href: string) => {
    // Prefetch the route
    void router.prefetch(href)
  }, [router])

  return { handleMouseEnter }
}

/**
 * Hook for preloading on button hover
 */
export function useButtonPreloading() {
  const router = useRouter()

  const preload = useCallback((href: string) => {
    void router.prefetch(href)
  }, [router])

  return { preload }
}

/**
 * Generic preloading hook
 */
export function usePreload() {
  const router = useRouter()

  const preloadRoute = useCallback((href: string) => {
    void router.prefetch(href)
  }, [router])

  return { preloadRoute }
}
