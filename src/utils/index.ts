/**
 * Barrel export for utility functions
 * 
 * Usage:
 *   import { isMobile, isTablet } from '@/utils'
 *   import { createClient } from '@/utils/supabase'
 */

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

export {
  isMobile,
  isTablet,
  isDesktop,
  getCurrentBreakpoint,
} from './responsive'

// Re-export BREAKPOINTS and DEVICE_BREAKPOINTS from types
export { BREAKPOINTS, DEVICE_BREAKPOINTS } from '@/types/responsive'

// ============================================================================
// SUPABASE UTILITIES
// ============================================================================

export { createClient } from './supabase/client'
// Server client functionality is only available in server contexts
// import { createClient } from '@/utils/supabase/server' directly when needed
export { updateSession } from './supabase/middleware'
