/**
 * React Query Configuration
 * Standardized cache configurations for different data types
 */

/**
 * Legacy export for backward compatibility
 * @deprecated Use queryConfig.queries instead
 */
export const cachePresets = {
  dynamic: {
    staleTime: 10000,
    gcTime: 300000,
    refetchInterval: false as const,
  },
  frequentlyUpdated: {
    staleTime: 30000,
    gcTime: 600000,
    refetchInterval: false as const,
  },
  moderatelyUpdated: {
    staleTime: 120000,
    gcTime: 900000,
    refetchInterval: false as const,
  },
  static: {
    staleTime: 300000,
    gcTime: 1800000,
    refetchInterval: false as const,
  },
  dashboard: {
    staleTime: 60000,
    gcTime: 300000,
    refetchInterval: false as const,
  },
  analytics: {
    staleTime: 300000,
    gcTime: 1200000,
    refetchInterval: false as const,
  },
}

export const queryConfig = {
  /**
   * Query configurations based on data update frequency
   */
  queries: {
    /**
     * For frequently changing data that needs to be fresh
     * Example: real-time dashboards, live inventory
     */
    dynamic: {
      staleTime: 10000, // 10 seconds
      gcTime: 300000, // 5 minutes
      refetchInterval: false as const,
    },

    /**
     * For data that changes occasionally (orders, inventory)
     * Example: orders, inventory movements, production batches
     */
    frequent: {
      staleTime: 30000, // 30 seconds
      gcTime: 600000, // 10 minutes
      refetchInterval: false as const,
    },

    /**
     * For data that changes moderately (customers, recipes)
     * Example: customers, recipes, ingredients
     */
    moderate: {
      staleTime: 120000, // 2 minutes
      gcTime: 900000, // 15 minutes
      refetchInterval: false as const,
    },

    /**
     * For static data that rarely changes (categories, settings)
     * Example: categories, units, settings, suppliers
     */
    static: {
      staleTime: 300000, // 5 minutes
      gcTime: 1800000, // 30 minutes
      refetchInterval: false as const,
    },

    /**
     * For dashboard data that should be fresh when viewed
     * Example: dashboard stats, summary reports
     */
    dashboard: {
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
      refetchInterval: false as const,
    },

    /**
     * For analytics/reporting data that can be slightly stale
     * Example: reports, analytics, trends
     */
    analytics: {
      staleTime: 300000, // 5 minutes
      gcTime: 1200000, // 20 minutes
      refetchInterval: false as const,
    },
  },

  /**
   * Mutation configurations
   */
  mutations: {
    timeout: 30000, // 30 seconds
    retries: 2,
    retryDelay: (attemptIndex: number): number => Math.min(1000 * 2 ** attemptIndex, 20000),
  },
} as const

/**
 * Common query options
 */
export const commonQueryOptions = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: true,
  retry: 2,
  retryDelay: (attemptIndex: number): number => Math.min(1000 * 2 ** attemptIndex, 20000),
}
