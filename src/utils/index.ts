/**
 * Barrel export for utility functions
 * 
 * Usage:
 *   import { formatDate, calculateAlert } from '@/utils'
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
export { BREAKPOINTS, DEVICE_BREAKPOINTS } from '../types/responsive'

// ============================================================================
// HPP UTILITIES
// ============================================================================

// Export all HPP utilities from the main hpp-utils module
export * from './hpp-utils'

// ============================================================================
// SUPABASE UTILITIES
// ============================================================================

export { createClient } from './supabase/client'
export { createClient as createServerClient } from './supabase/server'
export { updateSession } from './supabase/middleware'
