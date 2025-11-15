/**
 * Lazy Loading Components Index
 * Centralized exports for all code-split components
 */



// Chart Lazy Loading
// Chart lazy-loader exports temporarily removed (module missing)

// Table Lazy Loading
export { LazyDataTable } from './lazy-data-table'

// Temporarily disabled due to syntax errors in table-lazy-loader.tsx
// export {
//   CRUDTableWithSuspense, DataTableWithSuspense, FinanceTableWithSuspense, InventoryTableWithSuspense, LazyCRUDTable, LazyFinanceTable, LazyInventoryTable, LazyOrder, LazyVirtualizedTable, OrderWithSuspense, preloadTableBundle, TableContainer, useRowVirtualization, useTableIntersectionObserver, useTablePerformance, VirtualizedTableWithSuspense, type TableType
// } from './table-lazy-loader'

// Modal Lazy Loading
export {
    LazyBulkActionModal,
    LazyConfirmationModal,
    CustomerDetail as LazyCustomerDetail,
    LazyCustomerForm,
    LazyExportModal,
    FinanceForm as LazyFinanceForm,
    IngredientForm as LazyIngredientForm,
    InventoryDetail as LazyInventoryDetail,
    LazyModal,
    LazyOrderDetail,
    OrderForm as LazyOrderForm,
    RecipeForm as LazyRecipeForm,
    ModalLoadingStrategy,
    preloadModalComponent,
    useConfirmationModal,
    useLazyModal
} from './modal-lazy-loader'

// Route-based Lazy Loading Strategy
export const RouteLazyLoadingConfig = {
  // Dashboard Page
  dashboard: {
    essential: ['stats-cards', 'recent-orders'],
    defer: ['stock-alerts', 'quick-actions']
  },

  // Finance Page  
  finance: {
    essential: ['financial-summary', 'transaction-list'],
    modals: ['finance-form', 'transaction-detail'],
    defer: ['analytics-dashboard', 'export-features']
  },

  // Orders Page
  orders: {
    essential: ['orders-table', 'orders-stats'],
    modals: ['order-form', 'order-detail'],
    defer: ['bulk-actions', 'advanced-filters']
  },

  // Inventory/Ingredients Page
  inventory: {
    essential: ['inventory-table', 'stock-alerts'],
    modals: ['ingredient-form', 'inventory-detail'],
    defer: ['reorder-automation', 'supplier-integration']
  },

  // Customers Page
  customers: {
    essential: ['customer-table'],
    modals: ['customer-form', 'customer-detail'],
    defer: ['customer-analytics', 'communication-tools']
  },

  // Recipes Page
  recipes: {
    essential: ['recipe-table'],
    modals: ['recipe-form', 'recipe-detail'],
    defer: ['cost-calculation', 'nutrition-analysis']
  },

  // Settings Page
  settings: {
    essential: ['settings-tabs'],
    modals: ['whatsapp-templates'],
    defer: ['advanced-settings', 'integrations']
  }
}

// Preloading Strategies
export const PreloadingStrategy = {
  // Preload on app init
  immediate: [
    'confirmation-modal',
    'basic-skeletons'
  ],

  // Preload on user interaction
  onHover: [
    'ingredient-form',
    'order-form',
    'customer-form'
  ],

  // Preload on route change
  onRoute: (route: keyof typeof RouteLazyLoadingConfig) => {
    const config = RouteLazyLoadingConfig[route]
    return config?.essential || []
  },

  // Preload tables when data pages are accessed
  onDataPage: [
    'react-table',
    'table-components',
    'virtualization'
  ]
}

// Bundle Size Estimates (for monitoring)
export const ComponentBundleSizes = {
  // Table Components  
  'react-table-bundle': '~90kb',
  'table-components': '~30kb',
  'virtualization': '~15kb',

  // Form Components
  'form-components': '~40kb',
  'validation': '~50kb',

  // Modal Components
  'modal-components': '~20kb',
  'dialog-components': '~15kb',

  // Vendor Libraries
  'radix-ui-bundle': '~120kb',
  'date-components': '~80kb',
  'animation-libraries': '~60kb'
}

// Performance Monitoring
export const LazyLoadingMetrics = {
  // Track which components are loaded
  loadedComponents: new Set<string>(),

  // Track loading times
  loadingTimes: new Map<string, number>(),

  // Track bundle sizes
  bundleSizes: new Map<string, number>(),

  // Track failures
  failedComponents: new Map<string, number>(),

  // Add component load tracking
  trackComponentLoad: (componentName: string, startTime: number) => {
    const endTime = performance.now()
    const loadTime = endTime - startTime

    LazyLoadingMetrics.loadedComponents.add(componentName)
    LazyLoadingMetrics.loadingTimes.set(componentName, loadTime)

    if (loadTime > 1000 && typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn(`Slow component load: ${componentName} (${loadTime.toFixed(2)}ms)`)
    }
  },

  // Track component load failures
  trackComponentFailure: (componentName: string, error: unknown) => {
    const currentFailures = LazyLoadingMetrics.failedComponents.get(componentName) || 0
    LazyLoadingMetrics.failedComponents.set(componentName, currentFailures + 1)

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('Component load failure:', {
        componentName,
        failureCount: currentFailures + 1,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  },

  // Get metrics summary
  getMetrics: () => ({
    totalComponents: LazyLoadingMetrics.loadedComponents.size,
    averageLoadTime: Array.from(LazyLoadingMetrics.loadingTimes.values())
      .reduce((a, b) => a + b, 0) / LazyLoadingMetrics.loadingTimes.size,
    slowComponents: Array.from(LazyLoadingMetrics.loadingTimes.entries())
      .filter(([_, time]) => time > 1000)
      .map(([name, time]) => ({ name, time })),
    failedComponents: Array.from(LazyLoadingMetrics.failedComponents.entries())
      .map(([name, count]) => ({ name, count }))
  }),

  // Reset metrics (useful for testing)
  reset: () => {
    LazyLoadingMetrics.loadedComponents.clear()
    LazyLoadingMetrics.loadingTimes.clear()
    LazyLoadingMetrics.bundleSizes.clear()
    LazyLoadingMetrics.failedComponents.clear()
  }
}

// Global lazy loading utilities
export const globalLazyLoadingUtils = {
  // Preload critical components for the current route
  preloadForRoute: (routeName: keyof typeof RouteLazyLoadingConfig) => {
    const config = RouteLazyLoadingConfig[routeName]
    const preloadPromises: Array<Promise<unknown>> = []

    // Preload essential components
    if (config.essential) {
      config.essential.forEach(component => {
        // Add specific preload logic per component
        switch (component) {
          case 'stats-cards':
            // Preload stats card components
            break
          case 'orders-table':
            // preloadPromises.push(preloadTableBundle()) // Disabled due to syntax errors
            break
          case 'financial-summary':
            // Preload financial summary components
            break
          default:
            break
        }
      })
    }

    // Preload modals that might be used
    if ('modals' in config && config.modals) {
      config.modals.forEach((modal: string) => {
        if (modal.includes('form') || modal.includes('detail')) {
          // preloadPromises.push(
          //   preloadModalComponent('modal')?.catch(() => { }) as any
          // ) // Disabled due to missing function
        }
      })
    }

    return Promise.all(preloadPromises)
  },

  // Monitor bundle size impact
  monitorBundleImpact: () => {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const {memory} = performance as typeof performance & { memory: { usedJSHeapSize: number } }
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.debug(`Current memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
      }
    }
  }
}