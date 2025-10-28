'use client'

import { createLazyComponent } from '@/components/lazy/LazyWrapper'
import { Suspense } from 'react'
import type { Ingredient } from '@/types/domain/inventory'
import type { OrdersTable } from '@/types/domain/orders'

// Define FinancialMetrics type for notification components
export interface FinancialMetrics {
  grossMargin: number
  netMargin: number
  revenue?: number
  expenses?: number
  profit?: number
}

// Lazy load notification components with optimized loading
export const LazySmartNotificationCenter = createLazyComponent(
  () => import('@/components/automation/smart-notifications').then(m => ({ default: m.SmartNotificationCenter })),
  {
    name: 'Smart Notification Center',
    fallback: <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />,
    minLoadingTime: 400,
  }
)

// Preload notification components for better UX
export const preloadNotificationComponents = () => {
  // Preload most commonly used components
  import('@/components')
}

// Progressive loading for notification center
export const NotificationCenterWithProgressiveLoading = ({
  ingredients,
  orders,
  financialMetrics
}: {
  ingredients?: Ingredient[]
  orders?: Array<OrdersTable['Row']>
  financialMetrics?: FinancialMetrics
}) => (
  <div className="space-y-6">
    {/* Critical above-the-fold content loads first */}
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Notification Center</h1>

      {/* Quick stats load immediately (lightweight) */}
      <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 rounded-lg" />}>
        <div className="grid gap-4 md:grid-cols-4">
          {/* Basic stats - not lazy loaded as they're lightweight */}
        </div>
      </Suspense>
    </div>

    {/* Heavy notification center loads progressively */}
    <div className="space-y-6">
      <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 rounded-lg" />}>
        <LazySmartNotificationCenter
          ingredients={ingredients}
          orders={orders}
          financialMetrics={financialMetrics}
        />
      </Suspense>
    </div>
  </div>
)

// Hook for progressive notification component loading with metrics
export function useNotificationProgressiveLoading() {
  const components = [
    () => import('@/components'),
  ]

  return useProgressiveLoading(components, 200)
}

// Smart notification loader with conditional features
export const SmartNotificationLoader = ({
  userRole,
  realTimeEnabled = true,
  soundEnabled = true,
  ...props
}: {
  userRole?: 'admin' | 'manager' | 'staff'
  realTimeEnabled?: boolean
  soundEnabled?: boolean
  ingredients?: Ingredient[]
  orders?: Array<OrdersTable['Row']>
  financialMetrics?: FinancialMetrics
  level?: string
  realTime?: boolean
  sound?: boolean
}) => {
  // Different notification levels based on user role
  const notificationLevel = userRole === 'admin' ? 'all' :
    userRole === 'manager' ? 'business' : 'operational'

  return (
    <Suspense fallback={<ComponentSkeletons.Dashboard />}>
      <LazySmartNotificationCenter
        level={notificationLevel}
        realTime={realTimeEnabled}
        sound={soundEnabled}
        {...props}
      />
    </Suspense>
  )
}

// Lightweight notification bell for navigation
export const LazyNotificationBell = createLazyComponent(
  () => import('@/components'),
  {
    name: 'Notification Bell',
    fallback: <ComponentSkeletons.Chart height={40} />,
    minLoadingTime: 100, // Very fast for navigation component
  }
)

