'use client'

import { useEffect } from 'react'

import { BundleMonitor } from '@/lib/bundle-splitting'

/**
 * Performance monitoring component
 * Tracks real-world performance metrics
 */
export const PerformanceMonitor = (): JSX.Element | null => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return
    }
    BundleMonitor.logBundleInfo()
  }, [])

  return null // Invisible monitoring component
}
