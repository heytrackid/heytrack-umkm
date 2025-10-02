import { useState, useEffect } from 'react'

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLarge: boolean
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'large'
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLarge: false,
    breakpoint: 'desktop'
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024 && width < 1280
      const isLarge = width >= 1280
      
      const breakpoint = isMobile ? 'mobile' : 
                        isTablet ? 'tablet' : 
                        isDesktop ? 'desktop' : 'large'
      
      setState({
        isMobile,
        isTablet,
        isDesktop,
        isLarge,
        breakpoint
      })
    }

    // Initial check
    handleResize()

    // Listen for window resize
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return state
}