'use client'
import { useEffect } from 'react'

import { apiLogger } from '@/lib/logger'
import { preloadChartBundle } from '@/components/lazy/index'

/**
 * Network-aware preloading hook
 * Adjusts preloading aggressiveness based on connection speed
 */
export const useNetworkAwarePreloading = () => {
  useEffect(() => {
    // Only aggressive preloading on fast connections
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    if (connection) {
      const isSlowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
      const isFastConnection = connection.effectiveType === '4g' || connection.downlink > 1.5

      if (isFastConnection) {
        apiLogger.info({}, '🚀 Fast connection detected - enabling aggressive preloading')

        // Preload more aggressively on fast connections
        setTimeout(() => {
          preloadChartBundle().catch(() => {})
        }, 1000)
      } else if (isSlowConnection) {
        // Minimal preloading on slow connections
      }
    }
  }, [])
}
