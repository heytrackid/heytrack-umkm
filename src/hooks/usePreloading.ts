'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { preloadModalComponent } from '@/components/lazy/index'

/**
 * Consolidated Preloading Hooks
 * All preloading utilities in one place for single source of truth
 */

/**
 * Simple link preloading hook (from useSimplePreloading)
 * Hook for preloading links on hover
 */
export function useSimpleLinkPreloading() {
  const router = useRouter()

  const handleMouseEnter = useCallback((href: string) => {
    // Prefetch the route
    router.prefetch(href)
  }, [router])

  return { handleMouseEnter }
}

/**
 * Simple button preloading hook (from useSimplePreloading)
 * Hook for preloading on button hover
 */
export function useSimpleButtonPreloading() {
  const router = useRouter()

  const preload = useCallback((href: string) => {
    router.prefetch(href)
  }, [router])

  return { preload }
}

/**
 * Generic preloading hook (from useSimplePreloading)
 */
export function useSimplePreload() {
  const router = useRouter()

  const preloadRoute = useCallback((href: string) => {
    router.prefetch(href)
  }, [router])

  return { preloadRoute }
}

/**
 * Advanced button preloading hook (from route-preloading/useButtonPreloading)
 * Provides functions to preload modals and charts on button interactions
 */
export const useAdvancedButtonPreloading = () => {
  const preloadModalOnHover = useCallback((modalType: string) => {
    if (modalType.includes('form') || modalType.includes('detail')) {
      preloadModalComponent(modalType as Parameters<typeof preloadModalComponent>[0]).catch(() => {})
    }
  }, [])

  const preloadChartOnHover = useCallback(() => {
    // Chart bundle preloading temporarily disabled
  }, [])

  return {
    preloadModalOnHover,
    preloadChartOnHover
  }
}

/**
 * Advanced link preloading hook (from route-preloading/useLinkPreloading)
 * Provides event handlers for preloading routes on link hover/focus
 */
export const useAdvancedLinkPreloading = () => {
  const router = useRouter()

  const handleLinkHover = useCallback((href: string) => {
    router.prefetch(href)
  }, [router])

  const handleLinkFocus = useCallback((href: string) => {
    // Preload on focus for keyboard navigation
    router.prefetch(href)
  }, [router])

  return {
    onMouseEnter: handleLinkHover,
    onFocus: handleLinkFocus
  }
}
