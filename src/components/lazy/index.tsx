'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ComponentType, lazy, ReactNode, Suspense } from 'react'
import { logger } from '@/lib/logger'

// Loading fallback component
const LoadingFallback = ({ height ="h-32" }: { height?: string }) => (
  <Card className={`${height} w-full`}>
    <CardContent className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3 text-sm text-muted-foreground">Loading component...</span>
    </CardContent>
  </Card>
)

// Generic lazy wrapper
export const withLazyLoading = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallbackHeight?: string
) => {
  const LazyComponent = lazy(importFunc)
  
  return (props: any) => (
    <Suspense fallback={<LoadingFallback height={fallbackHeight} />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// Chart components (heavy due to Recharts)
export const LazyFinancialTrendsChart = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.FinancialTrendsChart })),
 "h-64"
)

export const LazyInventoryTrendsChart = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.InventoryTrendsChart })),
 "h-64"
)

// Automation components (heavy business logic)
export const LazySmartExpenseAutomation = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.SmartExpenseAutomation })),
 "h-96"
)

export const LazySmartFinancialDashboard = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.SmartFinancialDashboard })),
 "h-96"
)

export const LazySmartProductionPlanner = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.SmartProductionPlanner })),
 "h-96"
)

export const LazySmartInventoryManager = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.SmartInventoryManager })),
 "h-96"
)

export const LazyAdvancedHPPCalculator = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.AdvancedHPPCalculator })),
 "h-96"
)

export const LazySmartNotificationCenter = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.SmartNotificationCenter })),
 "h-48"
)

// Complex CRUD components
export const LazyIngredientsCRUD = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.IngredientsCRUD })),
 "h-96"
)

export const LazySuppliersCRUD = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.SuppliersCRUD })),
 "h-96"
)

// Enhanced forms - load individual forms instead of bundle
export const LazyIngredientForm = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.IngredientForm })),
 "h-64"
)

export const LazyRecipeForm = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.RecipeForm })),
 "h-64"
)

export const LazyCustomerForm = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.CustomerForm })),
 "h-64"
)

export const LazyFinancialRecordForm = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.FinancialRecordForm })),
 "h-64"
)

// Data table (heavy due to @tanstack/react-table)
export const LazyDataTable = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.SimpleDataTable })),
 "h-64"
)

// Chart component (heavy due to Recharts)
export const LazyChart = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.Chart })),
 "h-48"
)

// Mobile components (optional on desktop)
export const LazyMobileBottomNav = withLazyLoading(
  () => import('@/components').then(m => ({ default: m.MobileBottomNav })),
 "h-16"
)

// Skeleton component untuk custom loading states
export const ComponentSkeleton = ({ 
  height ="h-32", 
  className ="" 
}: { 
  height?: string;
  className?: string;
}) => (
  <div className={`${height} w-full bg-gray-200 animate-pulse rounded-lg ${className}`} />
)

// Loading wrapper dengan custom children
export const LazyWrapper = ({ 
  children, 
  fallback,
  height ="h-32"
}: { 
  children: ReactNode;
  fallback?: ReactNode;
  height?: string;
}) => (
  <Suspense fallback={fallback || <LoadingFallback height={height} />}>
    {children}
  </Suspense>
)

// ==========================================
// Preload Functions for Route Optimization
// ==========================================

// Preload chart bundle (Recharts)
export const preloadChartBundle = async () => {
  try {
    await Promise.all([
      import('@/components').then(m => m.Chart),
      import('@/components').then(m => m.FinancialTrendsChart),
      import('@/components').then(m => m.InventoryTrendsChart),
    ])
    logger.debug('Chart bundle preloaded')
  } catch (error) {
    logger.warn('Failed to preload chart bundle', { error })
  }
}

// Preload table bundle (@tanstack/react-table)
export const preloadTableBundle = async () => {
  try {
    await import('@/components').then(m => m.SimpleDataTable)
    logger.debug('Table bundle preloaded')
  } catch (error) {
    logger.warn('Failed to preload table bundle', { error })
  }
}

// Preload modal component by type
export const preloadModalComponent = async (modalType: string) => {
  try {
    switch (modalType) {
      case 'ingredient-form':
        await import('@/components').then(m => m.IngredientForm)
        break
      case 'recipe-form':
        await import('@/components').then(m => m.RecipeForm)
        break
      case 'customer-form':
        await import('@/components').then(m => m.CustomerForm)
        break
      case 'finance-form':
        await import('@/components').then(m => m.FinancialRecordForm)
        break
      case 'order-form':
        // Add order form if exists
        break
      default:
        logger.warn('Unknown modal type', { modalType })
    }
    logger.debug('Modal component preloaded', { modalType })
  } catch (error) {
    logger.warn('Failed to preload modal', { modalType, error })
  }
}

// Route-based lazy loading configuration
export type RouteLazyLoadingConfig = {
  [route: string]: {
    components: string[]
    priority: 'high' | 'medium' | 'low'
  }
}

// Global lazy loading utilities
export const globalLazyLoadingUtils = {
  // Preload components for a specific route
  preloadForRoute: async (route: keyof RouteLazyLoadingConfig) => {
    const routeConfigs: RouteLazyLoadingConfig = {
      '/dashboard': {
        components: ['chart', 'table'],
        priority: 'high'
      },
      '/orders': {
        components: ['table', 'order-form'],
        priority: 'high'
      },
      '/finance': {
        components: ['chart', 'table', 'finance-form'],
        priority: 'high'
      },
      '/inventory': {
        components: ['table', 'ingredient-form'],
        priority: 'medium'
      },
      '/ingredients': {
        components: ['table', 'ingredient-form', 'recipe-form'],
        priority: 'medium'
      },
      '/customers': {
        components: ['table', 'customer-form'],
        priority: 'medium'
      },
      '/resep': {
        components: ['table', 'recipe-form'],
        priority: 'medium'
      }
    }

    const config = routeConfigs[route]
    if (!config) return

    const preloadPromises = config.components.map(component => {
      if (component === 'chart') return preloadChartBundle()
      if (component === 'table') return preloadTableBundle()
      if (component.includes('form')) return preloadModalComponent(component)
      return Promise.resolve()
    })

    await Promise.all(preloadPromises)
    logger.debug('Preloaded components for route', { route })
  },

  // Preload all heavy components
  preloadAll: async () => {
    try {
      await Promise.all([
        preloadChartBundle(),
        preloadTableBundle(),
      ])
      logger.debug('All heavy components preloaded')
    } catch (error) {
      logger.warn('Failed to preload all components', { error })
    }
  },

  // Check if component is already loaded
  isComponentLoaded: (componentName: string): boolean => {
    // Simple check - in production you might want to track this more precisely
    return false
  }
}
