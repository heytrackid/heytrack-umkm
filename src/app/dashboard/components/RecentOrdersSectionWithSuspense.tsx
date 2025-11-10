import { lazy, Suspense } from 'react'

import { RecentOrdersSkeleton } from '@/app/dashboard/components/RecentOrdersSkeleton'

import type { DashboardComponentProps } from '@/app/dashboard/components/lazy-types'


const LazyRecentOrdersSection = lazy(() => import('./RecentOrdersSection').then(m => ({ default: m.RecentOrdersSection })))

const RecentOrdersSectionWithSuspense = (props: DashboardComponentProps): JSX.Element => (
  <Suspense fallback={<RecentOrdersSkeleton />}>
    <LazyRecentOrdersSection {...props} />
  </Suspense>
)

export { RecentOrdersSectionWithSuspense }