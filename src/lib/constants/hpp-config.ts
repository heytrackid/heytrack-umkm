/**
 * HPP (Harga Pokok Produksi) Configuration
 * 
 * Centralized configuration for HPP calculation defaults and thresholds.
 * These values are used as fallbacks when actual data is not available.
 */

export const HPP_CONFIG = {
  /**
   * Default labor cost per serving when no production history exists
   * Unit: IDR (Indonesian Rupiah)
   */
  DEFAULT_LABOR_COST_PER_SERVING: 5000,

  /**
   * Default overhead cost per serving when no operational costs are defined
   * Unit: IDR (Indonesian Rupiah)
   */
  DEFAULT_OVERHEAD_PER_SERVING: 2000,

  /**
   * Fallback recipe count for overhead allocation when recipe count query fails
   * Used to divide total overhead costs equally
   */
  FALLBACK_RECIPE_COUNT: 10,

  /**
   * Number of recent stock transactions to consider for WAC calculation
   * Higher number = more historical data, but slower calculation
   */
  WAC_LOOKBACK_TRANSACTIONS: 50,

  /**
   * Number of recent production batches to consider for labor cost calculation
   */
  LABOR_COST_LOOKBACK_BATCHES: 10,

  /**
   * Alert thresholds for HPP monitoring
   */
  ALERTS: {
    /**
     * Threshold for price increase alert (10% = 0.10)
     * Triggers when HPP increases by more than this percentage
     */
    PRICE_INCREASE_THRESHOLD: 0.10,

    /**
     * Threshold for critical price increase (20% = 0.20)
     * Triggers HIGH severity alert
     */
    PRICE_INCREASE_CRITICAL: 0.20,

    /**
     * Threshold for low margin warning (20% = 0.20)
     * Triggers when profit margin falls below this percentage
     */
    MARGIN_LOW_THRESHOLD: 0.20,

    /**
     * Threshold for critical low margin (10% = 0.10)
     * Triggers CRITICAL severity alert
     */
    MARGIN_CRITICAL_THRESHOLD: 0.10,

    /**
     * Threshold for cost spike detection (15% = 0.15)
     * Triggers when material costs spike suddenly
     */
    COST_SPIKE_THRESHOLD: 0.15,
  },

  /**
   * Snapshot configuration
   */
  SNAPSHOTS: {
    /**
     * Number of days to retain snapshots before archival
     */
    RETENTION_DAYS: 90,

    /**
     * Whether to create snapshots automatically via cron job
     */
    AUTO_CREATE_ENABLED: true,

    /**
     * Cron schedule for daily snapshots (midnight)
     */
    CRON_SCHEDULE: '0 0 * * *',
  },

  /**
   * Calculation configuration
   */
  CALCULATION: {
    /**
     * Minimum number of ingredients required for a recipe
     */
    MIN_INGREDIENTS: 1,

    /**
     * Minimum servings for a recipe
     */
    MIN_SERVINGS: 1,

    /**
     * Whether to include WAC adjustment in HPP calculation
     */
    INCLUDE_WAC_ADJUSTMENT: true,

    /**
     * Whether to save calculations to database automatically
     */
    AUTO_SAVE_CALCULATIONS: true,
  },
} as const

/**
 * Type-safe access to HPP configuration
 */
export type HppConfig = typeof HPP_CONFIG

/**
 * Helper function to get alert severity based on percentage change
 */
export function getAlertSeverity(percentageChange: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (percentageChange >= HPP_CONFIG.ALERTS.PRICE_INCREASE_CRITICAL) {
    return 'CRITICAL'
  }
  if (percentageChange >= HPP_CONFIG.ALERTS.PRICE_INCREASE_THRESHOLD) {
    return 'HIGH'
  }
  if (percentageChange >= 0.05) {
    return 'MEDIUM'
  }
  return 'LOW'
}

/**
 * Helper function to format HPP value as IDR currency
 */
export function formatHppValue(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
