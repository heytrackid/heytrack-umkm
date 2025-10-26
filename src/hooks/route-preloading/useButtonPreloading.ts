'use client'
import { useCallback } from 'react'

import {
  preloadChartBundle,
  preloadModalComponent
} from '@/components/lazy/index'

/**
 * Button interaction preloading hook
 * Provides functions to preload modals and charts on button interactions
 */
export const useButtonPreloading = () => {
  const preloadModalOnHover = useCallback((modalType: string) => {
    if (modalType.includes('form') || modalType.includes('detail')) {
      preloadModalComponent(modalType as any).catch(() => {})
    }
  }, [])

  const preloadChartOnHover = useCallback(() => {
    preloadChartBundle().catch(() => {})
  }, [])

  return {
    preloadModalOnHover,
    preloadChartOnHover
  }
}
