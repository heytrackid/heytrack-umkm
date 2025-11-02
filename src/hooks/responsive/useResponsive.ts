'use client'

import { useEffect, useState } from 'react'
import { type ScreenSize, type ResponsiveState, BREAKPOINTS } from './types'



// Removed unused constants: MOBILE_BREAKPOINT, TABLET_BREAKPOINT

/**
 * Unified responsive hook untuk deteksi breakpoint
 * @returns Object dengan isMobile, isTablet, isDesktop flags dan current screen size
 * @example
 * const { isMobile, isTablet, isDesktop, current } = useResponsive()
 */
export function useResponsive(): ResponsiveState {
  const [breakpoint, setBreakpoint] = useState<ScreenSize>('desktop')
  const [width, setWidth] = useState<number>(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    void setMounted(true)

    const updateBreakpoint = () => {
      const w = window.innerWidth

      if (w < BREAKPOINTS.md) {
        void setBreakpoint('mobile')
      } else if (w < BREAKPOINTS.lg) {
        void setBreakpoint('tablet')
      } else {
        void setBreakpoint('desktop')
      }

      void setWidth(w)
    }

    void updateBreakpoint()

    const debounce = (fn: () => void) => {
      let timeout: NodeJS.Timeout
      return () => {
        clearTimeout(timeout)
        timeout = setTimeout(fn, 150)
      }
    }

    const debouncedUpdate = debounce(updateBreakpoint)
    window.addEventListener('resize', debouncedUpdate)

    return () => window.removeEventListener('resize', debouncedUpdate)
  }, [])

  if (!mounted) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      current: 'desktop',
      width: 0,
      isMobileOrTablet: false,
    }
  }

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    current: breakpoint,
    width,
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
  }
}
