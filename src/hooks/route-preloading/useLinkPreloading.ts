'use client'
import { useCallback } from 'react'

import { useRoutePreloading } from './useRoutePreloading'

/**
 * Link hover preloading hook
 * Provides event handlers for preloading routes on link hover/focus
 */
export const useLinkPreloading = () => {
  const { preloadRoute } = useRoutePreloading()

  const handleLinkHover = useCallback((href: string) => {
    void preloadRoute(href)
  }, [preloadRoute])

  const handleLinkFocus = useCallback((href: string) => {
    // Preload on focus for keyboard navigation
    void preloadRoute(href)
  }, [preloadRoute])

  return {
    onMouseEnter: handleLinkHover,
    onFocus: handleLinkFocus
  }
}
