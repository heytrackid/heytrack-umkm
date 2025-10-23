'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

// Breakpoints sesuai dengan Tailwind CSS
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = keyof typeof BREAKPOINTS
type ScreenSize = 'mobile' | 'tablet' | 'desktop'

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = BREAKPOINTS.lg

/**
 * Unified responsive hook untuk deteksi breakpoint
 * @returns Object dengan isMobile, isTablet, isDesktop flags dan current screen size
 * @example
 * const { isMobile, isTablet, isDesktop, current } = useResponsive()
 */
export function useResponsive() {
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

/**
 * Backward compatibility: useIsMobile returns boolean
 * @deprecated Use useResponsive() instead
 */
export function useIsMobile() {
  const { isMobile } = useResponsive()
  return isMobile
}

/**
 * Backward compatibility: useMobile returns detailed object
 * @deprecated Use useResponsive() instead
 */
export function useMobile() {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet: isMobile || isTablet,
    isSmallScreen: isMobile,
    isMediumScreen: isTablet,
    isLargeScreen: isDesktop,
  }
}

/**
 * Generic media query hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * Get current screen size in pixels
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return screenSize
}

/**
 * Detect device orientation
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return orientation
}

/**
 * Detect if device supports touch
 */
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(() => {
      return (
        typeof window !== 'undefined' &&
        ('ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          // @ts-ignore
          navigator.msMaxTouchPoints > 0)
      )
    })
  }, [])

  return isTouch
}
