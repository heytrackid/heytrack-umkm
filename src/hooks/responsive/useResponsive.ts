'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { BREAKPOINTS, ScreenSize, ResponsiveState } from './types'

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = BREAKPOINTS.lg

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
    setMounted(true)

    const updateBreakpoint = () => {
      const w = window.innerWidth

      if (w < BREAKPOINTS.md) {
        setBreakpoint('mobile')
      } else if (w < BREAKPOINTS.lg) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }

      setWidth(w)
    }

    updateBreakpoint()

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
