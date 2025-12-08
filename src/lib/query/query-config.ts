/**
 * React Query Configuration
 * Standardized cache configurations for different data types
 */


export const queryConfig = {
  /**
   * Query configurations based on data update frequency
   */
  queries: {
    /**
     * For real-time data that needs immediate updates
     * Example: chat messages, notifications, live updates
     */
    realtime: {
      staleTime: 0, // Always stale
      gcTime: 60000, // 1 minute
      refetchInterval: 5000 as const, // Refetch every 5 seconds
    },

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
 * Note: refetchOnWindowFocus is TRUE by default to ensure data freshness
 */
export const commonQueryOptions = {
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchOnReconnect: true,
  retry: 2,
  retryDelay: (attemptIndex: number): number => Math.min(1000 * 2 ** attemptIndex, 20000),
}
