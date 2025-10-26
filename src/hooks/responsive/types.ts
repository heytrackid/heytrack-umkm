// Breakpoints sesuai dengan Tailwind CSS
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS
export type ScreenSize = 'mobile' | 'tablet' | 'desktop'

export interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  current: ScreenSize
  width: number
  isMobileOrTablet: boolean
}

export interface MobileState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isMobileOrTablet: boolean
  isSmallScreen: boolean
  isMediumScreen: boolean
  isLargeScreen: boolean
}

export interface ScreenSizeState {
  width: number
  height: number
}
