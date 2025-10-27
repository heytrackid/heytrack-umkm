'use client'
import { useEffect } from 'react'

import { apiLogger } from '@/lib/logger'
import { preloadChartBundle } from '@/components/lazy/index'

/**
 * Time-based preloading hook
 * Preloads heavy components during idle time when user is inactive
 */
export const useIdleTimePreloading = () => {
  useEffect(() => {
    let idleTimer: NodeJS.Timeout

    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        // User is idle, preload heavy components
        preloadChartBundle().then(() => {
          // Idle preloading completed
        }).catch(() => {})
      }, 5000) // 5 seconds of inactivity
    }

    // Reset timer on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true)
    })

    resetIdleTimer()

    return () => {
      clearTimeout(idleTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true)
      })
    }
  }, [])
}
