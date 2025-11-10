import { apiLogger } from '@/lib/logger'

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
//   CRUDTableWithSuspense, DataTableWithSuspense, FinanceTableWithSuspense, InventoryTableWithSuspense, LazyCRUDTable, LazyFinanceTable, LazyInventoryTable, LazyOrdersTable, LazyVirtualizedTable, OrdersTableWithSuspense, preloadTableBundle, TableContainer, useRowVirtualization, useTableIntersectionObserver, useTablePerformance, VirtualizedTableWithSuspense, type TableType
// } from './table-lazy-loader'

// Modal Lazy Loading
export {
  LazyBulkActionModal,
  LazyConfirmationModal, LazyCustomerDetail, LazyCustomerForm, LazyExportModal, LazyFinanceForm, LazyIngredientForm, LazyInventoryDetail, LazyModal, LazyOrderDetail, LazyOrderForm, LazyRecipeForm, ModalLoadingStrategy, preloadModalComponent, useConfirmationModal, useLazyModal
} from './modal-lazy-loader'

// Route-based Lazy Loading Strategy
export const RouteLazyLoadingConfig = {
  // Dashboard Page
  dashboard: {
    essential: ['stats-cards', 'recent-orders'],
    charts: ['line-chart', 'bar-chart', 'area-chart'],
    defer: ['stock-alerts', 'quick-actions']
  },

  // Finance Page  
  finance: {
    essential: ['financial-summary', 'transaction-list'],
    charts: ['financial-trends', 'category-breakdown'],
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
    charts: ['stock-trends', 'usage-analytics'],
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

  // Preload charts when dashboard is accessed
  onDashboard: [
    'recharts',
    'chart-components'
  ],

  // Preload tables when data pages are accessed
  onDataPage: [
    'react-table',
    'table-components',
    'virtualization'
  ]
}

// Bundle Size Estimates (for monitoring)
export const ComponentBundleSizes = {
  // Chart Components
  'recharts-bundle': '~180kb',
  'chart-components': '~25kb',

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

  // Add component load tracking
  trackComponentLoad: (componentName: string, startTime: number) => {
    const endTime = performance.now()
    const loadTime = endTime - startTime

    LazyLoadingMetrics.loadedComponents.add(componentName)
    LazyLoadingMetrics.loadingTimes.set(componentName, loadTime)

    if (loadTime > 1000) {
      apiLogger.warn({ loadTime: loadTime.toFixed(2) }, `Slow component load: ${componentName}`)
    }
  },

  // Get metrics summary
  getMetrics: () => ({
    totalComponents: LazyLoadingMetrics.loadedComponents.size,
    averageLoadTime: Array.from(LazyLoadingMetrics.loadingTimes.values())
      .reduce((a, b) => a + b, 0) / LazyLoadingMetrics.loadingTimes.size,
    slowComponents: Array.from(LazyLoadingMetrics.loadingTimes.entries())
      .filter(([_, time]) => time > 1000)
      .map(([name, time]) => ({ name, time }))
  })
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
            // preloadPromises.push(preloadChartBundle()) // Use chart preloader if available
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
      apiLogger.debug(`Current memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
    }
  }
}