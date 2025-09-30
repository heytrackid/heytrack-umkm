'use client'

import { createLazyComponent, ComponentSkeletons } from '@/shared/components/utility/LazyWrapper'
import { Suspense } from 'react'

// Lazy load inventory components with optimized loading
export const LazySmartInventoryManager = createLazyComponent(
  () => impor"Placeholder",
  {
    name: 'Smart Inventory Manager',
    fallback: <ComponentSkeletons.Dashboard />,
    minLoadingTime: 500, // Longer for heavy component
  }
)

export const LazyInventoryTrendsChart = createLazyComponent(
  () => impor"Placeholder",
  {
    name: 'Inventory Trends Chart',
    fallback: <ComponentSkeletons.Chart height={400} />,
    minLoadingTime: 300,
  }
)

export const LazyInventoryPage = createLazyComponent(
  () => impor"Placeholder",
  {
    name: 'Inventory Page',
    fallback: <ComponentSkeletons.Dashboard />,
    minLoadingTime: 400,
  }
)

// Preload critical components for better UX
export const preloadInventoryComponents = () => {
  // Preload most commonly used components
  impor"Placeholder"
  impor"Placeholder"
}

// Progressive loading for inventory dashboard
export function InventoryPageWithProgressiveLoading() {
  return (
    <div className="space-y-6">
      {/* Critical above-the-fold content loads first */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
        
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
          <LazyInventoryTrendsChart />
        </Suspense>
        
        <Suspense fallback={<ComponentSkeletons.Dashboard />}>
          <LazySmartInventoryManager ingredients={[]} />
        </Suspense>
      </div>
    </div>
  )
}

// Hook for progressive component loading with metrics
export function useInventoryProgressiveLoading() {
  const components = [
    () => impor"Placeholder",
    () => impor"Placeholder",
  ]
  
  return useProgressiveLoading(components, 200)
}

import { useProgressiveLoading } from '@/shared/components/utility/LazyWrapper'