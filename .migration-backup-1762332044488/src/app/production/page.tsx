'use client'

import AppLayout from '@/components/layout/app-layout'
import dynamic from 'next/dynamic'

// Dynamically import the production page to optimize initial load
const EnhancedProductionPage = dynamic(
  () => import('./components/EnhancedProductionPage').then(mod => mod.EnhancedProductionPage),
  {
    loading: () => (
      <div className="space-y-6 p-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded mt-2 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 bg-muted rounded animate-pulse">
              <div className="h-4 w-1/2 mx-auto bg-muted/70 rounded" />
              <div className="h-8 w-3/4 mx-auto bg-muted/70 rounded mt-2" />
            </div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="p-6 bg-muted rounded animate-pulse">
          <div className="h-4 w-32 bg-muted/70 rounded" />
        </div>

        {/* Production cards skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-muted rounded animate-pulse">
              <div className="h-4 w-3/4 bg-muted/70 rounded" />
              <div className="h-3 w-1/2 bg-muted/70 rounded mt-2" />
              <div className="h-10 w-full bg-muted/70 rounded mt-4" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

const ProductionListPage = () => (
  <AppLayout pageTitle="Production Tracking">
    <EnhancedProductionPage />
  </AppLayout>
)

export default ProductionListPage
