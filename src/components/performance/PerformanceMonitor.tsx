'use client'

 import { useEffect } from 'react'
import { BundleMonitor } from '@/lib/bundle-splitting'

/**
 * Performance monitoring component
 * Tracks real-world performance metrics
 */
export const PerformanceMonitor = () => {
  useEffect(() => {
    // Log bundle analysis on mount
    BundleMonitor.logBundleInfo()

    // Bundle analysis is logged above
    // For Core Web Vitals, use browser dev tools or implement custom tracking
  }, [])

  return null // Invisible monitoring component
}