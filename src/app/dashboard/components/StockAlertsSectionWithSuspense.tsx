import { lazy, Suspense } from 'react'

import { StockAlertsSkeleton } from './StockAlertsSkeleton'

import type { DashboardComponentProps } from './lazy-types'


const LazyStockAlertsSection = lazy(() =>
  import('./StockAlertsSection')
)

const StockAlertsSectionWithSuspense = (props: DashboardComponentProps): JSX.Element => (
  <Suspense fallback={<StockAlertsSkeleton />}>
    <LazyStockAlertsSection {...props} />
  </Suspense>
)

export default StockAlertsSectionWithSuspense