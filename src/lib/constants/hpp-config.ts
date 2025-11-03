

/**
 * HPP (Harga Pokok Produksi) Configuration Constants
 * 
 * Centralized configuration for HPP calculations to avoid magic numbers
 * and make business logic more maintainable.
 */

export const HPP_CONFIG = {
  /**
   * Default labor cost per serving when no production data is available
   * Used as fallback in HPP calculations
   */
  DEFAULT_LABOR_COST_PER_SERVING: 5000, // IDR

  /**
   * Default overhead cost per serving
   * Used when operational costs cannot be calculated
   */
  DEFAULT_OVERHEAD_PER_SERVING: 2500, // IDR

  /**
   * Minimum operational cost percentage of material cost
   * Ensures operational costs are at least 15% of ingredient costs
   */
  MIN_OPERATIONAL_COST_PERCENTAGE: 0.15, // 15%

  /**
   * Default operational cost percentage when no data available
   * Applied to ingredient costs to estimate operational overhead
   */
  DEFAULT_OPERATIONAL_COST_PERCENTAGE: 0.15, // 15%

  /**
   * Fallback recipe count for overhead distribution
   * Used when recipe count cannot be determined
   */
  FALLBACK_RECIPE_COUNT: 10,

  /**
   * Number of recent transactions to consider for WAC calculation
   * Limits the lookback window for weighted average cost
   */
  WAC_LOOKBACK_TRANSACTIONS: 50,

  /**
   * Price increase threshold for alerts (percentage)
   * Triggers alert when HPP increases by more than this amount
   */
  PRICE_INCREASE_THRESHOLD: 0.10, // 10%

  /**
   * Low margin threshold (percentage)
   * Warns when profit margin falls below this level
   */
  MARGIN_LOW_THRESHOLD: 0.20, // 20%

  /**
   * Cost spike threshold (percentage)
   * Detects sudden cost increases that may need attention
   */
  COST_SPIKE_THRESHOLD: 0.15, // 15%

  /**
   * Minimum margin for sustainable business (percentage)
   * Recommended minimum profit margin
   */
  RECOMMENDED_MIN_MARGIN: 0.30, // 30%

  /**
   * Target margin for healthy business (percentage)
   * Ideal profit margin to aim for
   */
  RECOMMENDED_TARGET_MARGIN: 0.40, // 40%

  /**
   * Days to keep HPP snapshots for trend analysis
   */
  SNAPSHOT_RETENTION_DAYS: 90,

  /**
   * Maximum age of WAC data before recalculation (days)
   */
  WAC_MAX_AGE_DAYS: 30,

  /**
   * Alert thresholds
   */
  ALERTS: {
    PRICE_INCREASE_THRESHOLD: 0.10, // 10%
    PRICE_INCREASE_CRITICAL: 0.20, // 20%
    MARGIN_LOW_THRESHOLD: 0.20, // 20%
    MARGIN_CRITICAL_THRESHOLD: 0.10, // 10%
    COST_SPIKE_THRESHOLD: 0.15, // 15%
  },

  /**
   * Snapshot configuration
   */
  SNAPSHOTS: {
    RETENTION_DAYS: 90,
  },
} as const


