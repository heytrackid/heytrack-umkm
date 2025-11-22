'use client'

import dynamic from 'next/dynamic'

import { AppLayout } from '@/components/layout/app-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { GridSkeleton, StatsSkeleton } from '@/components/ui/skeleton-loader'
import { logger } from '@/lib/logger'

// Dynamically import the production page to optimize initial load
const EnhancedProductionPage = dynamic(
  () => import('./components/EnhancedProductionPage')
    .then(m => m.EnhancedProductionPage)
    .catch((error) => {
      logger.error({ error }, 'Failed to load EnhancedProductionPage:')
      return { default: () => <div className="p-4 text-center text-red-600">Failed to load production page</div> }
    }),
  {
    loading: () => (
      <div className="space-y-6 p-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <StatsSkeleton count={5} />

        {/* Filters skeleton */}
        <div className="p-6 border rounded-lg">
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Production cards skeleton */}
        <GridSkeleton columns={3} items={3} />
      </div>
    ),
    ssr: false
  }
)

const ProductionListPage = (): JSX.Element => (
  <AppLayout pageTitle="Production Tracking">
    <EnhancedProductionPage />
  </AppLayout>
)

export default ProductionListPage