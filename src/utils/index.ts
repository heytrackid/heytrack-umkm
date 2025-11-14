

/**
 * Barrel export for utility functions
 * 
 * Usage:
 *   import { isMobile, isTablet } from '@/utils/index'
 */

// ==========================================================
// RESPONSIVE UTILITIES
// ==========================================================

export {
    getCurrentBreakpoint, isDesktop, isMobile,
    isTablet
} from './responsive'

// Re-export BREAKPOINTS and DEVICE_BREAKPOINTS from responsive utils
export { BREAKPOINTS, DEVICE_BREAKPOINTS } from '@/utils/responsive'

// ==========================================================
// SUPABASE UTILITIES
// ==========================================================

export { createClient } from './supabase/client'
// Server client functionality is only available in server contexts
// import { createClient } from '@/utils/supabase/server' directly when needed
