
// Main hooks
export { useResponsive } from './useResponsive'
export { useMediaQuery } from './useMediaQuery'
export { useScreenSize } from './useScreenSize'
export { useOrientation } from './useOrientation'
export { useTouchDevice } from './useTouchDevice'

// Backward compatibility
export { useIsMobile, useMobile } from './compatibility'

// Constants and types
export { BREAKPOINTS } from './types'
export type {
  Breakpoint,
  ScreenSize,
  ResponsiveState,
  MobileState,
  ScreenSizeState
} from './types'
