'use client'

import { createLazyComponent, ComponentSkeletons } from '@/shared/components/utility/LazyWrapper'
import { Suspense } from 'react'

// Lazy load finance components with optimized loading
export const LazySmartExpenseAutomation = createLazyComponent(
  () => import('@/components'),
  {
    name: 'Smart Expense Automation',
    fallback: <ComponentSkeletons.Dashboard />,
    minLoadingTime: 600, // Longer for complex automation features
  }
)

export const LazySmartFinancialDashboard = createLazyComponent(
  () => import('@/components'),
  {
    name: 'Smart Financial Dashboard',
    fallback: <ComponentSkeletons.Dashboard />,
    minLoadingTime: 500,
  }
)

export const LazyFinancialTrendsChart = createLazyComponent(
  () => import('@/components'),
  {
    name: 'Financial Trends Chart',
    fallback: <ComponentSkeletons.Chart height={400} />,
    minLoadingTime: 400,
  }
)

// Preload critical finance components for better UX
export const preloadFinanceComponents = () => {
  // Preload most commonly used components
  import('@/components')
  import('@/components')
  import('@/components')
}

// Progressive loading for finance dashboard
export function FinanceDashboardWithProgressiveLoading() {
  return (
    <div className="space-y-6">
      {/* Critical above-the-fold content loads first */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        
        {/* Stats cards load immediately (lightweight) */}
        <Suspense fallback={<ComponentSkeletons.Card />}>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Basic stats - not lazy loaded as they're lightweight */}
          </div>
        </Suspense>
      </div>

      {/* Heavy components load progressively */}
      <div className="space-y-6">
        <Suspense fallback={<ComponentSkeletons.Chart />}>
          <LazyFinancialTrendsChart />
        </Suspense>
        
        <Suspense fallback={<ComponentSkeletons.Dashboard />}>
          <LazySmartExpenseAutomation />
        </Suspense>
        
        <Suspense fallback={<ComponentSkeletons.Dashboard />}>
          <LazySmartFinancialDashboard />
        </Suspense>
      </div>
    </div>
  )
}

// Hook for progressive finance component loading with metrics
export function useFinanceProgressiveLoading() {
  const components = [
    () => import('@/components'),
    () => import('@/components'),
    () => import('@/components'),
  ]
  
  return useProgressiveLoading(components, 200)
}

import { useProgressiveLoading } from '@/shared/components/utility/LazyWrapper'