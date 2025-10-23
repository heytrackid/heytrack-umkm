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
  BREAKPOINTS,
  DEVICE_BREAKPOINTS,
  isMobile,
  isTablet,
  isDesktop,
  getCurrentBreakpoint,
  getMediaQueryString,
  getPrioritizedColumns,
} from './responsive'

// ============================================================================
// HPP UTILITIES
// ============================================================================

export {
  calculateHPPFromRecipe,
  updateRecipeHPP,
  compareHPP,
} from './hpp-utils'

export {
  getDateRange,
  formatDateForDisplay,
  getMonthRange,
  getQuarterRange,
} from './hpp-date-utils'

export {
  detectPriceAlert,
  calculateAlertSeverity,
  generateAlertMessage,
  getAlertHistory,
} from './hpp-alert-helpers'

export {
  formatChartData,
  prepareTimeSeriesData,
  formatChartLabels,
  getChartColors,
} from './hpp-chart-formatters'

// ============================================================================
// SUPABASE UTILITIES
// ============================================================================

export { createClient } from './supabase/client'
export { createServerClient } from './supabase/server'
export { updateSession } from './supabase/middleware'
