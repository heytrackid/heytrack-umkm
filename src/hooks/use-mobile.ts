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

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

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

export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const updateSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return screenSize
}

// Hook untuk deteksi mobile dan tablet
export function useMobile() {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`)
  const isTablet = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`)
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`)

  return {
    isMobile,
    isTablet,
    isDesktop,
    // Convenience flags
    isMobileOrTablet: isMobile || isTablet,
    isSmallScreen: isMobile,
    isMediumScreen: isTablet,
    isLargeScreen: isDesktop
  }
}

// Hook untuk deteksi orientasi
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    return () => window.removeEventListener('resize', updateOrientation)
  }, [])

  return orientation
}

// Hook untuk deteksi touch device
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      )
    }

    checkTouch()
  }, [])

  return isTouchDevice
}

// Hook untuk deteksi viewport height (berguna untuk mobile dengan dynamic viewport)
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const updateHeight = () => {
      // Gunakan visualViewport jika tersedia (lebih akurat di mobile)
      const height = (window as any).visualViewport?.height ?? window.innerHeight
      setViewportHeight(height)

      // Set CSS custom property untuk digunakan di CSS
      document.documentElement.style.setProperty('--viewport-height', `${height}px`)
    }

    updateHeight()

    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener('resize', updateHeight)
      return () => (window as any).visualViewport?.removeEventListener('resize', updateHeight)
    } else {
      window.addEventListener('resize', updateHeight)
      return () => window.removeEventListener('resize', updateHeight)
    }
  }, [])

  return viewportHeight
}

// Hook untuk deteksi apakah user sedang scroll
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let lastScrollY = window.scrollY
    let ticking = false
    let scrollTimeout: NodeJS.Timeout

    const updateScrollDirection = () => {
      const scrollY = window.scrollY

      setIsScrolling(true)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150)

      if (Math.abs(scrollY - lastScrollY) < 3) {
        // Jika scroll terlalu kecil, abaikan
        ticking = false
        return
      }

      setScrollDirection(scrollY > lastScrollY ? 'down' : 'up')
      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return { scrollDirection, isScrolling }
}

// Hook kombinasi untuk responsive behavior
export function useResponsive() {
  const mobile = useMobile()
  const orientation = useOrientation()
  const isTouchDevice = useTouchDevice()
  const viewportHeight = useViewportHeight()
  const { scrollDirection, isScrolling } = useScrollDirection()
  const screenSize = useScreenSize()

  return {
    ...mobile,
    orientation,
    isTouchDevice,
    viewportHeight,
    scrollDirection,
    isScrolling,
    screenSize,
    // Utility functions
    getBreakpoint: () => {
      const width = screenSize.width
      if (width < BREAKPOINTS.sm) return 'xs'
      if (width < BREAKPOINTS.md) return 'sm'
      if (width < BREAKPOINTS.lg) return 'md'
      if (width < BREAKPOINTS.xl) return 'lg'
      if (width < BREAKPOINTS['2xl']) return 'xl'
      return '2xl'
    },
    // Common responsive patterns
    shouldShowSidebar: !mobile.isMobile,
    shouldUseBottomNav: mobile.isMobile,
    shouldCollapseHeader: mobile.isMobile && isScrolling && scrollDirection === 'down',
    shouldUseTouchOptimization: isTouchDevice || mobile.isMobile
  }
}
