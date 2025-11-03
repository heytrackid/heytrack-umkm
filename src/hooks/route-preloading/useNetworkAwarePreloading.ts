'use client'

import { useEffect } from 'react'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('Hook')
import { preloadChartBundle } from '@/components/lazy/index'



/**
 * Network-aware preloading hook
 * Adjusts preloading aggressiveness based on connection speed
 */
export const useNetworkAwarePreloading = () => {
  useEffect(() => {
    // Only aggressive preloading on fast connections
    type NavigatorWithConnection = Navigator & {
      connection?: { effectiveType: string; downlink: number }
      mozConnection?: { effectiveType: string; downlink: number }
      webkitConnection?: { effectiveType: string; downlink: number }
    }
    
    const nav = navigator as NavigatorWithConnection
    const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection

    if (connection) {
      const isSlowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
      const isFastConnection = connection.effectiveType === '4g' || connection.downlink > 1.5

      if (isFastConnection) {
        logger.info({}, '🚀 Fast connection detected - enabling aggressive preloading')

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
