'use client'

import { useState, useEffect } from 'react'

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1024,
    height: 768
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const updateState = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height
      })
    }

    // Initial check
    updateState()

    // Add event listener
    window.addEventListener('resize', updateState)
    
    // Cleanup
    return () => window.removeEventListener('resize', updateState)
  }, [])

  return state
}

// Hook untuk breakpoint checks
export function useBreakpoint() {
  const responsive = useResponsive()
  
  return {
    ...responsive,
    isXs: responsive.width < 480,
    isSm: responsive.width >= 480 && responsive.width < 768,
    isMd: responsive.width >= 768 && responsive.width < 1024,
    isLg: responsive.width >= 1024 && responsive.width < 1280,
    isXl: responsive.width >= 1280,
  }
}

// Hook untuk mobile-first development
export function useMobileFirst() {
  const { isMobile, isTablet, width } = useResponsive()
  
  const isTouch = typeof window !== 'undefined' && 
    ('ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0))
  
  return {
    isMobile,
    isTablet,
    isTouch,
    shouldUseMobileLayout: isMobile || (isTablet && isTouch),
    shouldUseCompactUI: width < 900,
    touchTargetSize: isMobile ? 44 : 40 // Minimum touch target size in pixels
  }
}
