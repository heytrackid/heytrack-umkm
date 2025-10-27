'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Page loading skeleton
const PageLoadingSkeleton = () => (
  <div className="space-y-6 p-6">
    {/* Header skeleton */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>

    {/* Stats cards skeleton */}
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Main content skeleton */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

// Simple loading fallback
const SimplePageLoading = ({ title }: { title: string }) => (
  <div className="space-y-6 p-6">
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      <div className="ml-4">
        <h3 className="font-medium">Loading {title}...</h3>
        <p className="text-sm text-muted-foreground">Please wait while we prepare your page</p>
      </div>
    </div>
  </div>
)

// Lazy loaded pages with proper loading states
export const LazyOrdersPage = lazy(() => import('@/components'))
export const LazyProductionPage = lazy(() => import('@/components'))
export const LazyRecipesPage = lazy(() => import('@/components'))
export const LazyExpensesPage = lazy(() => import('@/components'))
export const LazyFinancePage = lazy(() => import('@/components'))
export const LazyInventoryPage = lazy(() => import('@/components'))
export const LazyCustomersPage = lazy(() => import('@/components'))
export const LazyReportsPage = lazy(() => import('@/components'))
export const LazySettingsPage = lazy(() => import('@/components'))

// Page wrapper components
export const OrdersPageWithLoading = () => (
  <Suspense fallback={<SimplePageLoading title="Orders" />}>
    <LazyOrdersPage />
  </Suspense>
)

export const ProductionPageWithLoading = () => (
  <Suspense fallback={<SimplePageLoading title="Production" />}>
    <LazyProductionPage />
  </Suspense>
)

export const RecipesPageWithLoading = () => (
  <Suspense fallback={<SimplePageLoading title="Recipes" />}>
    <LazyRecipesPage />
  </Suspense>
)

export const ExpensesPageWithLoading = () => (
  <Suspense fallback={<SimplePageLoading title="Expenses" />}>
    <LazyExpensesPage />
  </Suspense>
)

export const FinancePageWithLoading = () => (
  <Suspense fallback={<SimplePageLoading title="Finance" />}>
    <LazyFinancePage />
  </Suspense>
)

export const InventoryPageWithLoading = () => (
  <Suspense fallback={<SimplePageLoading title="Inventory" />}>
    <LazyInventoryPage />
  </Suspense>
)

export const CustomersPageWithLoading = () => (
  <Suspense fallback={<SimplePageLoading title="Customers" />}>
    <LazyCustomersPage />
  </Suspense>
)

export const ReportsPageWithLoading = () => (
  <Suspense fallback={<SimplePageLoading title="Reports" />}>
    <LazyReportsPage />
  </Suspense>
)

export const SettingsPageWithLoading = () => (
  <Suspense fallback={<SimplePageLoading title="Settings" />}>
    <LazySettingsPage />
  </Suspense>
)

// Generic page wrapper
export const withPageLoading = (
  importFunc: () => Promise<unknown>,
  pageName: string
) => {
  const LazyPage = lazy(importFunc)
  
  return () => (
    <Suspense fallback={<SimplePageLoading title={pageName} />}>
      <LazyPage />
    </Suspense>
  )
}