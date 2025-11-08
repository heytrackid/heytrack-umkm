import { lazy, Suspense } from 'react'

import { StatsCardsSkeleton } from './StatsCardsSkeleton'

import type { DashboardComponentProps, StatsCardsProps } from './lazy-types'


const LazyStatsCardsSection = lazy(() =>
  import('./StatsCardsSection')
)

const StatsCardsSectionWithSuspense = (props: DashboardComponentProps): JSX.Element => (
  <Suspense fallback={<StatsCardsSkeleton />}>
    <LazyStatsCardsSection {...(props as unknown as StatsCardsProps)} />
  </Suspense>
)

export default StatsCardsSectionWithSuspense