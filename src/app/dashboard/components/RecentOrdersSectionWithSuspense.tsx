import { lazy, Suspense } from 'react'

import { RecentOrdersSkeleton } from './RecentOrdersSkeleton'

import type { DashboardComponentProps } from './lazy-types'


const LazyRecentOrdersSection = lazy(() =>
  import('./RecentOrdersSection')
)

const RecentOrdersSectionWithSuspense = (props: DashboardComponentProps): JSX.Element => (
  <Suspense fallback={<RecentOrdersSkeleton />}>
    <LazyRecentOrdersSection {...props} />
  </Suspense>
)

export default RecentOrdersSectionWithSuspense