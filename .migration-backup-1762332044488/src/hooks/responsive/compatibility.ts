import { useResponsive } from './useResponsive'
import type { MobileState } from './types'


/**
 * Backward compatibility: useIsMobile returns boolean
 * @deprecated Use useResponsive() instead
 */
export function useIsMobile(): boolean {
  const { isMobile } = useResponsive()
  return isMobile
}

/**
 * Backward compatibility: useMobile returns detailed object
 * @deprecated Use useResponsive() instead
 */
export function useMobile(): MobileState {
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
