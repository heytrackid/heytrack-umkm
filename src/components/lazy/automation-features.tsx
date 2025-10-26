'use client'
import * as React from 'react'

import { lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Automation component props interfaces
interface AutomationProps {
  onAction?: (action: string, data?: any) => void
  refreshInterval?: number
  autoRefresh?: boolean
  showAlerts?: boolean
  filters?: Record<string, unknown>
  [key: string]: unknown
}

interface FinancialAutomationProps extends AutomationProps {
  currency?: string
  dateRange?: {
    start: string
    end: string
  }
  budgetLimits?: Record<string, number>
}

interface ProductionAutomationProps extends AutomationProps {
  productionCapacity?: number
  leadTime?: number
  priorityThreshold?: number
}

interface InventoryAutomationProps extends AutomationProps {
  reorderThreshold?: number
  alertSettings?: {
    lowStock: boolean
    overStock: boolean
    expiryAlerts: boolean
  }
}

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
  () => import('@/components/automation/smart-financial-dashboard')
    .then(module => ({ default: module.SmartFinancialDashboard }))
)

const LazySmartFinancialDashboard = lazy(
  () => import('@/components/automation/smart-financial-dashboard')
    .then(module => ({ default: module.SmartFinancialDashboard }))
)

const LazySmartProductionPlanner = lazy(
  () => import('@/components/automation/smart-production-planner')
    .then(module => ({ default: module.SmartProductionPlanner }))
)

const LazySmartInventoryManager = lazy(
  () => import('@/components/automation/smart-inventory-manager')
    .then(module => ({ default: module.SmartInventoryManager }))
)

const LazyAdvancedHPPCalculator = lazy(
  () => import('@/components/automation/smart-financial-dashboard')
    .then(module => ({ default: module.SmartFinancialDashboard }))
)

const LazySmartNotificationCenter = lazy(
  () => import('@/components/automation/smart-notifications')
    .then(module => ({ default: module.default }))
)

const LazySmartPricingAssistant = lazy(
  () => import('@/components/automation/smart-pricing-assistant')
    .then(module => ({ default: module.SmartPricingAssistant }))
)

const LazyProductionPlanningDashboard = lazy(
  () => import('@/components/automation/smart-production-planner')
    .then(module => ({ default: module.SmartProductionPlanner }))
)

const LazyInventoryAnalytics = lazy(
  () => import('@/components/automation/smart-inventory-manager')
    .then(module => ({ default: module.SmartInventoryManager }))
)

// Wrapped components with loading states
export const SmartExpenseAutomationWithLoading = (props: FinancialAutomationProps) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Smart Expense Automation" />}>
    <LazySmartExpenseAutomation {...props} />
  </Suspense>
)

export const SmartFinancialDashboardWithLoading = (props: FinancialAutomationProps) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Financial Dashboard" />}>
    <LazySmartFinancialDashboard {...props} />
  </Suspense>
)

export const SmartProductionPlannerWithLoading = (props: ProductionAutomationProps) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Production Planner" />}>
    <LazySmartProductionPlanner {...props} />
  </Suspense>
)

export const SmartInventoryManagerWithLoading = (props: InventoryAutomationProps) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Inventory Manager" />}>
    <LazySmartInventoryManager {...props} />
  </Suspense>
)

export const AdvancedHPPCalculatorWithLoading = (props: FinancialAutomationProps) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="HPP Calculator" />}>
    <LazyAdvancedHPPCalculator {...props} />
  </Suspense>
)

export const SmartNotificationCenterWithLoading = (props: AutomationProps) => (
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

export const SmartPricingAssistantWithLoading = (props: FinancialAutomationProps) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Pricing Assistant" />}>
    <LazySmartPricingAssistant {...props} />
  </Suspense>
)

export const ProductionPlanningDashboardWithLoading = (props: ProductionAutomationProps) => (
  <Suspense fallback={<AutomationLoadingSkeleton title="Production Planning" />}>
    <LazyProductionPlanningDashboard {...props} />
  </Suspense>
)

export const InventoryAnalyticsWithLoading = (props: InventoryAutomationProps) => (
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