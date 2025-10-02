'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Loading states untuk automation features
const AutomationLoadingSkeleton = ({ title }: { title: string }) => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)

// Lazy automation components dengan custom loading
const LazySmartExpenseAutomation = lazy(
  () => import('@/components/automation/smart-notifications')
    .then(module => ({ default: module.SmartExpenseAutomation }))
)

const LazySmartFinancialDashboard = lazy(
  () => import('@/components/automation/smart-notifications')
    .then(module => ({ default: module.SmartFinancialDashboard }))
)

const LazySmartProductionPlanner = lazy(
  () => import('@/components/automation/smart-notifications')
    .then(module => ({ default: module.SmartProductionPlanner }))
)

const LazySmartInventoryManager = lazy(
  () => import('@/components/automation/smart-notifications')
    .then(module => ({ default: module.SmartInventoryManager }))
)

const LazyAdvancedHPPCalculator = lazy(
  () => import('@/components/automation/smart-notifications')
    .then(module => ({ default: module.AdvancedHPPCalculator }))
)

const LazySmartNotificationCenter = lazy(
  () => import('@/components/automation/smart-notifications')
    .then(module => ({ default: module.SmartNotificationCenter }))
)

const LazySmartPricingAssistant = lazy(
  () => import('@/components/automation/smart-notifications')
    .then(module => ({ default: module.SmartPricingAssistant }))
)

const LazyProductionPlanningDashboard = lazy(
  () => import('@/components/automation/smart-notifications')
    .then(module => ({ default: module.ProductionPlanningDashboard }))
)

const LazyInventoryAnalytics = lazy(
  () => import('@/components/automation/smart-notifications')
    .then(module => ({ default: module.InventoryAnalytics }))
)

// Wrapped components with loading states
export const SmartExpenseAutomationWithLoading = (props: any) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Smart Expense Automation" />}>
    <LazySmartExpenseAutomation {...props} />
  </Suspense>
)

export const SmartFinancialDashboardWithLoading = (props: any) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Financial Dashboard" />}>
    <LazySmartFinancialDashboard {...props} />
  </Suspense>
)

export const SmartProductionPlannerWithLoading = (props: any) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Production Planner" />}>
    <LazySmartProductionPlanner {...props} />
  </Suspense>
)

export const SmartInventoryManagerWithLoading = (props: any) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Inventory Manager" />}>
    <LazySmartInventoryManager {...props} />
  </Suspense>
)

export const AdvancedHPPCalculatorWithLoading = (props: any) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="HPP Calculator" />}>
    <LazyAdvancedHPPCalculator {...props} />
  </Suspense>
)

export const SmartNotificationCenterWithLoading = (props: any) => (
  <Suspense fallback={
    <Card className="w-full">
      <CardContent className="p-4 flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm">Loading notifications...</span>
      </CardContent>
    </Card>
  }>
    <LazySmartNotificationCenter {...props} />
  </Suspense>
)

export const SmartPricingAssistantWithLoading = (props: any) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Pricing Assistant" />}>
    <LazySmartPricingAssistant {...props} />
  </Suspense>
)

export const ProductionPlanningDashboardWithLoading = (props: any) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Production Planning" />}>
    <LazyProductionPlanningDashboard {...props} />
  </Suspense>
)

export const InventoryAnalyticsWithLoading = (props: any) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Inventory Analytics" />}>
    <LazyInventoryAnalytics {...props} />
  </Suspense>
)

// Bundle untuk semua automation features
export const AutomationFeatureBundle = {
  SmartExpenseAutomation: SmartExpenseAutomationWithLoading,
  SmartFinancialDashboard: SmartFinancialDashboardWithLoading,
  SmartProductionPlanner: SmartProductionPlannerWithLoading,
  SmartInventoryManager: SmartInventoryManagerWithLoading,
  AdvancedHPPCalculator: AdvancedHPPCalculatorWithLoading,
  SmartNotificationCenter: SmartNotificationCenterWithLoading,
  SmartPricingAssistant: SmartPricingAssistantWithLoading,
  ProductionPlanningDashboard: ProductionPlanningDashboardWithLoading,
  InventoryAnalytics: InventoryAnalyticsWithLoading,
}